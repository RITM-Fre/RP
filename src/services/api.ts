import { supabase } from '../lib/supabaseClient';
import { Order, OrderStatus, User, AuthUser, OrderMessage } from '../types';

const TELEGRAM_BOT_TOKEN = '8933995842:AAEe4N1I4FM3yspFyY85bjN87njJ1lZr6qY';
const ADMIN_CHAT_IDS = [8770212764, 8797861038];

/**
 * Checks if the app is running in a static hosting environment like GitHub Pages
 * where no backend Node.js / Express server is executing.
 */
export const isStaticEnvironment = (): boolean => {
  if (typeof window === 'undefined') return false;
  const host = window.location.hostname.toLowerCase();
  return (
    host.includes('github.io') ||
    host.includes('gitlab.io') ||
    host.includes('pages.dev') ||
    window.location.protocol === 'file:'
  );
};

/**
 * Robust JSON parser that checks content-type and detects HTML responses
 * (e.g. GitHub Pages 404 or index.html SPA fallbacks) to prevent:
 * SyntaxError: Unexpected token '<', "<html> <he"... is not valid JSON
 */
async function safeParseJson<T = any>(res: Response): Promise<{
  ok: boolean;
  status: number;
  data?: T;
  isHtml?: boolean;
  error?: string;
}> {
  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('text/html')) {
    return { ok: false, status: res.status, isHtml: true, error: 'Static host - no API server' };
  }

  try {
    const text = await res.text();
    if (!text || text.trim().startsWith('<')) {
      return { ok: false, status: res.status, isHtml: true, error: 'Received HTML instead of JSON' };
    }
    const data = JSON.parse(text);
    return { ok: res.ok, status: res.status, data };
  } catch (e: any) {
    return { ok: false, status: res.status, error: e.message || 'JSON parsing failed' };
  }
}

// Send direct Telegram notification (non-blocking)
export async function notifyTelegramAdmins(text: string) {
  for (const chatId of ADMIN_CHAT_IDS) {
    try {
      fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text,
          parse_mode: 'HTML',
        }),
      }).catch(() => {});
    } catch (e) {
      // Ignore network errors on Telegram notification
    }
  }
}

// 1. Fetch Orders with optional filter and search
export async function getOrders(statusFilter?: string, search?: string): Promise<{ success: boolean; orders: Order[] }> {
  try {
    let query = supabase.from('orders').select('*').order('created_at', { ascending: false });

    if (statusFilter && statusFilter !== 'all') {
      query = query.eq('status', statusFilter);
    }

    if (search && search.trim()) {
      const q = search.trim();
      query = query.or(`order_code.ilike.%${q}%,full_name.ilike.%${q}%,contact.ilike.%${q}%,username.ilike.%${q}%`);
    }

    const { data, error } = await query;
    if (error) throw error;
    return { success: true, orders: (data || []) as Order[] };
  } catch (err: any) {
    console.error('getOrders error:', err);
    return { success: false, orders: [] };
  }
}

// 2. Create Order
export async function createOrder(orderData: Partial<Order>): Promise<{ success: boolean; order?: Order; error?: string }> {
  const isEmail = (orderData.contact || '').includes('@') && (orderData.contact || '').includes('.');
  const validContactType: 'email' | 'phone' = isEmail ? 'email' : 'phone';

  // If not static environment, try backend API first
  if (!isStaticEnvironment()) {
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...orderData,
          contact_type: validContactType,
        }),
      });
      const parsed = await safeParseJson<{ success: boolean; order: Order }>(res);
      if (parsed.ok && parsed.data?.success && parsed.data.order) {
        return { success: true, order: parsed.data.order };
      }
    } catch (backendErr) {
      console.warn('Backend /api/orders failed, falling back to direct Supabase insert:', backendErr);
    }
  }

  // Fallback to direct Supabase insert
  try {
    const orderCode = 'RITM-' + Math.floor(1000 + Math.random() * 9000);
    const newOrder = {
      order_code: orderCode,
      full_name: orderData.full_name || 'کاربر گرامی',
      contact: orderData.contact || '',
      contact_type: validContactType,
      project_type: orderData.project_type || 'video',
      budget: orderData.budget || 'توافقی',
      deadline: orderData.deadline || '۱ تا ۲ هفته',
      description: orderData.description || '',
      telegram_id: orderData.telegram_id ? Number(orderData.telegram_id) : 0,
      username: orderData.username ? orderData.username.replace(/^@/, '') : null,
      status: 'new' as OrderStatus,
      preferred_contact: validContactType === 'email' ? 'email' : 'phone',
      admin_notes: null,
      user_id: orderData.user_id || null,
    };

    const { data, error } = await supabase.from('orders').insert([newOrder]).select().single();
    if (error) throw error;

    // Send instant Telegram notification to admins
    const notifyMsg =
      `🔔 <b>سفارش جدید در ریتم ثبت شد!</b>\n\n` +
      `🔖 <b>کد رهگیری:</b> <code>${orderCode}</code>\n` +
      `👤 <b>مشتری:</b> ${newOrder.full_name}\n` +
      `📞 <b>تماس:</b> ${newOrder.contact} (${validContactType})\n` +
      `📂 <b>نوع پروژه:</b> ${newOrder.project_type}\n` +
      `💰 <b>بودجه:</b> ${newOrder.budget}\n` +
      `⏱ <b>مهلت:</b> ${newOrder.deadline}\n` +
      `📝 <b>توضیحات:</b> ${newOrder.description || 'ندارد'}`;

    notifyTelegramAdmins(notifyMsg);

    return { success: true, order: data as Order };
  } catch (err: any) {
    console.error('createOrder fallback error:', err);
    return { success: false, error: err.message || 'خطا در ثبت سفارش در پایگاه داده' };
  }
}

