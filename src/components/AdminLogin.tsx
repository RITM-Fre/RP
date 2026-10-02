import React, { useState } from 'react';
import { Shield, KeyRound, Lock, User, Mail } from 'lucide-react';
import { adminLogin } from '../services/api';

interface AdminLoginProps {
  lang: 'fa' | 'en';
  onLoginSuccess: (token: string) => void;
  onCancel: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ lang, onLoginSuccess, onCancel }) => {
  const [loginMode, setLoginMode] = useState<'master' | 'user'>('master');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!password.trim()) {
      setError(lang === 'fa' ? 'لطفاً رمز عبور را وارد کنید.' : 'Please enter password.');
      return;
    }

    if (loginMode === 'user' && !email.trim()) {
      setError(lang === 'fa' ? 'لطفاً ایمیل یا نام کاربری ادمین را وارد کنید.' : 'Please enter admin email.');
      return;
    }

    setLoading(true);
    try {
      const payload = loginMode === 'user' ? { email: email.trim(), password: password.trim() } : password.trim();
      const data = await adminLogin(payload);
      if (data.success && data.token) {
        localStorage.setItem('ritm_admin_token', data.token);
        onLoginSuccess(data.token);
      } else {
        setError(data.error || (lang === 'fa' ? 'اطلاعات ورود ادمین نادرست است.' : 'Invalid admin credentials.'));
      }
    } catch (err: any) {
      setError(lang === 'fa' ? 'خطا در ارتباط با سرور.' : 'Connection error.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-8 px-4">
      <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-white/10 shadow-2xl text-center relative overflow-hidden">
        {/* Glow Badge */}
        <div className="w-16 h-16 rounded-2xl bg-[#d0bcff]/15 border border-[#d0bcff]/30 flex items-center justify-center mx-auto mb-4 text-[#d0bcff] shadow-[0_0_24px_rgba(208,188,255,0.2)]">
          <Shield className="w-8 h-8" />
        </div>

        <span className="font-mono text-[11px] text-[#d0bcff] uppercase tracking-wider block mb-1">
          {lang === 'fa' ? 'احراز هویت مدیریت' : 'Restricted Admin Access'}
        </span>

        <h2 className="text-xl font-black text-[#e5e2e1] mb-2">
          {lang === 'fa' ? 'ورود به پنل مدیریت ریتم' : 'RITM Admin Portal'}
        </h2>

        <p className="text-xs text-[#958ea0] mb-5 leading-relaxed">
          {lang === 'fa'
            ? 'ورود به داشبورد نظارت بر سفارشات، مدیریت کاربران و تنظیمات سیستم.'
            : 'Access project monitoring, user roles, and studio settings.'}
        </p>

        {/* Login Method Toggle */}
        <div className="flex p-1 rounded-xl bg-black/40 border border-white/10 mb-5 text-xs">
          <button
            type="button"
            onClick={() => {
              setLoginMode('master');
              setError('');
            }}
            className={`flex-1 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
              loginMode === 'master' ? 'bg-[#d0bcff] text-[#131313] font-bold shadow-sm' : 'text-[#958ea0] hover:text-white'
            }`}
          >
            {lang === 'fa' ? 'رمز مدیریت کل' : 'Master Key'}
          </button>
          <button
            type="button"
            onClick={() => {
              setLoginMode('user');
              setError('');
            }}
            className={`flex-1 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
              loginMode === 'user' ? 'bg-[#d0bcff] text-[#131313] font-bold shadow-sm' : 'text-[#958ea0] hover:text-white'
            }`}
          >
            {lang === 'fa' ? 'حساب ادمین اختصاصی' : 'Admin Account'}
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs text-right leading-relaxed">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-right">
          {loginMode === 'user' && (
            <div>
              <label className="block text-xs font-semibold text-[#958ea0] mb-1.5">
                {lang === 'fa' ? 'ایمیل یا نام کاربری ادمین:' : 'Admin Email:'}
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@example.com"
                  className="w-full bg-black/50 border border-white/15 focus:border-[#d0bcff] rounded-xl px-4 py-2.5 text-xs text-[#e5e2e1] outline-none dir-ltr text-left"
                />
                <Mail className="w-4 h-4 text-[#958ea0] absolute left-3 top-3 pointer-events-none" />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-[#958ea0] mb-1.5">
              {lang === 'fa' ? 'رمز عبور ادمین:' : 'Admin Password:'}
            </label>
            <div className="relative">
              <input
                type="password"
                required
                autoFocus
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-black/50 border border-white/15 focus:border-[#d0bcff] rounded-xl px-4 py-2.5 text-xs text-[#e5e2e1] outline-none font-mono dir-ltr text-left"
              />
              <KeyRound className="w-4 h-4 text-[#958ea0] absolute left-3 top-3 pointer-events-none" />
            </div>
          </div>

          <div className="pt-2 flex flex-col gap-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-[#d0bcff] hover:bg-[#d0bcff]/90 text-[#131313] font-bold text-xs transition-all shadow-lg shadow-[#d0bcff]/20 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-[#131313] border-t-transparent rounded-full animate-spin" />
                  <span>{lang === 'fa' ? 'در حال بررسی...' : 'Verifying...'}</span>
                </>
              ) : (
                <>
                  <Shield className="w-4 h-4" />
                  <span>{lang === 'fa' ? 'ورود به پنل مدیریت' : 'Enter Dashboard'}</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={onCancel}
              className="w-full py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs text-[#958ea0] hover:text-[#e5e2e1] transition-all cursor-pointer"
            >
              {lang === 'fa' ? 'انصراف و بازگشت' : 'Cancel'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
