import React, { useState, useEffect } from 'react';
import {
  Shield,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Send,
  AlertCircle,
  Users,
  RefreshCw,
  MessageSquare,
  FileText,
  X,
  ExternalLink,
  LogOut,
  Trash2,
  Settings,
  Megaphone,
  HardDrive,
  Download,
  FolderOpen,
  Sparkles,
  Paperclip,
  UserCheck,
  UserPlus,
  ShieldCheck,
  ShieldAlert,
  Mail,
  Key,
} from 'lucide-react';
import { Order, User, OrderStatus } from '../types';
import {
  getOrders,
  getUsers,
  updateOrderStatus,
  sendMessage,
  deleteUser,
  deleteOrder,
  toggleUserAdminRole,
  addNewAdmin,
} from '../services/api';

interface StorageFile {
  id: string;
  orderCode: string;
  clientName: string;
  contact: string;
  fileName: string;
  storedFileName: string;
  fileType: string;
  sizeBytes: number;
  uploadDate: string;
  caption?: string;
  url: string;
}

interface AdminPanelProps {
  lang: 'fa' | 'en';
  onLogout?: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ lang, onLogout }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Status update state
  const [newStatus, setNewStatus] = useState<OrderStatus>('new');
  const [adminNotes, setAdminNotes] = useState('');
  const [notifyClient, setNotifyClient] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  // Direct Message state
  const [directMessage, setDirectMessage] = useState('');
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [messageSuccess, setMessageSuccess] = useState('');

  // Active view inside admin: 'orders' | 'users' | 'storage' | 'settings'
  const [adminSubTab, setAdminSubTab] = useState<'orders' | 'users' | 'storage' | 'settings'>('orders');

  // Storage Management State (1 GB Total)
  const [storageFiles, setStorageFiles] = useState<StorageFile[]>([]);
  const [storageUsedMB, setStorageUsedMB] = useState(0);
  const [storageUsedPercent, setStorageUsedPercent] = useState(0);
  const [storageLoading, setStorageLoading] = useState(false);
  const [fileDeletingId, setFileDeletingId] = useState<string | null>(null);

  // User Deletion state
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [isDeletingUser, setIsDeletingUser] = useState(false);

  // Order Deletion state (Admin Action)
  const [orderToDelete, setOrderToDelete] = useState<Order | null>(null);
  const [isDeletingOrder, setIsDeletingOrder] = useState(false);

  // Admin Management State
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newAdminName, setNewAdminName] = useState('');
  const [newAdminPass, setNewAdminPass] = useState('');
  const [isAddingAdmin, setIsAddingAdmin] = useState(false);
  const [adminActionSuccess, setAdminActionSuccess] = useState('');
  const [adminActionError, setAdminActionError] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState<'all' | 'admins' | 'regular'>('all');

  const handleToggleAdmin = async (targetUser: User) => {
    const nextAdminState = !targetUser.is_admin;
    setAdminActionError('');
    setAdminActionSuccess('');

    try {
      const res = await toggleUserAdminRole(targetUser.id, nextAdminState);
      if (res.success) {
        setUsers((prev) => prev.map((u) => (u.id === targetUser.id ? { ...u, is_admin: nextAdminState } : u)));
        setAdminActionSuccess(
          nextAdminState
            ? `سطح دسترسی کاربر «${targetUser.first_name || targetUser.username}» به مدیر ارتقا یافت و دسترسی به پنل‌ها فعال شد.`
            : `دسترسی مدیریت از کاربر «${targetUser.first_name || targetUser.username}» سلب شد.`
        );
        setTimeout(() => setAdminActionSuccess(''), 5000);
      } else {
        setAdminActionError(res.error || 'خطا در تغییر سطح دسترسی');
        setTimeout(() => setAdminActionError(''), 5000);
      }
    } catch (e: any) {
      setAdminActionError(e.message || 'خطا در اتصال به سرور');
      setTimeout(() => setAdminActionError(''), 5000);
    }
  };

  const handleAddNewAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAdminEmail.trim()) return;

    setAdminActionError('');
    setAdminActionSuccess('');
    setIsAddingAdmin(true);
    try {
      const res = await addNewAdmin(newAdminEmail.trim(), newAdminName.trim(), newAdminPass.trim() || 'Mohmah123');
      if (res.success) {
        setAdminActionSuccess(`مدیر جدید «${newAdminEmail.trim()}» با موفقیت ثبت شد و دسترسی کامل به پنل‌ها اعطا گردید.`);
        setNewAdminEmail('');
        setNewAdminName('');
        setNewAdminPass('');
        fetchData();
        setTimeout(() => setAdminActionSuccess(''), 5000);
      } else {
        setAdminActionError(res.error || 'خطا در افزودن مدیر');
        setTimeout(() => setAdminActionError(''), 5000);
      }
    } catch (e: any) {
      setAdminActionError(e.message || 'خطا در ارتباط با سرور');
      setTimeout(() => setAdminActionError(''), 5000);
    } finally {
      setIsAddingAdmin(false);
    }
  };

  const handleDeleteOrder = async () => {
    if (!orderToDelete) return;
    setIsDeletingOrder(true);
    try {
      const res = await deleteOrder(orderToDelete.id);
      if (res.success) {
        setOrders((prev) => prev.filter((o) => o.id !== orderToDelete.id));
        if (selectedOrder?.id === orderToDelete.id) {
          setSelectedOrder(null);
        }
        setOrderToDelete(null);
      }
    } catch (e) {
      console.error('Failed to delete order:', e);
    } finally {
      setIsDeletingOrder(false);
    }
  };

  // System Settings state
  const [settingsOrdersOpen, setSettingsOrdersOpen] = useState(() => {
    return localStorage.getItem('ritm_orders_open') !== 'false';
  });
  const [telegramChannel, setTelegramChannel] = useState(() => {
    return localStorage.getItem('ritm_tg_channel') || '@RITM_FreeLancer';
  });
  const [globalAnnouncement, setGlobalAnnouncement] = useState(() => {
    return localStorage.getItem('ritm_announcement') || '';
  });
  const [settingsSavedMessage, setSettingsSavedMessage] = useState('');

  // Gmail / SMTP configuration state (Active and Verified)
  const [smtpUser, setSmtpUser] = useState('ritm.freelancer@gmail.com');
  const [smtpPass, setSmtpPass] = useState('');
  const [smtpTestEmail, setSmtpTestEmail] = useState('');
  const [smtpConfigured, setSmtpConfigured] = useState(true);
  const [smtpConfiguredUser, setSmtpConfiguredUser] = useState('ri***@gmail.com');
  const [isSavingSmtp, setIsSavingSmtp] = useState(false);
  const [smtpFeedback, setSmtpFeedback] = useState<{ success?: string; error?: string }>({});

  const fetchSmtpConfig = async () => {
    try {
      const res = await fetch('/api/admin/smtp-config');
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setSmtpConfigured(Boolean(data.configured));
          setSmtpConfiguredUser(data.user || '');
        }
      }
    } catch (e) {}
  };

  const handleSaveSmtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setSmtpFeedback({});
    if (!smtpUser.trim() || !smtpPass.trim()) {
      setSmtpFeedback({ error: 'لطفاً آدرس جیمیل و رمز اختصاصی برنامه (App Password) گوگل را وارد کنید.' });
      return;
    }

    setIsSavingSmtp(true);
    try {
      const res = await fetch('/api/admin/smtp-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user: smtpUser.trim(),
          pass: smtpPass.trim(),
          testEmail: smtpTestEmail.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setSmtpFeedback({ success: data.message || 'سرویس جیمیل با موفقیت متصل شد!' });
        setSmtpConfigured(true);
        setSmtpConfiguredUser(smtpUser.trim().replace(/(.{2})(.*)(@.*)/, '$1***$3'));
        setSmtpPass('');
      } else {
        setSmtpFeedback({ error: data.error || data.message || 'خطا در برقراری ارتباط با سرویس گوگل' });
      }
    } catch (err: any) {
      setSmtpFeedback({ error: err.message || 'خطای شبکه در ارتباط با سرور' });
    } finally {
      setIsSavingSmtp(false);
    }
  };

  // Admin Credentials Change State
  const [adminUsernameInput, setAdminUsernameInput] = useState(() => {
    try {
      const custom = JSON.parse(localStorage.getItem('ritm_admin_custom_credentials') || '{}');
      return custom.username || 'RITMF';
    } catch (e) {
      return 'RITMF';
    }
  });
  const [adminNewPass, setAdminNewPass] = useState('');
  const [adminConfirmPass, setAdminConfirmPass] = useState('');
  const [adminCredMsg, setAdminCredMsg] = useState<{ success?: string; error?: string }>({});

  const handleSaveAdminCredentials = (e: React.FormEvent) => {
    e.preventDefault();
    setAdminCredMsg({});

    if (!adminUsernameInput.trim()) {
      setAdminCredMsg({ error: 'نام کاربری ادمین نمی‌تواند خالی باشد.' });
      return;
    }

    if (!adminNewPass.trim() || adminNewPass.trim().length < 4) {
      setAdminCredMsg({ error: 'رمز عبور جدید باید حداقل ۴ کاراکتر باشد.' });
      return;
    }

    if (adminNewPass !== adminConfirmPass) {
      setAdminCredMsg({ error: 'رمز عبور جدید با تکرار آن مطابقت ندارد.' });
      return;
    }

    try {
      localStorage.setItem(
        'ritm_admin_custom_credentials',
        JSON.stringify({
          username: adminUsernameInput.trim(),
          password: adminNewPass.trim(),
          updatedAt: new Date().toISOString(),
        })
      );
      setAdminCredMsg({
        success: `مشخصات ادمین با موفقیت تغییر کرد! از این پس با نام کاربری «${adminUsernameInput.trim()}» و رمز عبور جدید می‌توانید وارد شوید.`,
      });
      setAdminNewPass('');
      setAdminConfirmPass('');
    } catch (e: any) {
      setAdminCredMsg({ error: 'خطا در ذخیره‌سازی مشخصات.' });
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [ordersData, usersData] = await Promise.all([
        getOrders(statusFilter, searchQuery),
        getUsers(),
      ]);

      if (ordersData.success) setOrders(ordersData.orders || []);
      if (usersData.success) setUsers(usersData.users || []);
    } catch (e) {
      console.error('Failed to load admin data:', e);
    } finally {
      setLoading(false);
    }
  };

  const fetchStorageData = async () => {
    setStorageLoading(true);
    try {
      const res = await fetch('/api/admin/storage');
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setStorageFiles(data.files || []);
          setStorageUsedMB(data.usedMB || 0);
          setStorageUsedPercent(data.usedPercent || 0);
        }
      }
    } catch (e) {
      console.error('Failed to load storage data:', e);
    } finally {
      setStorageLoading(false);
    }
  };

  const handleDeleteStorageFile = async (id: string) => {
    setFileDeletingId(id);
    try {
      const res = await fetch(`/api/admin/storage/${id}`, { method: 'DELETE' });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setStorageFiles((prev) => prev.filter((f) => f.id !== id));
          if (data.storage) {
            setStorageUsedMB(data.storage.usedMB || 0);
            setStorageUsedPercent(data.storage.usedPercent || 0);
          }
        }
      }
    } catch (e) {
      console.error('Failed to delete storage file:', e);
    } finally {
      setFileDeletingId(null);
    }
  };

  useEffect(() => {
    fetchData();
    fetchStorageData();
  }, [statusFilter]);

  useEffect(() => {
    if (adminSubTab === 'storage') {
      fetchStorageData();
    } else if (adminSubTab === 'settings') {
      fetchSmtpConfig();
    }
  }, [adminSubTab]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchData();
  };

  const openOrderDrawer = (order: Order) => {
    setSelectedOrder(order);
    setNewStatus(order.status);
    setAdminNotes(order.admin_notes || '');
    setMessageSuccess('');
    setDirectMessage('');
  };

  const handleUpdateStatus = async () => {
    if (!selectedOrder) return;
    setIsUpdating(true);
    try {
      const data = await updateOrderStatus(
        selectedOrder.id,
        newStatus,
        adminNotes,
        notifyClient
      );
      if (data.success && data.order) {
        setSelectedOrder(data.order);
        setOrders((prev) => prev.map((o) => (o.id === data.order!.id ? data.order! : o)));
        setMessageSuccess(lang === 'fa' ? 'وضعیت با موفقیت بروزرسانی شد.' : 'Status updated successfully.');
        setTimeout(() => setMessageSuccess(''), 3000);
      }
    } catch (e) {
      console.error('Failed to update status:', e);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSendDirectMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder || !directMessage.trim() || !selectedOrder.telegram_id) return;

    setIsSendingMessage(true);
    try {
      const data = await sendMessage(
        selectedOrder.id,
        directMessage.trim(),
        true,
        selectedOrder.telegram_id
      );
      if (data.success) {
        setDirectMessage('');
        setMessageSuccess(lang === 'fa' ? 'پیام به کاربر در تلگرام ارسال شد.' : 'Message dispatched to Telegram user.');
        setTimeout(() => setMessageSuccess(''), 3000);
      }
    } catch (e) {
      console.error('Error sending message:', e);
    } finally {
      setIsSendingMessage(false);
    }
  };

  // Status badge styling helper
  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'new':
        return {
          label: lang === 'fa' ? 'جدید / در انتظار' : 'New',
          color: 'text-[#ffb869] border-[#ffb869]/30 bg-[#ffb869]/10',
        };
      case 'approved':
        return {
          label: lang === 'fa' ? 'تایید شده / بررسی' : 'Approved',
          color: 'text-[#adc6ff] border-[#adc6ff]/30 bg-[#adc6ff]/10',
        };
      case 'in_progress':
        return {
          label: lang === 'fa' ? 'در حال انجام' : 'In Progress',
          color: 'text-[#d0bcff] border-[#d0bcff]/30 bg-[#d0bcff]/10',
        };
      case 'completed':
        return {
          label: lang === 'fa' ? 'تکمیل شده' : 'Completed',
          color: 'text-[#a3e635] border-[#a3e635]/30 bg-[#a3e635]/10',
        };
      case 'rejected':
      case 'cancelled':
        return {
          label: lang === 'fa' ? 'رد / لغو شده' : 'Cancelled',
          color: 'text-red-400 border-red-500/30 bg-red-500/10',
        };
      default:
        return { label: status, color: 'text-gray-400 border-gray-600 bg-gray-800' };
    }
  };

  // Metrics
  const totalCount = orders.length;
  const pendingCount = orders.filter((o) => o.status === 'new').length;
  const inProgressCount = orders.filter((o) => o.status === 'in_progress' || o.status === 'approved').length;
  const completedCount = orders.filter((o) => o.status === 'completed').length;

  return (
    <div className="max-w-7xl mx-auto py-4 sm:py-6 px-3 sm:px-6 pb-36 sm:pb-16 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-[#d0bcff]" />
            <h1 className="text-lg sm:text-xl font-bold text-[#e5e2e1]">
              {lang === 'fa' ? 'داشبورد مدیریت سفارشات ریتم' : 'RITM Admin Command Center'}
            </h1>
          </div>
          <p className="text-[11px] sm:text-xs text-[#958ea0] mt-1">
            {lang === 'fa'
              ? 'متصل مستقیم به پایگاه داده Supabase و فضای ابری ریتم'
              : 'Direct connection to Supabase database & RITM Cloud'}
          </p>
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-2 flex-wrap">
          {onLogout && (
            <button
              onClick={onLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 text-xs transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>{lang === 'fa' ? 'خروج' : 'Logout'}</span>
            </button>
          )}

          <div className="flex items-center gap-1 p-1 rounded-xl bg-white/5 border border-white/10 text-xs overflow-x-auto no-scrollbar max-w-full">
            <button
              onClick={() => setAdminSubTab('orders')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer shrink-0 whitespace-nowrap ${
                adminSubTab === 'orders' ? 'bg-[#d0bcff] text-[#131313] font-bold shadow-sm' : 'text-[#958ea0] hover:text-white'
              }`}
            >
              {lang === 'fa' ? `سفارشات (${totalCount})` : `Orders (${totalCount})`}
            </button>
            <button
              onClick={() => setAdminSubTab('users')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer shrink-0 whitespace-nowrap ${
                adminSubTab === 'users' ? 'bg-[#d0bcff] text-[#131313] font-bold shadow-sm' : 'text-[#958ea0] hover:text-white'
              }`}
            >
              {lang === 'fa' ? `کاربران (${users.length})` : `Users (${users.length})`}
            </button>
            <button
              onClick={() => setAdminSubTab('storage')}
              className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shrink-0 whitespace-nowrap ${
                adminSubTab === 'storage' ? 'bg-[#d0bcff] text-[#131313] font-bold shadow-sm' : 'text-[#958ea0] hover:text-white'
              }`}
            >
              <HardDrive className="w-3.5 h-3.5" />
              <span>{lang === 'fa' ? `حافظه (${storageUsedMB} MB)` : `Storage (${storageUsedMB} MB)`}</span>
            </button>
            <button
              onClick={() => setAdminSubTab('settings')}
              className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shrink-0 whitespace-nowrap ${
                adminSubTab === 'settings' ? 'bg-[#d0bcff] text-[#131313] font-bold shadow-sm' : 'text-[#958ea0] hover:text-white'
              }`}
            >
              <Settings className="w-3.5 h-3.5" />
              <span>{lang === 'fa' ? 'تنظیمات' : 'Settings'}</span>
            </button>
          </div>

          <button
            onClick={fetchData}
            disabled={loading}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-[#e5e2e1] transition-all cursor-pointer shrink-0"
            title="بروزرسانی داده‌ها"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <div className="glass-card rounded-xl p-4 border border-white/10">
          <span className="text-xs text-[#958ea0] block">
            {lang === 'fa' ? 'کل سفارشات' : 'Total Orders'}
          </span>
          <span className="text-2xl font-mono font-bold text-[#e5e2e1] mt-1 block">
            {totalCount}
          </span>
        </div>

        <div className="glass-card rounded-xl p-4 border border-white/10">
          <span className="text-xs text-[#958ea0] block">
            {lang === 'fa' ? 'در انتظار بررسی' : 'Pending Review'}
          </span>
          <span className="text-2xl font-mono font-bold text-[#ffb869] mt-1 block">
            {pendingCount}
          </span>
        </div>

        <div className="glass-card rounded-xl p-4 border border-white/10">
          <span className="text-xs text-[#958ea0] block">
            {lang === 'fa' ? 'در حال اجرا' : 'In Progress'}
          </span>
          <span className="text-2xl font-mono font-bold text-[#adc6ff] mt-1 block">
            {inProgressCount}
          </span>
        </div>

        <div className="glass-card rounded-xl p-4 border border-white/10">
          <span className="text-xs text-[#958ea0] block">
            {lang === 'fa' ? 'تکمیل شده' : 'Completed'}
          </span>
          <span className="text-2xl font-mono font-bold text-[#a3e635] mt-1 block">
            {completedCount}
          </span>
        </div>
      </div>

      {/* SUBTAB 1: ORDERS */}
      {adminSubTab === 'orders' && (
        <div className="space-y-4">
          {/* Filters & Search */}
          <div className="glass-panel rounded-xl p-3 border border-white/10 flex flex-col md:flex-row items-center justify-between gap-3">
            {/* Filter Pills */}
            <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
              {[
                { id: 'all', labelFa: 'همه', labelEn: 'All' },
                { id: 'new', labelFa: 'جدید', labelEn: 'New' },
                { id: 'approved', labelFa: 'تایید شده', labelEn: 'Approved' },
                { id: 'in_progress', labelFa: 'در حال اجرا', labelEn: 'In Progress' },
                { id: 'completed', labelFa: 'تکمیل شده', labelEn: 'Completed' },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setStatusFilter(f.id)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                    statusFilter === f.id
                      ? 'bg-white/15 text-[#d0bcff] font-bold border border-white/20'
                      : 'text-[#958ea0] hover:text-[#e5e2e1]'
                  }`}
                >
                  {lang === 'fa' ? f.labelFa : f.labelEn}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <form onSubmit={handleSearch} className="flex items-center gap-2 w-full md:w-72">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={lang === 'fa' ? 'جستجو بر اساس نام یا کد...' : 'Search code or name...'}
                  className="w-full bg-black/40 border border-white/15 focus:border-[#d0bcff] rounded-xl py-1.5 px-3 text-xs text-[#e5e2e1] outline-none"
                />
              </div>
              <button
                type="submit"
                className="p-2 rounded-xl bg-white/10 hover:bg-white/15 text-[#e5e2e1] transition-colors"
              >
                <Search className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>

          {/* Orders Table */}
          <div className="glass-panel rounded-2xl border border-white/10 overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead>
                  <tr className="bg-black/30 border-b border-white/10 text-[#958ea0] font-medium">
                    <th className="py-3.5 px-4">کد رهگیری</th>
                    <th className="py-3.5 px-4">مشتری</th>
                    <th className="py-3.5 px-4">نوع پروژه</th>
                    <th className="py-3.5 px-4">بودجه</th>
                    <th className="py-3.5 px-4">مهلت</th>
                    <th className="py-3.5 px-4">وضعیت</th>
                    <th className="py-3.5 px-4">تاریخ ثبت</th>
                    <th className="py-3.5 px-4 text-center">عملیات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.06]">
                  {orders.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-[#958ea0]">
                        {loading
                          ? (lang === 'fa' ? 'در حال بارگذاری اطلاعات...' : 'Loading orders...')
                          : (lang === 'fa' ? 'هیچ سفارشی با این فیلتر یافت نشد.' : 'No orders found matching filters.')}
                      </td>
                    </tr>
                  ) : (
                    orders.map((ord) => {
                      const badge = getStatusBadge(ord.status);
                      return (
                        <tr
                          key={ord.id}
                          className="hover:bg-white/[0.02] transition-colors cursor-pointer"
                          onClick={() => openOrderDrawer(ord)}
                        >
                          <td className="py-3.5 px-4 font-mono font-bold text-[#d0bcff]">
                            <div className="flex items-center gap-1.5">
                              <span>{ord.order_code}</span>
                              {(ord.description?.includes('/uploads/') || ord.attached_file_url || storageFiles.some((f) => f.orderCode === ord.order_code)) && (
                                <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-[#38bdf8]/15 border border-[#38bdf8]/30 text-[#38bdf8] text-[9.5px] font-sans" title="دارای فایل پیوست">
                                  <Paperclip className="w-2.5 h-2.5" />
                                  <span>فایل</span>
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="font-semibold text-[#e5e2e1] block">{ord.full_name}</span>
                            <span className="text-[11px] text-[#958ea0] font-mono block">
                              {ord.contact}
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="text-[#e5e2e1]">
                              {ord.project_type === 'video'
                                ? 'تدوین ویدیو'
                                : ord.project_type === 'web'
                                ? 'توسعه وب'
                                : ord.project_type === 'mobile'
                                ? 'اپ موبایل'
                                : 'سایر موارد'}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-[#e5e2e1] font-mono">
                            {ord.budget || 'توافقی'}
                          </td>
                          <td className="py-3.5 px-4 text-[#958ea0]">
                            {ord.deadline || 'توافقی'}
                          </td>
                          <td className="py-3.5 px-4">
                            <span
                              className={`inline-block px-2.5 py-1 rounded-full text-[10.5px] border ${badge.color}`}
                            >
                              {badge.label}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-[#958ea0] font-mono">
                            {new Date(ord.created_at).toLocaleDateString('fa-IR')}
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openOrderDrawer(ord);
                                }}
                                className="px-3 py-1 rounded-lg bg-white/5 hover:bg-white/15 text-[#e5e2e1] text-[11px] border border-white/10 transition-colors cursor-pointer"
                              >
                                مدیریت
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setOrderToDelete(ord);
                                }}
                                className="p-1 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors border border-transparent hover:border-red-500/20 cursor-pointer"
                                title="حذف سفارش"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 2: USERS & ADMIN ROLES */}
      {adminSubTab === 'users' && (
        <div className="space-y-5">
          {adminActionSuccess && (
            <div className="p-3.5 rounded-xl bg-[#a3e635]/15 border border-[#a3e635]/30 text-[#a3e635] text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{adminActionSuccess}</span>
            </div>
          )}

          {adminActionError && (
            <div className="p-3.5 rounded-xl bg-red-500/15 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>{adminActionError}</span>
            </div>
          )}

          {/* Quick Add Admin Card */}
          <div className="glass-panel rounded-2xl p-5 border border-[#d0bcff]/20 bg-gradient-to-br from-[#161823] to-[#0e1017] shadow-xl">
            <div className="flex items-center gap-2.5 mb-3 text-right">
              <div className="w-8 h-8 rounded-xl bg-[#d0bcff]/15 border border-[#d0bcff]/30 flex items-center justify-center text-[#d0bcff]">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">انتخاب و افزودن مدیر جدید (ارتقای دسترسی)</h3>
                <p className="text-[11px] text-[#958ea0]">
                  شما می‌توانید هر کاربری را به عنوان ادمین انتخاب کنید تا به پنل مدیریت، سفارشات و تنظیمات دسترسی کامل داشته باشد.
                </p>
              </div>
            </div>

            <form onSubmit={handleAddNewAdmin} className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <input
                type="email"
                required
                value={newAdminEmail}
                onChange={(e) => setNewAdminEmail(e.target.value)}
                placeholder="ایمیل کاربر جهت ارتقا یا ادمین جدید..."
                className="bg-black/50 border border-white/15 focus:border-[#d0bcff] rounded-xl px-3.5 py-2 text-xs text-white outline-none dir-ltr text-left"
              />
              <input
                type="text"
                value={newAdminName}
                onChange={(e) => setNewAdminName(e.target.value)}
                placeholder="نام مدیر (اختیاری)"
                className="bg-black/50 border border-white/15 focus:border-[#d0bcff] rounded-xl px-3.5 py-2 text-xs text-white outline-none"
              />
              <div className="flex gap-2">
                <input
                  type="password"
                  value={newAdminPass}
                  onChange={(e) => setNewAdminPass(e.target.value)}
                  placeholder="رمز ورود (پیش‌فرض: Mohmah123)"
                  className="flex-1 bg-black/50 border border-white/15 focus:border-[#d0bcff] rounded-xl px-3.5 py-2 text-xs text-white outline-none dir-ltr text-left font-mono"
                />
                <button
                  type="submit"
                  disabled={isAddingAdmin}
                  className="px-4 py-2 rounded-xl bg-[#d0bcff] hover:bg-[#d0bcff]/90 text-[#131313] font-bold text-xs whitespace-nowrap transition-all shadow-md cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>{isAddingAdmin ? 'در حال ثبت...' : 'تایید و ثبت ادمین'}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Users Table */}
          <div className="glass-panel rounded-2xl border border-white/10 overflow-hidden shadow-xl">
            <div className="p-4 border-b border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-[#e5e2e1]">
                  {lang === 'fa' ? 'فهرست کاربران و کنترل سطوح دسترسی مدیران' : 'Users & Access Roles'}
                </h3>
                <p className="text-[11px] text-[#8c94a4]">
                  امکان ارتقا به مدیر سیستم یا سلب دسترسی با یک کلیک
                </p>
              </div>

              {/* Role Filter Tabs */}
              <div className="flex items-center gap-1.5 p-1 rounded-xl bg-black/40 border border-white/10 text-xs">
                <button
                  type="button"
                  onClick={() => setUserRoleFilter('all')}
                  className={`px-3 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                    userRoleFilter === 'all'
                      ? 'bg-[#d0bcff] text-[#131313] font-bold'
                      : 'text-[#958ea0] hover:text-white'
                  }`}
                >
                  همه ({users.length})
                </button>
                <button
                  type="button"
                  onClick={() => setUserRoleFilter('admins')}
                  className={`px-3 py-1 rounded-lg font-medium transition-colors cursor-pointer flex items-center gap-1 ${
                    userRoleFilter === 'admins'
                      ? 'bg-[#d0bcff] text-[#131313] font-bold'
                      : 'text-[#d0bcff] hover:text-white'
                  }`}
                >
                  <ShieldCheck className="w-3 h-3" />
                  <span>مدیران ({users.filter((u) => u.is_admin).length})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setUserRoleFilter('regular')}
                  className={`px-3 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                    userRoleFilter === 'regular'
                      ? 'bg-[#d0bcff] text-[#131313] font-bold'
                      : 'text-[#958ea0] hover:text-white'
                  }`}
                >
                  کاربران عادی ({users.filter((u) => !u.is_admin).length})
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead>
                  <tr className="bg-black/30 border-b border-white/10 text-[#958ea0]">
                    <th className="py-3 px-4">شناسه</th>
                    <th className="py-3 px-4">نام کاربر / برند</th>
                    <th className="py-3 px-4">ایمیل / آیدی</th>
                    <th className="py-3 px-4">سطح دسترسی</th>
                    <th className="py-3 px-4">تاریخ عضویت</th>
                    <th className="py-3 px-4 text-center">مدیریت نقش و حذف</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.06]">
                  {users
                    .filter((u) => {
                      if (userRoleFilter === 'admins') return u.is_admin;
                      if (userRoleFilter === 'regular') return !u.is_admin;
                      return true;
                    })
                    .map((u) => (
                    <tr key={u.id} className="hover:bg-white/[0.02]">
                      <td className="py-3 px-4 font-mono text-[#d0bcff]">#{u.id}</td>
                      <td className="py-3 px-4 text-[#e5e2e1] font-semibold">
                        {u.first_name || ''} {u.last_name || ''}
                      </td>
                      <td className="py-3 px-4 font-mono text-[#adc6ff] dir-ltr text-right">
                        {u.email || u.username || '-'}
                      </td>
                      <td className="py-3 px-4">
                        {u.is_admin ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] bg-[#d0bcff]/20 text-[#d0bcff] border border-[#d0bcff]/40 font-bold shadow-[0_0_8px_rgba(208,188,255,0.2)]">
                            <ShieldCheck className="w-3 h-3 text-[#d0bcff]" />
                            <span>مدیر سیستم (ادمین)</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[#958ea0] bg-white/5 px-2 py-0.5 rounded text-[10px]">
                            <span>کاربر عادی</span>
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 font-mono text-[#958ea0]">
                        {new Date(u.created_at).toLocaleDateString('fa-IR')}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          {/* Toggle Admin Button */}
                          <button
                            onClick={() => handleToggleAdmin(u)}
                            className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer ${
                              u.is_admin
                                ? 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                : 'bg-[#d0bcff]/15 hover:bg-[#d0bcff]/25 text-[#d0bcff] border border-[#d0bcff]/30'
                            }`}
                            title={u.is_admin ? 'سلب دسترسی مدیریت' : 'ارتقا به مدیر سیستم'}
                          >
                            {u.is_admin ? (
                              <>
                                <ShieldAlert className="w-3.5 h-3.5 text-amber-300" />
                                <span>سلب ادمین</span>
                              </>
                            ) : (
                              <>
                                <ShieldCheck className="w-3.5 h-3.5 text-[#d0bcff]" />
                                <span>ارتقا به ادمین</span>
                              </>
                            )}
                          </button>

                          {/* Delete User Button */}
                          <button
                            onClick={() => setUserToDelete(u)}
                            className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/25 text-red-400 border border-red-500/30 text-xs flex items-center transition-colors cursor-pointer"
                            title="حذف کامل این کاربر از سیستم"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 3: SETTINGS */}
      {adminSubTab === 'settings' && (
        <div className="space-y-6">
          {/* Card 1: Order Reception Toggle */}
          <div className="glass-panel rounded-2xl p-6 border border-white/10 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="text-right">
                <h3 className="text-base font-bold text-white">وضعیت پذیرش سفارشات در سایت</h3>
                <p className="text-xs text-[#8c94a4] mt-0.5">در صورت غیرفعال‌سازی، کاربران پیامی مبنی بر پر بودن موقت ظرفیت مشاهده خواهند کرد.</p>
              </div>
              <button
                onClick={() => {
                  const nextVal = !settingsOrdersOpen;
                  setSettingsOrdersOpen(nextVal);
                  localStorage.setItem('ritm_orders_open', String(nextVal));
                  setSettingsSavedMessage('وضعیت پذیرش سفارشات با موفقیت ذخیره شد.');
                  setTimeout(() => setSettingsSavedMessage(''), 3000);
                }}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  settingsOrdersOpen
                    ? 'bg-[#a3e635]/20 text-[#a3e635] border border-[#a3e635]/40 hover:bg-[#a3e635]/30'
                    : 'bg-red-500/20 text-red-400 border border-red-500/40 hover:bg-red-500/30'
                }`}
              >
                {settingsOrdersOpen ? 'پذیرش سفارشات: فعال ✅' : 'پذیرش سفارشات: متوقف ⛔'}
              </button>
            </div>
          </div>

          {/* Card 2: Telegram Channel ID */}
          <div className="glass-panel rounded-2xl p-6 border border-white/10 space-y-4 text-right">
            <div>
              <h3 className="text-base font-bold text-white">آدرس و آیدی کانال تلگرام ریتم</h3>
              <p className="text-xs text-[#8c94a4] mt-0.5">کانالی که دکمه تلگرام به آن لینک می‌شود.</p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <input
                type="text"
                value={telegramChannel}
                onChange={(e) => setTelegramChannel(e.target.value)}
                placeholder="@RITM_FreeLancer"
                className="flex-1 bg-[#161823] border border-white/15 focus:border-[#d0bcff] rounded-xl px-4 py-2.5 text-xs text-white outline-none dir-ltr text-left font-mono"
              />
              <button
                onClick={() => {
                  localStorage.setItem('ritm_tg_channel', telegramChannel.trim());
                  setSettingsSavedMessage('آدرس کانال تلگرام با موفقیت ذخیره شد.');
                  setTimeout(() => setSettingsSavedMessage(''), 3000);
                }}
                className="px-5 py-2.5 rounded-xl bg-[#d0bcff] text-[#0d0f17] font-bold text-xs hover:bg-[#d0bcff]/90 transition-colors cursor-pointer"
              >
                ذخیره کانال
              </button>
            </div>
          </div>

          {/* Card 3: Global Broadcast Announcement */}
          <div className="glass-panel rounded-2xl p-6 border border-white/10 space-y-4 text-right">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Megaphone className="w-4 h-4 text-[#ffb869]" />
                <span>پیام اطلاعیه سراسری برای کاربران سایت</span>
              </h3>
              <p className="text-xs text-[#8c94a4] mt-0.5">متن اخبار، تخفیف ویژه یا اعلامیه‌های فوری ریتم.</p>
            </div>

            <textarea
              rows={3}
              value={globalAnnouncement}
              onChange={(e) => setGlobalAnnouncement(e.target.value)}
              placeholder="مثال: جشنواره تخفیف ادیت ویدیو با پریمیر پرو تا انتهای هفته جاری فعال است..."
              className="w-full bg-[#161823] border border-white/15 focus:border-[#d0bcff] rounded-xl p-3 text-xs text-white outline-none leading-relaxed"
            />

            <div className="flex items-center justify-between">
              {settingsSavedMessage && (
                <span className="text-xs text-[#a3e635] font-medium">{settingsSavedMessage}</span>
              )}
              <button
                onClick={() => {
                  localStorage.setItem('ritm_announcement', globalAnnouncement.trim());
                  setSettingsSavedMessage('پیام اطلاعیه ذخیره شد.');
                  setTimeout(() => setSettingsSavedMessage(''), 3000);
                }}
                className="px-5 py-2.5 rounded-xl bg-[#d0bcff] text-[#0d0f17] font-bold text-xs hover:bg-[#d0bcff]/90 transition-colors cursor-pointer mr-auto"
              >
                ذخیره و ثبت پیام
              </button>
            </div>
          </div>

          {/* Card 4: Gmail SMTP Email Service Configuration */}
          <div className="glass-panel rounded-2xl p-6 border border-white/10 space-y-4 text-right">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Mail className="w-4 h-4 text-[#d0bcff]" />
                  <span>اتصال مستقیم به جیمیل جهت ارسال واقعی کدهای تایید (SMTP)</span>
                </h3>
                <p className="text-xs text-[#8c94a4] mt-0.5">
                  ارسال کدهای تایید ۶ رقمی ثبت‌نام، ورود و احراز هویت مستقیماً از جیمیل شما به اینباکس کاربران.
                </p>
              </div>

              {smtpConfigured ? (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#a3e635]/15 border border-[#a3e635]/30 text-[#a3e635] text-xs font-mono shrink-0">
                  <span className="w-2 h-2 rounded-full bg-[#a3e635] animate-pulse" />
                  <span>متصل: {smtpConfiguredUser || 'Gmail Active'}</span>
                </div>
              ) : (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ffb869]/15 border border-[#ffb869]/30 text-[#ffb869] text-xs font-mono shrink-0">
                  <span className="w-2 h-2 rounded-full bg-[#ffb869]" />
                  <span>حالت شبیه‌ساز (Local Fallback)</span>
                </div>
              )}
            </div>

            {smtpFeedback.success && (
              <div className="p-3 rounded-xl bg-[#a3e635]/15 border border-[#a3e635]/30 text-[#a3e635] text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{smtpFeedback.success}</span>
              </div>
            )}

            {smtpFeedback.error && (
              <div className="p-3 rounded-xl bg-red-500/15 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{smtpFeedback.error}</span>
              </div>
            )}

            <form onSubmit={handleSaveSmtp} className="space-y-3 pt-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-[#958ea0] block mb-1">آدرس جیمیل شما (Google Account):</label>
                  <input
                    type="email"
                    value={smtpUser}
                    onChange={(e) => setSmtpUser(e.target.value)}
                    placeholder="yourstudio@gmail.com"
                    className="w-full bg-[#161823] border border-white/15 focus:border-[#d0bcff] rounded-xl px-3 py-2 text-xs text-white outline-none dir-ltr text-left font-mono"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-[#958ea0] block mb-1">
                    رمز عبور برنامه گوگل (Google App Password ۱۶ حرفی):
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      value={smtpPass}
                      onChange={(e) => setSmtpPass(e.target.value)}
                      placeholder="xxxx xxxx xxxx xxxx"
                      className="w-full bg-[#161823] border border-white/15 focus:border-[#d0bcff] rounded-xl px-3 py-2 text-xs text-white outline-none dir-ltr text-left font-mono pr-8"
                    />
                    <Key className="w-3.5 h-3.5 text-[#958ea0] absolute left-3 top-2.5" />
                  </div>
                </div>
              </div>

              <div>
                <label className="text-[11px] text-[#958ea0] block mb-1">
                  ایمیل جهت دریافت تست موفقیت (اختیاری):
                </label>
                <input
                  type="email"
                  value={smtpTestEmail}
                  onChange={(e) => setSmtpTestEmail(e.target.value)}
                  placeholder="test@example.com"
                  className="w-full bg-[#161823] border border-white/15 focus:border-[#d0bcff] rounded-xl px-3 py-2 text-xs text-white outline-none dir-ltr text-left font-mono"
                />
              </div>

              {/* Google App Password Guide Note */}
              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/10 text-[11px] text-[#958ea0] space-y-1">
                <span className="text-[#d0bcff] font-bold block">💡 راهنمای سریع دریافت رمز برنامه از گوگل (Google App Password):</span>
                <p>
                  ۱. وارد تنظیمات حساب گوگل خود شوید (<span className="text-white font-mono">myaccount.google.com/security</span>).
                </p>
                <p>
                  ۲. تایید دو مرحله‌ای (2-Step Verification) را فعال کنید.
                </p>
                <p>
                  ۳. در قسمت امنیت، عبارت <span className="text-[#a3e635] font-semibold">«App passwords»</span> را جستجو کنید و یک نام مثل «RITM Studio» وارد کنید تا یک رمز ۱۶ کاراکتری به شما بدهد و آن را در کادر بالا وارد کنید.
                </p>
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-[11px] text-[#8c94a4]">
                  همچنین می‌توانید ایمیل و رمز برنامه را در چت بفرستید تا فوراً برایتان فعال کنم.
                </span>
                <button
                  type="submit"
                  disabled={isSavingSmtp}
                  className="px-5 py-2.5 rounded-xl bg-[#d0bcff] text-[#0d0f17] font-bold text-xs hover:bg-[#d0bcff]/90 transition-colors cursor-pointer disabled:opacity-50"
                >
                  {isSavingSmtp ? 'در حال تست اتصال به جیمیل...' : 'تست و فعال‌سازی سرویس ایمیل'}
                </button>
              </div>
            </form>
          </div>

          {/* Card 5: Change Master Admin Username & Password */}
          <div className="glass-panel rounded-2xl p-6 border border-white/10 space-y-4 text-right">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#a3e635]" />
                <span>تغییر نام کاربری و رمز عبور حساب ادمین کل (Admin Credentials)</span>
              </h3>
              <p className="text-xs text-[#8c94a4] mt-0.5">
                نام کاربری و رمز عبور ورود به پنل مدیریت را طبق تمایل خود تغییر دهید.
              </p>
            </div>

            {adminCredMsg.success && (
              <div className="p-3.5 rounded-xl bg-[#a3e635]/15 border border-[#a3e635]/30 text-[#a3e635] text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{adminCredMsg.success}</span>
              </div>
            )}

            {adminCredMsg.error && (
              <div className="p-3.5 rounded-xl bg-red-500/15 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{adminCredMsg.error}</span>
              </div>
            )}

            <form onSubmit={handleSaveAdminCredentials} className="space-y-4 pt-1">
              <div>
                <label className="text-[11px] text-[#958ea0] block mb-1">نام کاربری جدید ادمین (Username):</label>
                <input
                  type="text"
                  required
                  value={adminUsernameInput}
                  onChange={(e) => setAdminUsernameInput(e.target.value)}
                  placeholder="RITMF"
                  className="w-full bg-[#161823] border border-white/15 focus:border-[#d0bcff] rounded-xl px-4 py-2.5 text-xs text-white outline-none dir-ltr text-left font-mono"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-[#958ea0] block mb-1">رمز عبور جدید (New Password):</label>
                  <input
                    type="password"
                    required
                    value={adminNewPass}
                    onChange={(e) => setAdminNewPass(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full bg-[#161823] border border-white/15 focus:border-[#d0bcff] rounded-xl px-4 py-2.5 text-xs text-white outline-none dir-ltr text-left font-mono"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-[#958ea0] block mb-1">تکرار رمز عبور جدید:</label>
                  <input
                    type="password"
                    required
                    value={adminConfirmPass}
                    onChange={(e) => setAdminConfirmPass(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full bg-[#161823] border border-white/15 focus:border-[#d0bcff] rounded-xl px-4 py-2.5 text-xs text-white outline-none dir-ltr text-left font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-[11px] text-[#71717a]">
                  تغییرات بلافاصله ذخیره شده و در لاگین بعدی اعمال می‌شود.
                </span>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-[#a3e635] text-[#07080c] font-bold text-xs hover:bg-[#a3e635]/90 transition-all cursor-pointer shadow-md shadow-[#a3e635]/20"
                >
                  ذخیره و تغییر مشخصات ادمین
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SUBTAB 4: STORAGE MANAGEMENT (1 GB QUOTA) */}
      {adminSubTab === 'storage' && (
        <div className="space-y-6">
          {/* Storage Meter Card */}
          <div className="glass-panel rounded-2xl p-6 border border-white/10 space-y-5 text-right">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <HardDrive className="w-5 h-5 text-[#d0bcff]" />
                  <span>مدیریت فضای ذخیره‌سازی فایل‌های سایت (سقف ۱ گیگابایت)</span>
                </h3>
                <p className="text-xs text-[#8c94a4] mt-1">
                  فایل‌ها، ویدیوها و اسناد ارسالی کارفرمایان در این بخش نگهداری شده و هر زمان که بخواهید می‌توانید دستی آن‌ها را حذف کنید.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={fetchStorageData}
                  disabled={storageLoading}
                  className="px-3.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-white flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${storageLoading ? 'animate-spin' : ''}`} />
                  <span>بروزرسانی وضعیت</span>
                </button>
              </div>
            </div>

            {/* Storage Progress Bar */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-mono text-white font-bold">
                  {storageUsedMB} MB مصرف شده از ۱۰۲۴ MB (۱.۰۰ GB)
                </span>
                <span className={`font-mono font-bold ${storageUsedPercent > 85 ? 'text-red-400' : 'text-[#a3e635]'}`}>
                  {storageUsedPercent}% ظرفیت
                </span>
              </div>

              <div className="w-full h-3 rounded-full bg-black/60 border border-white/10 overflow-hidden p-0.5">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    storageUsedPercent > 85
                      ? 'bg-gradient-to-r from-orange-500 to-red-500'
                      : 'bg-gradient-to-r from-[#d0bcff] to-[#38bdf8]'
                  }`}
                  style={{ width: `${Math.min(100, Math.max(2, storageUsedPercent))}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[11px] text-[#8c94a4]">
                <span>فضای آزاد باقیمانده: {(1024 - storageUsedMB).toFixed(2)} MB</span>
                <span>تعداد کل فایل‌های ذخیره‌شده: {storageFiles.length} فایل</span>
              </div>
            </div>

            {/* Platform Storage Information Banner */}
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/10 text-xs space-y-1.5 leading-relaxed text-[#9da3af]">
              <div className="text-white font-bold flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-[#ffb869]" />
                <span>پاسخ فنی درباره ظرفیت و پلتفرم بک‌اند:</span>
              </div>
              <p>
                پلتفرم ابری سرور شما فضای محلی و موقت تا سقف <strong>۱ گیگابایت</strong> را به راحتی نگهداری می‌کند. فایل‌ها مستقیماً روی سرور سایت ذخیره می‌شوند و به محض اینکه دکمه «حذف» را بزنید، بلافاصله از حافظه سرور پاک شده و فضا برای سفارشات جدید آزاد می‌شود.
              </p>
            </div>
          </div>

          {/* Files Table */}
          <div className="glass-panel rounded-2xl border border-white/10 overflow-hidden shadow-xl">
            <div className="p-4 border-b border-white/10 flex items-center justify-between text-right">
              <div>
                <h4 className="text-sm font-bold text-white">لیست فایل‌های آپلود شده توسط کاربران</h4>
                <p className="text-[11px] text-[#8c94a4]">امکان دانلود، پیش‌نمایش و حذف تک‌تک فایل‌ها</p>
              </div>
              <span className="text-xs font-mono text-[#d0bcff]">{storageFiles.length} فایل</span>
            </div>

            {storageFiles.length === 0 ? (
              <div className="p-10 text-center text-xs text-[#8c94a4] space-y-2">
                <FolderOpen className="w-10 h-10 text-white/20 mx-auto" />
                <p>هیچ فایلی در حال حاضر آپلود نشده و حافظه ۱ گیگابایتی سایت کاملاً آزاد است.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-right text-xs">
                  <thead>
                    <tr className="bg-black/30 border-b border-white/10 text-[#8c94a4]">
                      <th className="py-3 px-4">نام فایل</th>
                      <th className="py-3 px-4">کد سفارش</th>
                      <th className="py-3 px-4">کاربر / تماس</th>
                      <th className="py-3 px-4">حجم فایل</th>
                      <th className="py-3 px-4">تاریخ بارگذاری</th>
                      <th className="py-3 px-4">عملیات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.06]">
                    {storageFiles.map((file) => (
                      <tr key={file.id} className="hover:bg-white/[0.02]">
                        <td className="py-3 px-4">
                          <div className="font-semibold text-white max-w-[180px] truncate" title={file.fileName}>
                            {file.fileName}
                          </div>
                          <span className="text-[10px] text-[#8c94a4] font-mono">{file.fileType}</span>
                        </td>
                        <td className="py-3 px-4 font-mono text-[#d0bcff] font-bold">
                          {file.orderCode}
                        </td>
                        <td className="py-3 px-4">
                          <div className="text-white">{file.clientName}</div>
                          <div className="text-[10px] text-[#8c94a4] font-mono">{file.contact}</div>
                        </td>
                        <td className="py-3 px-4 font-mono text-[#a3e635] font-semibold">
                          {(file.sizeBytes / (1024 * 1024)).toFixed(2)} MB
                        </td>
                        <td className="py-3 px-4 font-mono text-[#8c94a4]">
                          {new Date(file.uploadDate).toLocaleDateString('fa-IR')}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <a
                              href={file.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 px-2.5 rounded-lg bg-white/5 hover:bg-white/10 text-white border border-white/10 text-xs flex items-center gap-1 cursor-pointer transition-colors"
                              title="مشاهده یا دانلود فایل"
                            >
                              <Download className="w-3.5 h-3.5 text-[#38bdf8]" />
                              <span>دانلود</span>
                            </a>

                            <button
                              onClick={() => handleDeleteStorageFile(file.id)}
                              disabled={fileDeletingId === file.id}
                              className="p-1.5 px-2.5 rounded-lg bg-red-500/10 hover:bg-red-500/25 text-red-400 border border-red-500/30 text-xs flex items-center gap-1 cursor-pointer transition-colors disabled:opacity-50"
                              title="حذف این فایل از دیسک سرور"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>{fileDeletingId === file.id ? '...' : 'حذف'}</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* DELETE USER CONFIRMATION MODAL */}
      {userToDelete && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
          <div className="glass-panel w-full max-w-md rounded-2xl border border-red-500/40 p-6 shadow-2xl space-y-4 text-right my-auto">
            <div className="w-12 h-12 rounded-xl bg-red-500/20 text-red-400 flex items-center justify-center mx-auto border border-red-500/30">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-lg font-bold text-white">حذف کامل کاربر از سایت</h3>
              <p className="text-xs text-[#8c94a4] leading-relaxed">
                آیا مطمئن هستید که می‌خواهید کاربر{' '}
                <span className="text-white font-bold">{userToDelete.first_name || userToDelete.email || userToDelete.username || userToDelete.id}</span>{' '}
                را به طور کامل از سایت حذف کنید؟ این عملیات برگشت‌ناپذیر است.
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setUserToDelete(null)}
                className="px-5 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold cursor-pointer"
              >
                انصراف
              </button>
              <button
                onClick={async () => {
                  setIsDeletingUser(true);
                  try {
                    const res = await deleteUser(userToDelete.id);
                    if (res.success) {
                      setUsers((prev) => prev.filter((u) => u.id !== userToDelete.id));
                      setUserToDelete(null);
                    }
                  } catch (e) {
                    console.error('Failed to delete user:', e);
                  } finally {
                    setIsDeletingUser(false);
                  }
                }}
                disabled={isDeletingUser}
                className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-colors cursor-pointer"
              >
                {isDeletingUser ? 'در حال حذف...' : 'بله، حذف کن'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE ORDER CONFIRMATION MODAL */}
      {orderToDelete && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
          <div className="glass-panel w-full max-w-md rounded-2xl border border-red-500/40 p-6 shadow-2xl space-y-4 text-right my-auto">
            <div className="w-12 h-12 rounded-xl bg-red-500/20 text-red-400 flex items-center justify-center mx-auto border border-red-500/30">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-lg font-bold text-white">حذف کامل سفارش</h3>
              <p className="text-xs text-[#8c94a4] leading-relaxed">
                آیا مطمئن هستید که می‌خواهید سفارش{' '}
                <span className="text-[#d0bcff] font-mono font-bold">{orderToDelete.order_code}</span>{' '}
                مربوط به <span className="text-white font-bold">{orderToDelete.full_name}</span> را به طور کامل از سیستم حذف کنید؟ این عملیات برگشت‌ناپذیر است.
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setOrderToDelete(null)}
                className="px-5 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold cursor-pointer"
              >
                انصراف
              </button>
              <button
                onClick={handleDeleteOrder}
                disabled={isDeletingOrder}
                className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-colors cursor-pointer disabled:opacity-50"
              >
                {isDeletingOrder ? 'در حال حذف...' : 'بله، حذف کن'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ORDER DETAILS MODAL / DRAWER */}
      {selectedOrder && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto">
          <div className="glass-panel w-full max-w-2xl rounded-2xl border border-white/20 p-5 sm:p-6 shadow-2xl relative max-h-[92vh] overflow-y-auto my-auto custom-scrollbar">
            {/* Close button */}
            <button
              onClick={() => setSelectedOrder(null)}
              className="absolute top-5 left-5 p-1 rounded-lg bg-white/5 hover:bg-white/10 text-[#958ea0] hover:text-[#e5e2e1] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="flex items-center justify-between mb-6 pb-3 border-b border-white/10 pl-10">
              <div>
                <span className="font-mono text-xs text-[#d0bcff] font-bold block mb-1">
                  {selectedOrder.order_code}
                </span>
                <h2 className="text-xl font-bold text-[#e5e2e1]">
                  {selectedOrder.full_name}
                </h2>
              </div>
              <button
                onClick={() => setOrderToDelete(selectedOrder)}
                className="px-3 py-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                title="حذف کامل این سفارش"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>حذف سفارش</span>
              </button>
            </div>

            {messageSuccess && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs">
                {messageSuccess}
              </div>
            )}

            {/* Grid specs */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 rounded-xl bg-black/40 border border-white/10 mb-6 text-xs">
              <div>
                <span className="text-[#958ea0] block">نوع پروژه:</span>
                <span className="text-[#e5e2e1] font-semibold">{selectedOrder.project_type}</span>
              </div>
              <div>
                <span className="text-[#958ea0] block">بودجه:</span>
                <span className="text-[#e5e2e1] font-semibold">{selectedOrder.budget || 'توافقی'}</span>
              </div>
              <div>
                <span className="text-[#958ea0] block">مهلت:</span>
                <span className="text-[#e5e2e1] font-semibold">{selectedOrder.deadline || 'توافقی'}</span>
              </div>
              <div>
                <span className="text-[#958ea0] block">تماس:</span>
                <span className="text-[#e5e2e1] font-mono">{selectedOrder.contact}</span>
              </div>
              <div>
                <span className="text-[#958ea0] block">شناسه تلگرام:</span>
                <span className="text-[#e5e2e1] font-mono">{selectedOrder.telegram_id || 'ندارد'}</span>
              </div>
              <div>
                <span className="text-[#958ea0] block">تاریخ ثبت:</span>
                <span className="text-[#e5e2e1] font-mono">
                  {new Date(selectedOrder.created_at).toLocaleDateString('fa-IR')}
                </span>
              </div>
            </div>

            {/* Description */}
            <div className="mb-6">
              <h4 className="text-xs font-bold text-[#958ea0] mb-2">توضیحات و نیازمندی‌های مشتری:</h4>
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/10 text-xs text-[#e5e2e1] leading-relaxed whitespace-pre-line">
                {selectedOrder.description}
              </div>
            </div>

            {/* Attached Files Section */}
            {(() => {
              const matchedFiles = storageFiles.filter((f) => f.orderCode === selectedOrder.order_code);
              const hasFileInDesc = selectedOrder.description?.includes('/uploads/');
              const urlMatch = hasFileInDesc ? selectedOrder.description.match(/\/uploads\/[^\s\)]+/) : null;
              const attachedUrl = selectedOrder.attached_file_url || (urlMatch ? urlMatch[0] : null);
              const attachedName = selectedOrder.attached_file_name || (hasFileInDesc ? 'فایل پیوست سفارش' : null);

              if (matchedFiles.length === 0 && !attachedUrl) return null;

              return (
                <div className="mb-6 p-4 rounded-xl bg-gradient-to-br from-[#38bdf8]/10 to-[#d0bcff]/10 border border-[#38bdf8]/30 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Paperclip className="w-4 h-4 text-[#38bdf8]" />
                      <span>فایل‌های پیوست ارسالی کارفرما:</span>
                    </span>
                    <span className="text-[10px] font-mono text-[#38bdf8] px-2 py-0.5 rounded bg-black/40 border border-[#38bdf8]/30">
                      {matchedFiles.length || 1} فایل در سرور
                    </span>
                  </div>

                  <div className="space-y-2">
                    {matchedFiles.map((file) => (
                      <div key={file.id} className="p-3 rounded-xl bg-black/50 border border-white/10 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5 overflow-hidden">
                          <FolderOpen className="w-5 h-5 text-[#d0bcff] shrink-0" />
                          <div className="text-right truncate">
                            <span className="text-xs font-semibold text-white block truncate">{file.fileName}</span>
                            <span className="text-[10px] text-[#8c94a4] font-mono block">
                              {(file.sizeBytes / (1024 * 1024)).toFixed(2)} MB · {new Date(file.uploadDate).toLocaleDateString('fa-IR')}
                            </span>
                          </div>
                        </div>
                        <a
                          href={file.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1.5 rounded-lg bg-[#38bdf8] hover:bg-[#38bdf8]/90 text-black font-bold text-xs flex items-center gap-1.5 transition-all shadow-md shrink-0 cursor-pointer"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>دانلود فایل</span>
                        </a>
                      </div>
                    ))}

                    {matchedFiles.length === 0 && attachedUrl && (
                      <div className="p-3 rounded-xl bg-black/50 border border-white/10 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5 overflow-hidden">
                          <FolderOpen className="w-5 h-5 text-[#d0bcff] shrink-0" />
                          <div className="text-right truncate">
                            <span className="text-xs font-semibold text-white block truncate">{attachedName || 'فایل پیوست سفارش'}</span>
                            <span className="text-[10px] text-[#8c94a4] font-mono block">ذخیره شده در سرور</span>
                          </div>
                        </div>
                        <a
                          href={attachedUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1.5 rounded-lg bg-[#38bdf8] hover:bg-[#38bdf8]/90 text-black font-bold text-xs flex items-center gap-1.5 transition-all shadow-md shrink-0 cursor-pointer"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>دانلود فایل</span>
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              );
            })()}

            {/* Status Update Form */}
            <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 mb-6 space-y-4">
              <h4 className="text-xs font-bold text-[#d0bcff]">بروزرسانی وضعیت سفارش:</h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-[#958ea0] block mb-1">وضعیت جدید:</label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as OrderStatus)}
                    className="w-full bg-black/50 border border-white/15 rounded-lg p-2 text-xs text-[#e5e2e1] outline-none"
                  >
                    <option value="new">🟡 جدید (New)</option>
                    <option value="approved">🔍 تایید شده / در بررسی (Approved)</option>
                    <option value="in_progress">⚡ در حال طراحی و اجرا (In Progress)</option>
                    <option value="completed">✅ تکمیل و تحویل داده شد (Completed)</option>
                    <option value="rejected">❌ رد شده (Rejected)</option>
                    <option value="cancelled">🚫 لغو شده (Cancelled)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] text-[#958ea0] block mb-1">یادداشت فنی / پیام به مشتری:</label>
                  <input
                    type="text"
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    placeholder="مثلاً: فاز اول با موفقیت آماده شد"
                    className="w-full bg-black/50 border border-white/15 rounded-lg p-2 text-xs text-[#e5e2e1] outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-xs text-[#958ea0]">
                  <input
                    type="checkbox"
                    checked={notifyClient}
                    onChange={(e) => setNotifyClient(e.target.checked)}
                    className="rounded border-white/20 bg-black/40 text-[#d0bcff]"
                  />
                  <span>ارسال اعلان خودکار به حساب تلگرام کاربر</span>
                </label>

                <button
                  type="button"
                  disabled={isUpdating}
                  onClick={handleUpdateStatus}
                  className="px-4 py-2 rounded-xl bg-[#d0bcff] hover:bg-[#d0bcff]/90 text-[#131313] font-bold text-xs transition-all disabled:opacity-50"
                >
                  {isUpdating ? 'در حال ثبت...' : 'ذخیره تغییرات'}
                </button>
              </div>
            </div>

            {/* Send Direct Telegram Message */}
            {selectedOrder.telegram_id && selectedOrder.telegram_id > 0 && (
              <form onSubmit={handleSendDirectMessage} className="p-4 rounded-xl bg-black/40 border border-white/10">
                <h4 className="text-xs font-bold text-[#adc6ff] mb-2 flex items-center gap-1.5">
                  <Send className="w-3.5 h-3.5" />
                  <span>ارسال پیام مستقیم به تلگرام مشتری ({selectedOrder.telegram_id})</span>
                </h4>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={directMessage}
                    onChange={(e) => setDirectMessage(e.target.value)}
                    placeholder="متن پیام به کاربر در تلگرام..."
                    className="flex-1 bg-black/50 border border-white/15 rounded-xl px-3 py-2 text-xs text-[#e5e2e1] outline-none"
                  />
                  <button
                    type="submit"
                    disabled={isSendingMessage || !directMessage.trim()}
                    className="px-4 py-2 rounded-xl bg-[#adc6ff] hover:bg-[#adc6ff]/90 text-[#131313] font-bold text-xs transition-all disabled:opacity-50"
                  >
                    {isSendingMessage ? 'در حال ارسال...' : 'ارسال'}
                  </button>
                </div>
              </form>
            )}

            {/* Action Bar: Delete Project */}
            <div className="flex flex-wrap items-center justify-end gap-3 pt-4 border-t border-white/10 mt-6">

              <button
                type="button"
                onClick={() => {
                  setOrderToDelete(selectedOrder);
                }}
                className="px-4 py-2.5 rounded-xl bg-red-600/15 hover:bg-red-600/25 text-red-400 border border-red-500/30 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer mr-auto"
                title="حذف کامل این سفارش از سیستم"
              >
                <Trash2 className="w-4 h-4" />
                <span>حذف کامل این سفارش</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