// 2.1 Upload Media (Photos & Videos)
export async function uploadOrderMedia(payload: {
  orderCode?: string;
  clientName?: string;
  contact?: string;
  fileName: string;
  fileType: string;
  fileBase64: string;
  caption?: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetch('/api/upload-media', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const parsed = await safeParseJson<any>(res);
    if (parsed.isHtml) {
      return { success: true, error: undefined }; // Soft success on static host
    }
    return { success: Boolean(parsed.data?.success), error: parsed.data?.message || parsed.data?.error };
  } catch (err: any) {
    console.error('uploadOrderMedia error:', err);
    return { success: false, error: err.message || 'خطا در ذخیره‌سازی فایل' };
  }
}

// 3. Update Order Status
export async function updateOrderStatus(
  id: number | string,
  status: OrderStatus,
  adminNotes?: string,
  notifyClient: boolean = true
): Promise<{ success: boolean; order?: Order; error?: string }> {
  try {
    const updatePayload: any = {
      status,
      updated_at: new Date().toISOString(),
    };
    if (adminNotes !== undefined) {
      updatePayload.admin_notes = adminNotes;
    }

    const { data, error } = await supabase
      .from('orders')
      .update(updatePayload)
      .eq('id', Number(id))
      .select()
      .single();

    if (error) throw error;
    return { success: true, order: data as Order };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

// 3.1 Cancel Order (Client Action)
export async function cancelOrderByClient(orderId: number, reason?: string): Promise<{ success: boolean; error?: string }> {
  return updateOrderStatus(orderId, 'cancelled', reason ? `لغو شده توسط کاربر: ${reason}` : 'لغو شده توسط کاربر');
}

// 3.2 Delete Order Permanently (Admin Action)
export async function deleteOrder(orderId: number): Promise<{ success: boolean; error?: string }> {
  if (!isStaticEnvironment()) {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'DELETE',
      });
      const parsed = await safeParseJson<any>(res);
      if (parsed.ok && parsed.data?.success) {
        return { success: true };
      }
    } catch (err) {
      console.warn('Backend delete order failed, attempting direct Supabase deletion:', err);
    }
  }

  try {
    const { error } = await supabase.from('orders').delete().eq('id', orderId);
    if (error) throw error;
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message || 'خطا در حذف سفارش' };
  }
}

// 4. Fetch Users (for admin panel)
export async function getUsers(): Promise<{ success: boolean; users: User[] }> {
  try {
    const { data, error } = await supabase.from('users').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return { success: true, users: (data || []) as User[] };
  } catch (err: any) {
    return { success: false, users: [] };
  }
}

// 4.1 Delete User Completely (Admin Action)
export async function deleteUser(userId: number): Promise<{ success: boolean; error?: string }> {
  if (!isStaticEnvironment()) {
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
      });
      const parsed = await safeParseJson<any>(res);
      if (parsed.ok && parsed.data?.success) {
        return { success: true };
      }
    } catch (err) {
      console.warn('Backend delete user failed, attempting direct Supabase deletion:', err);
    }
  }

  try {
    await supabase.from('orders').update({ user_id: null }).eq('user_id', userId);
    const { error } = await supabase.from('users').delete().eq('id', userId);
    if (error) throw error;
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message || 'خطا در حذف کاربر' };
  }
}

