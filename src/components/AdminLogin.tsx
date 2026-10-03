import React, { useState } from 'react';
import { Shield, KeyRound, User, Sparkles } from 'lucide-react';
import { adminLogin } from '../services/api';

interface AdminLoginProps {
  lang: 'fa' | 'en';
  onLoginSuccess: (token: string) => void;
  onCancel: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ lang, onLoginSuccess, onCancel }) => {
  const [username, setUsername] = useState('RITMF');
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

    setLoading(true);
    try {
      const data = await adminLogin({ email: username.trim(), password: password.trim() });
      if (data.success && data.token) {
        localStorage.setItem('ritm_admin_token', data.token);
        onLoginSuccess(data.token);
      } else {
        setError(data.error || (lang === 'fa' ? 'نام کاربری یا رمز عبور ادمین نادرست است.' : 'Invalid admin credentials.'));
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
            ? 'ورود به داشبورد نظارت بر سفارشات، مدیریت نمونه‌کارها و تنظیمات سیستم.'
            : 'Access project monitoring, portfolio editing, and system controls.'}
        </p>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs text-right leading-relaxed">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-right">
          <div>
            <label className="block text-xs font-semibold text-[#958ea0] mb-1.5">
              {lang === 'fa' ? 'نام کاربری ادمین (Username):' : 'Admin Username:'}
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="RITMF"
                className="w-full bg-black/50 border border-white/15 focus:border-[#d0bcff] rounded-xl px-4 py-2.5 text-xs text-[#e5e2e1] outline-none font-mono dir-ltr text-left"
              />
              <User className="w-4 h-4 text-[#958ea0] absolute left-3 top-3 pointer-events-none" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#958ea0] mb-1.5">
              {lang === 'fa' ? 'رمز عبور (Password):' : 'Admin Password:'}
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


          <div className="pt-2 flex items-center gap-3">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 rounded-xl bg-[#d0bcff] hover:bg-[#d0bcff]/90 text-[#131313] font-bold text-xs transition-all shadow-lg hover:shadow-[#d0bcff]/20 cursor-pointer disabled:opacity-50"
            >
              {loading
                ? (lang === 'fa' ? 'در حال بررسی...' : 'Verifying...')
                : (lang === 'fa' ? 'ورود به پنل مدیریت' : 'Enter Admin Panel')}
            </button>

            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-[#958ea0] text-xs font-semibold transition-colors cursor-pointer"
            >
              {lang === 'fa' ? 'انصراف' : 'Cancel'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
