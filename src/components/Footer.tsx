import React from 'react';
import { Shield, Lock } from 'lucide-react';
import { SOCIAL_LINKS } from '../data/mockData';

interface FooterProps {
  lang: 'fa' | 'en';
  isAdminLoggedIn?: boolean;
  onOpenAdminLogin?: () => void;
  onNavigateToAdmin?: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  lang,
  isAdminLoggedIn = false,
  onOpenAdminLogin,
  onNavigateToAdmin,
}) => {
  const handleAdminClick = () => {
    if (isAdminLoggedIn && onNavigateToAdmin) {
      onNavigateToAdmin();
    } else if (onOpenAdminLogin) {
      onOpenAdminLogin();
    }
  };

  return (
    <footer className="w-full border-t border-white/[0.08] mt-auto pt-10 pb-32 sm:pb-12 bg-[#08090e] text-[#958ea0] relative z-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-center md:text-right">
        {/* Brand Lockup: Strictly "ریتم" */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full overflow-hidden bg-black/60 border border-white/10 p-0.5 flex items-center justify-center shrink-0">
            <img
              src={`${import.meta.env.BASE_URL}assets/logo.png`}
              alt="RITM"
              className="w-full h-full object-contain"
            />
          </div>
          <span className="text-[#e5e2e1] font-bold text-sm tracking-tight">
            {lang === 'fa' ? 'ریتم' : 'RITM'}
          </span>
          <span className="text-[11px] text-[#71717a] hidden sm:inline">
            {lang === 'fa' ? '| هنر و مهندسی دیجیتال' : '| Digital Art & Code'}
          </span>
        </div>

        {/* Social Links */}
        <div className="flex flex-wrap items-center justify-center gap-4 dir-ltr font-mono text-xs text-[#958ea0]">
          <a
            href={SOCIAL_LINKS.telegramChannel}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[#d0bcff] transition-colors"
          >
            Telegram
          </a>
          <span>·</span>
          <a
            href={SOCIAL_LINKS.youtube}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[#d0bcff] transition-colors"
          >
            YouTube
          </a>
          <span>·</span>
          <a
            href={SOCIAL_LINKS.x}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[#d0bcff] transition-colors"
          >
            X (Twitter)
          </a>
          <span>·</span>
          <a
            href={SOCIAL_LINKS.ble}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[#d0bcff] transition-colors"
          >
            Bale
          </a>
        </div>

        {/* Simple & Clean Admin Access Button + Copyright */}
        <div className="flex flex-col sm:flex-row items-center gap-3.5 w-full sm:w-auto">
          <button
            onClick={handleAdminClick}
            type="button"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-white/[0.06] hover:bg-[#d0bcff]/20 text-[#e5e2e1] hover:text-[#d0bcff] border border-white/15 hover:border-[#d0bcff]/40 transition-all text-xs font-semibold cursor-pointer shadow-sm active:scale-95"
            title="ورود به پنل مدیریت ریتم"
          >
            <Shield className="w-4 h-4 text-[#d0bcff]" />
            <span>
              {isAdminLoggedIn
                ? (lang === 'fa' ? 'پنل ادمین فعال (ورود به داشبورد)' : 'Admin Dashboard')
                : (lang === 'fa' ? 'ورود به پنل ادمین' : 'Admin Login')}
            </span>
            {!isAdminLoggedIn && <Lock className="w-3.5 h-3.5 text-[#ffb869] opacity-90" />}
          </button>

          <div className="font-mono text-[11px] text-[#71717a]">
            © {new Date().getFullYear()} RITM.
          </div>
        </div>
      </div>
    </footer>
  );
};