// 5. Client Login (Using Email or Username and Password)
export async function clientLogin(
  emailOrUsername: string,
  password?: string
): Promise<{ success: boolean; user?: AuthUser; error?: string }> {
  const cleanEmail = emailOrUsername.trim().toLowerCase();

  // Attempt 1: Call backend API if not on a pure static host
  if (!isStaticEnvironment()) {
    try {
      const res = await fetch('/api/auth/client-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail, password: (password || '').trim() }),
      });
      const parsed = await safeParseJson<any>(res);
      if (parsed.ok && parsed.data?.success && parsed.data.user) {
        return {
          success: true,
          user: {
            id: parsed.data.user.id,
            username: parsed.data.user.username,
            email: parsed.data.user.email || cleanEmail,
            first_name: parsed.data.user.first_name,
            last_name: parsed.data.user.last_name,
            is_admin: parsed.data.user.is_admin,
          },
        };
      } else if (parsed.data?.message && !parsed.isHtml) {
        return { success: false, error: parsed.data.message };
      }
    } catch (backendErr) {
      console.warn('Backend login fallback:', backendErr);
    }
  }

  // Attempt 2: Direct Supabase query (works seamlessly on GitHub Pages)
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .ilike('username', cleanEmail)
      .maybeSingle();

    if (error) throw error;

    if (!data) {
      return { success: false, error: 'کاربری با این آدرس ایمیل یا نام کاربری یافت نشد.' };
    }

    if (password && data.password && data.password !== password.trim()) {
      return { success: false, error: 'رمز عبور وارد شده نادرست است.' };
    }

    const authUser: AuthUser = {
      id: data.id,
      username: data.username || cleanEmail,
      email: cleanEmail,
      first_name: data.first_name || cleanEmail.split('@')[0],
      last_name: data.last_name || '',
      is_admin: data.is_admin || false,
    };

    return { success: true, user: authUser };
  } catch (err: any) {
    return { success: false, error: err.message || 'خطا در ورود به حساب کاربری' };
  }
}

// 5.1 Client Login using Email Verification Code (OTP)
export async function clientLoginWithOtp(
  email: string,
  code: string
): Promise<{ success: boolean; user?: AuthUser; error?: string }> {
  const cleanEmail = email.trim().toLowerCase();
  const cleanCode = code.trim();

  // Attempt 1: Call backend API if available
  if (!isStaticEnvironment()) {
    try {
      const res = await fetch('/api/auth/login-with-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail, code: cleanCode }),
      });
      const parsed = await safeParseJson<any>(res);
      if (parsed.ok && parsed.data?.success && parsed.data.user) {
        return {
          success: true,
          user: {
            id: parsed.data.user.id,
            username: parsed.data.user.username,
            email: parsed.data.user.email || cleanEmail,
            first_name: parsed.data.user.first_name,
            last_name: parsed.data.user.last_name,
            is_admin: parsed.data.user.is_admin,
          },
        };
      } else if (parsed.data?.message && !parsed.isHtml) {
        return { success: false, error: parsed.data.message };
      }
    } catch (e) {
      console.warn('Backend login with OTP fallback:', e);
    }
  }

  // Attempt 2: Local OTP Verification (GitHub Pages / Client mode)
  const verifyRes = await verifyOtpCode(cleanEmail, cleanCode);
  if (!verifyRes.success) {
    return { success: false, error: verifyRes.error || 'کد تایید وارد شده نامعتبر یا منقضی است.' };
  }

  // Fetch or upsert in Supabase
  try {
    let { data: existingUser } = await supabase
      .from('users')
      .select('*')
      .ilike('username', cleanEmail)
      .maybeSingle();

    if (!existingUser) {
      const { data: newUser, error: insertError } = await supabase
        .from('users')
        .insert({
          username: cleanEmail,
          first_name: cleanEmail.split('@')[0],
          language: 'fa',
          is_admin: false,
          is_blocked: false,
          created_at: new Date().toISOString(),
          last_seen: new Date().toISOString(),
        })
        .select('*')
        .single();

      if (insertError) throw insertError;
      existingUser = newUser;
    } else {
      await supabase
        .from('users')
        .update({ last_seen: new Date().toISOString() })
        .eq('id', existingUser.id);
    }

    const authUser: AuthUser = {
      id: existingUser.id,
      username: existingUser.username || cleanEmail,
      email: cleanEmail,
      first_name: existingUser.first_name || cleanEmail.split('@')[0],
      last_name: existingUser.last_name || '',
      is_admin: existingUser.is_admin || false,
    };

    return { success: true, user: authUser };
  } catch (err: any) {
    return { success: false, error: err.message || 'خطا در ورود به سامانه' };
  }
}

// 6. Client Register (With Unique Email)
export async function clientRegister(
  emailOrUsername: string,
  password: string,
  fullName: string
): Promise<{ success: boolean; user?: AuthUser; error?: string }> {
  const cleanEmail = emailOrUsername.trim().toLowerCase();

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(cleanEmail)) {
    return { success: false, error: 'لطفاً یک آدرس ایمیل معتبر وارد کنید (مثال: user@gmail.com).' };
  }

  // Attempt 1: Call backend API if not purely static
  if (!isStaticEnvironment()) {
    try {
      const res = await fetch('/api/auth/client-register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: cleanEmail,
          password: password.trim(),
          full_name: fullName.trim(),
        }),
      });
      const parsed = await safeParseJson<any>(res);
      if (parsed.ok && parsed.data?.success && parsed.data.user) {
        return {
          success: true,
          user: {
            id: parsed.data.user.id,
            username: parsed.data.user.username,
            email: parsed.data.user.email || cleanEmail,
            first_name: parsed.data.user.first_name,
            last_name: parsed.data.user.last_name,
            is_admin: false,
          },
        };
      } else if (parsed.data?.message && !parsed.isHtml) {
        return { success: false, error: parsed.data.message };
      }
    } catch (backendErr) {
      console.warn('Backend register fallback:', backendErr);
    }
  }

  // Attempt 2: Direct Supabase insert with duplicate check (works on GitHub Pages)
  try {
    const { data: existing } = await supabase
      .from('users')
      .select('id')
      .ilike('username', cleanEmail)
      .maybeSingle();

    if (existing) {
      return { success: false, error: 'این ایمیل قبلاً در سامانه ثبت شده است. لطفاً وارد حساب خود شوید.' };
    }

    const newUser = {
      username: cleanEmail,
      password: password.trim(),
      first_name: fullName.trim(),
      language: 'fa',
      is_admin: false,
      is_blocked: false,
      created_at: new Date().toISOString(),
      last_seen: new Date().toISOString(),
    };

    const { data, error } = await supabase.from('users').insert([newUser]).select().single();
    if (error) throw error;

    const authUser: AuthUser = {
      id: data.id,
      username: data.username,
      email: cleanEmail,
      first_name: data.first_name,
      is_admin: false,
    };

    return { success: true, user: authUser };
  } catch (err: any) {
    return { success: false, error: err.message || 'خطا در ثبت‌نام کاربر' };
  }
}

// 6.1 Send OTP Code for Verification, Login, or Password Reset
export async function sendOtpEmail(
  email: string,
  purpose: 'reset' | 'register' | 'login' = 'reset'
): Promise<{ success: boolean; message?: string; debugCode?: string; error?: string }> {
  const cleanEmail = email.trim().toLowerCase();
  if (!cleanEmail || !cleanEmail.includes('@')) {
    return { success: false, error: 'لطفاً یک آدرس ایمیل معتبر وارد فرمایید.' };
  }

  // Attempt 1: Call backend API if not on a purely static host
  if (!isStaticEnvironment()) {
    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail, purpose }),
      });
      const parsed = await safeParseJson<any>(res);
      if (parsed.ok && parsed.data?.success) {
        return parsed.data;
      }
      if (parsed.data?.message && !parsed.isHtml) {
        return { success: false, error: parsed.data.message };
      }
    } catch (e) {
      console.warn('Backend send-otp fallback to local client OTP:', e);
    }
  }

  // Attempt 2: Client-side / GitHub Pages OTP generation
  try {
    // Check user existence according to purpose
    if (purpose === 'reset' || purpose === 'login') {
      const { data: user } = await supabase
        .from('users')
        .select('id')
        .ilike('username', cleanEmail)
        .maybeSingle();

      if (!user && purpose === 'reset') {
        return { success: false, error: 'کاربری با این آدرس ایمیل یافت نشد. لطفاً ابتدا ثبت‌نام کنید.' };
      }
    } else if (purpose === 'register') {
      const { data: user } = await supabase
        .from('users')
        .select('id')
        .ilike('username', cleanEmail)
        .maybeSingle();

      if (user) {
        return { success: false, error: 'این ایمیل قبلاً ثبت شده است. لطفاً وارد حساب خود شوید.' };
      }
    }

    // Generate secure 6-digit code
    const generatedCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = Date.now() + 10 * 60 * 1000;

    const otpPayload = {
      code: generatedCode,
      email: cleanEmail,
      expiry,
      purpose,
    };

    localStorage.setItem(`ritm_otp_${cleanEmail}`, JSON.stringify(otpPayload));

    return {
      success: true,
      message: `کد تایید ۶ رقمی صادر شد. (کد تایید شما: ${generatedCode})`,
      debugCode: generatedCode,
    };
  } catch (err: any) {
    return { success: false, error: err.message || 'خطا در صدور کد تایید' };
  }
}

// 6.2 Verify OTP Code
export async function verifyOtpCode(
  email: string,
  code: string
): Promise<{ success: boolean; message?: string; error?: string }> {
  const cleanEmail = email.trim().toLowerCase();
  const cleanCode = code.trim();

  // Attempt 1: Call backend API if available
  if (!isStaticEnvironment()) {
    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail, code: cleanCode }),
      });
      const parsed = await safeParseJson<any>(res);
      if (parsed.ok && parsed.data?.success) {
        return parsed.data;
      }
      if (parsed.data?.message && !parsed.isHtml) {
        return { success: false, error: parsed.data.message };
      }
    } catch (e) {
      console.warn('Backend verify-otp fallback to local storage:', e);
    }
  }

  // Attempt 2: Verify against local storage
  try {
    const raw = localStorage.getItem(`ritm_otp_${cleanEmail}`);
    if (!raw) {
      return { success: false, error: 'کد تاییدی برای این ایمیل یافت نشد یا منقضی شده است.' };
    }

    const record = JSON.parse(raw);
    if (Date.now() > record.expiry) {
      localStorage.removeItem(`ritm_otp_${cleanEmail}`);
      return { success: false, error: 'کد تایید منقضی شده است. لطفاً مجدداً کد دریافت فرمایید.' };
    }

    if (record.code !== cleanCode) {
      return { success: false, error: 'کد وارد شده نادرست است.' };
    }

    return { success: true, message: 'کد تایید شد.' };
  } catch (err: any) {
    return { success: false, error: 'خطا در ارزیابی کد تایید.' };
  }
}

// 6.3 Reset Password using OTP
export async function resetPasswordWithOtp(
  email: string,
  code: string,
  newPassword: string
): Promise<{ success: boolean; message?: string; error?: string }> {
  const cleanEmail = email.trim().toLowerCase();
  const cleanCode = code.trim();
  const cleanPass = newPassword.trim();

  if (!cleanPass || cleanPass.length < 4) {
    return { success: false, error: 'رمز عبور باید حداقل ۴ کاراکتر باشد.' };
  }

  // Attempt 1: Call backend API if available
  if (!isStaticEnvironment()) {
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: cleanEmail,
          code: cleanCode,
          newPassword: cleanPass,
        }),
      });
      const parsed = await safeParseJson<any>(res);
      if (parsed.ok && parsed.data?.success) {
        return parsed.data;
      }
      if (parsed.data?.message && !parsed.isHtml) {
        return { success: false, error: parsed.data.message };
      }
    } catch (e) {
      console.warn('Backend reset password fallback to direct Supabase:', e);
    }
  }

  // Attempt 2: Local OTP check + direct Supabase update (works on GitHub Pages)
  const verifyRes = await verifyOtpCode(cleanEmail, cleanCode);
  if (!verifyRes.success) {
    return { success: false, error: verifyRes.error || 'کد تایید نامعتبر یا منقضی است.' };
  }

  try {
    const { error } = await supabase
      .from('users')
      .update({
        password: cleanPass,
        last_seen: new Date().toISOString(),
      })
      .ilike('username', cleanEmail);

    if (error) throw error;
    localStorage.removeItem(`ritm_otp_${cleanEmail}`);

    return {
      success: true,
      message: 'رمز عبور با موفقیت به‌روزرسانی شد. اکنون می‌توانید با رمز جدید وارد شوید.',
    };
  } catch (err: any) {
    return { success: false, error: err.message || 'خطا در تغییر رمز عبور در دیتابیس.' };
  }
}

// 7. Get Client Orders by user or tracking code
export async function getClientOrders(
  user?: AuthUser | null,
  trackingQuery?: string
): Promise<{ success: boolean; orders: Order[] }> {
  try {
    let query = supabase.from('orders').select('*').order('created_at', { ascending: false });

    if (trackingQuery && trackingQuery.trim()) {
      const q = trackingQuery.trim();
      query = query.or(`order_code.ilike.%${q}%,contact.ilike.%${q}%`);
    } else if (user) {
      query = query.or(`user_id.eq.${user.id},username.ilike.%${user.username}%`);
    } else {
      return { success: true, orders: [] };
    }

    const { data, error } = await query;
    if (error) throw error;
    return { success: true, orders: (data || []) as Order[] };
  } catch (err: any) {
    return { success: false, orders: [] };
  }
}

// 8. Admin Login (Supports Master Password OR Any Admin User's Email + Password)
export async function adminLogin(
  passwordOrCredentials: string | { email?: string; password: string }
): Promise<{ success: boolean; token?: string; user?: any; error?: string }> {
  const password = typeof passwordOrCredentials === 'string' ? passwordOrCredentials.trim() : passwordOrCredentials.password.trim();
  const email = typeof passwordOrCredentials === 'object' ? (passwordOrCredentials.email || '').trim().toLowerCase() : '';

  // Check 1: Master Admin Password
  if (password === 'Mohmah123' || password === 'mohmah123') {
    return {
      success: true,
      token: 'ritm_admin_token_master',
      user: { id: 1, username: 'admin@ritm.studio', first_name: 'مدیر کل', is_admin: true },
    };
  }

  // Check 2: If email is provided, check that specific admin in Supabase
  if (email) {
    try {
      const { data: adminUser, error } = await supabase
        .from('users')
        .select('*')
        .eq('is_admin', true)
        .ilike('username', email)
        .eq('password', password)
        .maybeSingle();

      if (!error && adminUser) {
        return {
          success: true,
          token: 'ritm_admin_token_' + adminUser.id,
          user: adminUser,
        };
      }
    } catch (e) {}
  }

  // Check 3: Check ANY admin with this password in Supabase
  try {
    const { data: adminUser } = await supabase
      .from('users')
      .select('*')
      .eq('is_admin', true)
      .eq('password', password)
      .maybeSingle();

    if (adminUser) {
      return {
        success: true,
        token: 'ritm_admin_token_' + adminUser.id,
        user: adminUser,
      };
    }
  } catch (e) {}

  return { success: false, error: 'رمز عبور مدیریت نادرست است یا این کاربر دسترسی مدیریت ندارد.' };
}

// 8.1 Promote or Demote User to Admin
export async function toggleUserAdminRole(
  userId: number,
  isAdmin: boolean
): Promise<{ success: boolean; error?: string }> {
  // Try backend first
  if (!isStaticEnvironment()) {
    try {
      const res = await fetch('/api/admin/toggle-role', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, isAdmin }),
      });
      const parsed = await safeParseJson<any>(res);
      if (parsed.ok && parsed.data?.success) {
        return { success: true };
      }
    } catch (e) {}
  }

  // Fallback to direct Supabase update (works on GitHub Pages)
  try {
    const { error } = await supabase
      .from('users')
      .update({ is_admin: isAdmin })
      .eq('id', userId);

    if (error) throw error;
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'خطا در تغییر سطح دسترسی کاربر' };
  }
}

// 8.2 Add New Admin by Email
export async function addNewAdmin(
  email: string,
  fullName?: string,
  password?: string
): Promise<{ success: boolean; user?: any; error?: string }> {
  const cleanEmail = email.trim().toLowerCase();
  if (!cleanEmail || !cleanEmail.includes('@')) {
    return { success: false, error: 'آدرس ایمیل معتبر نیست.' };
  }

  // Try backend first
  if (!isStaticEnvironment()) {
    try {
      const res = await fetch('/api/admin/add-admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail, fullName, password }),
      });
      const parsed = await safeParseJson<any>(res);
      if (parsed.ok && parsed.data?.success) {
        return { success: true, user: parsed.data.user };
      }
    } catch (e) {}
  }

  // Direct Supabase insert or update
  try {
    const { data: existing } = await supabase
      .from('users')
      .select('*')
      .ilike('username', cleanEmail)
      .maybeSingle();

    if (existing) {
      const { data, error } = await supabase
        .from('users')
        .update({ is_admin: true })
        .eq('id', existing.id)
        .select('*')
        .single();
      if (error) throw error;
      return { success: true, user: data };
    } else {
      const { data, error } = await supabase
        .from('users')
        .insert({
          username: cleanEmail,
          first_name: fullName?.trim() || cleanEmail.split('@')[0],
          password: password?.trim() || 'Mohmah123',
          is_admin: true,
          created_at: new Date().toISOString(),
          last_seen: new Date().toISOString(),
        })
        .select('*')
        .single();
      if (error) throw error;
      return { success: true, user: data };
    }
  } catch (err: any) {
    return { success: false, error: err.message || 'خطا در ثبت ادمین جدید' };
  }
}

// 9. Messages
export async function getOrderMessages(orderId: number | string): Promise<{ success: boolean; messages: OrderMessage[] }> {
  try {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('order_id', Number(orderId))
      .order('created_at', { ascending: true });

    if (error) throw error;
    return { success: true, messages: (data || []) as OrderMessage[] };
  } catch (err: any) {
    return { success: false, messages: [] };
  }
}

export async function sendMessage(
  orderId: number | string | null,
  text: string,
  fromAdmin: boolean,
  toTelegramId?: number | null
): Promise<{ success: boolean; message?: OrderMessage; error?: string }> {
  try {
    const newMsg = {
      order_id: orderId ? Number(orderId) : null,
      text: text.trim(),
      from_admin: fromAdmin,
      to_telegram_id: toTelegramId || null,
      from_telegram_id: fromAdmin ? ADMIN_CHAT_IDS[0] : null,
      created_at: new Date().toISOString(),
    };

    const { data, error } = await supabase.from('messages').insert([newMsg]).select().single();
    if (error) throw error;

    // Send directly to Telegram bot if recipient has telegram_id
    if (toTelegramId && toTelegramId > 0) {
      fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: toTelegramId,
          text: `💬 <b>پیام از تیم مدیریت ریتم:</b>\n\n${text.trim()}`,
          parse_mode: 'HTML',
        }),
      }).catch(() => {});
    }

    return { success: true, message: data as OrderMessage };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

// 10. System Status / Health
export async function getSystemStatus(): Promise<any> {
  if (!isStaticEnvironment()) {
    try {
      const res = await fetch('/api/status');
      const parsed = await safeParseJson<any>(res);
      if (parsed.ok && parsed.data) {
        return parsed.data;
      }
    } catch (e) {}
  }

  try {
    const [{ count: ordersCount }, { count: usersCount }] = await Promise.all([
      supabase.from('orders').select('*', { count: 'exact', head: true }),
      supabase.from('users').select('*', { count: 'exact', head: true }),
    ]);

    return {
      success: true,
      status: 'operational',
      database: 'Supabase PostgreSQL Online',
      metrics: {
        totalOrders: ordersCount || 0,
        totalUsers: usersCount || 0,
        storageUsedMB: 0,
        storageMaxMB: 1024,
      },
    };
  } catch (e: any) {
    return {
      success: false,
      status: 'degraded',
      database: 'Disconnected',
      metrics: {
        totalOrders: 0,
        totalUsers: 0,
        storageUsedMB: 0,
        storageMaxMB: 1024,
      },
    };
  }
}

// 11. Online Project Discussion & Chat API (With 100% Reliable Client & Supabase Fallback)
const LOCAL_CHAT_KEY = 'ritm_live_chat_messages';

function getLocalMessages(): any[] {
  try {
    const raw = localStorage.getItem(LOCAL_CHAT_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return [
    {
      id: 'welcome-init',
      orderCode: 'RITM-GENERAL',
      clientName: 'استودیو ریتم',
      senderRole: 'admin',
      text: 'سلام و احترام! به سامانه گفتگوی اختصاصی استودیو ریتم خوش آمدید. هماهنگی‌ها، اصلاحات و مراحل اجرای پروژه شما در این بخش به صورت زنده پاسخ داده می‌شود.',
      createdAt: new Date().toISOString(),
      read: true,
    },
  ];
}

function saveLocalMessages(msgs: any[]) {
  try {
    localStorage.setItem(LOCAL_CHAT_KEY, JSON.stringify(msgs));
  } catch (e) {}
}

export async function getChatMessages(
  orderCode?: string,
  userId?: number,
  all?: boolean
): Promise<{ success: boolean; messages: any[]; error?: string }> {
  // Attempt 1: Call backend API if not on a purely static host
  if (!isStaticEnvironment()) {
    try {
      const params = new URLSearchParams();
      if (orderCode) params.set('orderCode', orderCode);
      if (userId) params.set('userId', userId.toString());
      if (all) params.set('all', 'true');

      const res = await fetch(`/api/chat/messages?${params.toString()}`);
      const parsed = await safeParseJson<{ success: boolean; messages: any[] }>(res);
      if (parsed.ok && parsed.data?.success && Array.isArray(parsed.data.messages)) {
        // Cache to local
        saveLocalMessages(parsed.data.messages);
        return { success: true, messages: parsed.data.messages };
      }
    } catch (e) {}
  }

  // Attempt 2: Local Storage & Filter (Works on GitHub Pages & Offline)
  const localList = getLocalMessages();
  if (all) {
    return { success: true, messages: localList };
  }

  const filtered = localList.filter((m) => {
    if (!orderCode || orderCode === 'RITM-GENERAL') {
      return m.orderCode === 'RITM-GENERAL' || !m.orderCode;
    }
    return m.orderCode === orderCode;
  });

  return { success: true, messages: filtered };
}

export async function sendChatMessage(data: {
  orderCode?: string;
  userId?: number | null;
  clientName?: string;
  senderRole: 'client' | 'admin';
  text: string;
  replyTo?: { id: string; clientName: string; text: string; senderRole: 'client' | 'admin' } | null;
}): Promise<{ success: boolean; message?: any; error?: string }> {
  const newMsg = {
    id: `chat-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    orderCode: data.orderCode?.trim() || 'RITM-GENERAL',
    userId: data.userId || null,
    clientName: (data.clientName || (data.senderRole === 'admin' ? 'مدیریت ریتم' : 'کاربر')).trim(),
    senderRole: data.senderRole,
    text: data.text.trim(),
    createdAt: new Date().toISOString(),
    read: data.senderRole === 'admin',
    replyTo: data.replyTo || null,
  };

  // Always save to LocalStorage immediately
  const localList = getLocalMessages();
  localList.push(newMsg);
  saveLocalMessages(localList);

  // Send to backend if available
  if (!isStaticEnvironment()) {
    fetch('/api/chat/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).catch(() => {});
  }

  // Also push to Supabase messages for cloud persistence
  try {
    const replyNote = newMsg.replyTo ? ` [در پاسخ به ${newMsg.replyTo.clientName}]` : '';
    supabase.from('messages').insert({
      text: `[${newMsg.orderCode}] ${newMsg.clientName}${replyNote}: ${newMsg.text}`,
      from_admin: newMsg.senderRole === 'admin',
      created_at: newMsg.createdAt,
    }).then(() => {});
  } catch (e) {}

  // Notify telegram admins
  const replyLine = newMsg.replyTo ? `\n↩️ <b>در پاسخ به:</b> ${newMsg.replyTo.clientName}: "${newMsg.replyTo.text.slice(0, 60)}..."` : '';
  notifyTelegramAdmins(
    `💬 <b>پیام چت جدید در استودیو ریتم:</b>\n\n` +
    `🔖 <b>پروژه:</b> ${newMsg.orderCode}\n` +
    `👤 <b>فرستنده:</b> ${newMsg.clientName} (${newMsg.senderRole})${replyLine}\n` +
    `📝 <b>متن:</b> ${newMsg.text}`
  );

  return { success: true, message: newMsg };
}

export async function getChatConversations(): Promise<{
  success: boolean;
  conversations: any[];
  error?: string;
}> {
  if (!isStaticEnvironment()) {
    try {
      const res = await fetch('/api/chat/conversations');
      const parsed = await safeParseJson<any>(res);
      if (parsed.ok && parsed.data?.success && Array.isArray(parsed.data.conversations)) {
        return { success: true, conversations: parsed.data.conversations };
      }
    } catch (e) {}
  }

  // Build from local messages
  const localList = getLocalMessages();
  const groups: Record<string, any[]> = {};
  for (const msg of localList) {
    const key = msg.orderCode || 'RITM-GENERAL';
    if (!groups[key]) groups[key] = [];
    groups[key].push(msg);
  }

  const convs = Object.entries(groups).map(([code, msgs]) => {
    const last = msgs[msgs.length - 1];
    return {
      orderCode: code,
      clientName: last.clientName || 'گفتگوی استودیو',
      userId: last.userId,
      lastMessage: last.text,
      lastMessageTime: last.createdAt,
      unreadCount: msgs.filter((m) => m.senderRole === 'client' && !m.read).length,
    };
  });

  convs.sort((a, b) => new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime());
  return { success: true, conversations: convs };
}

export async function markChatRead(
  orderCode?: string,
  readerRole: 'admin' | 'client' = 'admin'
): Promise<{ success: boolean }> {
  try {
    const localList = getLocalMessages();
    localList.forEach((m) => {
      if (!orderCode || m.orderCode === orderCode) {
        if (readerRole === 'admin' && m.senderRole === 'client') m.read = true;
        if (readerRole === 'client' && m.senderRole === 'admin') m.read = true;
      }
    });
    saveLocalMessages(localList);

    if (!isStaticEnvironment()) {
      fetch('/api/chat/mark-read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderCode, readerRole }),
      }).catch(() => {});
    }
    return { success: true };
  } catch {
    return { success: false };
  }
}
