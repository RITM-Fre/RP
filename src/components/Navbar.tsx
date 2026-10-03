import React, { useState, useEffect } from 'react';
import {
  Home,
  ShoppingBag,
  FolderKanban,
  Clock,
  Globe,
  Shield,
  Terminal,
  LogOut,
  User,
  Download,
  Smartphone,
} from 'lucide-react';
import { AuthUser } from '../types';

interface NavbarProps {
  activeTab: 'home' | 'order' | 'admin' | 'portfolio' | 'status' | 'client';
  setActiveTab: (tab: 'home' | 'order' | 'admin' | 'portfolio' | 'status' | 'client') => void;
  lang: 'fa' | 'en';
  setLang: (lang: 'fa' | 'en') => void;
  pendingCount?: number;
  currentUser?: AuthUser | null;
  isAdminLoggedIn?: boolean;
  onAdminLogout?: () => void;
  onOpenAdminLogin: () => void;
  onOpenInstallModal?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  lang,
  setLang,
  pendingCount = 0,
  currentUser = null,
  isAdminLoggedIn = false,
  onAdminLogout,
  onOpenAdminLogin: _onOpenAdminLogin,
  onOpenInstallModal,
}) => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPos =
        window.scrollY ||
        document.documentElement.scrollTop ||
        document.body.scrollTop ||
        0;
      setScrolled(scrollPos > 12);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('touchmove', handleScroll, { passive: true });
    document.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('touchmove', handleScroll);
      document.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <header
      className={`fixed top-0 inset-x-0 z-[100] w-full px-2.5 sm:px-4 pointer-events-none transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
        scrolled ? 'pt-1.5 pb-1' : 'pt-2.5 pb-1.5 sm:pt-3.5'
      }`}
    >
      {/* 3-ISLAND FLOATING CONTAINER (DESKTOP & MOBILE) */}
      <div
        className={`max-w-6xl mx-auto flex items-center justify-between gap-1.5 sm:gap-2.5 pointer-events-auto transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          scrolled ? 'scale-[0.98]' : 'scale-100'
        }`}
      >
        {/* ========================================================= */}
        {/* ISLAND 1: BRAND (Smooth Semi-Circular Pill - Rounded Full) */}
        {/* ========================================================= */}
        <div
          onClick={() => setActiveTab('home')}
          className={`flex items-center gap-2 rounded-full cursor-pointer select-none transition-all duration-300 group border shrink-0 ${
            scrolled
              ? 'py-1 px-3 sm:py-1.5 sm:px-4 bg-[#07080c]/95 backdrop-blur-2xl border-[#d0bcff]/25 shadow-[0_8px_30px_rgba(0,0,0,0.85)]'
              : 'py-1.5 px-3.5 sm:py-2 sm:px-4.5 bg-[#0d0f16]/90 backdrop-blur-xl border-white/10 shadow-[0_4px_20px_rgba(0,0,0,0.4)]'
          } hover:border-[#d0bcff]/50 hover:shadow-[0_0_20px_rgba(208,188,255,0.25)] active:scale-95`}
          title={lang === 'fa' ? 'ریتم' : 'RITM'}
        >
          {/* Logo circular icon */}
          <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full overflow-hidden bg-black/80 border border-white/20 p-0.5 flex items-center justify-center shrink-0 group-hover:border-[#d0bcff] transition-all">
            <img
              src={`${import.meta.env.BASE_URL}assets/logo.png`}
              alt="RITM"
              className="w-full h-full object-contain"
            />
          </div>

          {/* Clean Wordmark: strictly "ریتم" / "RITM" */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs sm:text-[13px] font-black tracking-tight text-white group-hover:text-[#d0bcff] transition-colors whitespace-nowrap">
              {lang === 'fa' ? 'ریتم' : 'RITM'}
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#a3e635] shadow-[0_0_8px_#a3e635] animate-pulse shrink-0" />
          </div>
        </div>

        {/* ========================================================= */}
        {/* ISLAND 2: NAVIGATION TABS (Center Island - Pill Capsule)  */}
        {/* ========================================================= */}
        <nav
          className={`hidden md:flex items-center gap-1 rounded-full transition-all duration-300 border ${
            scrolled
              ? 'p-1 bg-[#07080c]/95 backdrop-blur-2xl border-[#d0bcff]/25 shadow-[0_8px_30px_rgba(0,0,0,0.85)]'
              : 'p-1.5 bg-[#0d0f16]/90 backdrop-blur-xl border-white/10 shadow-[0_4px_20px_rgba(0,0,0,0.4)]'
          }`}
        >
          {/* Home */}
          <button
            onClick={() => setActiveTab('home')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs transition-all duration-200 cursor-pointer ${
              activeTab === 'home'
                ? 'bg-white/15 text-white font-bold shadow-sm'
                : 'text-[#9da3af] hover:text-white hover:bg-white/[0.05]'
            }`}
          >
            <Home className="w-3.5 h-3.5" strokeWidth={1.75} />
            <span>{lang === 'fa' ? 'خانه' : 'Home'}</span>
          </button>

          {/* Order Project (Accent Capsule) */}
          <button
            onClick={() => setActiveTab('order')}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold transition-all duration-200 cursor-pointer ${
              activeTab === 'order'
                ? 'bg-[#d0bcff] text-[#0b0c10] shadow-[0_0_16px_rgba(208,188,255,0.45)]'
                : 'text-[#d0bcff] bg-[#d0bcff]/10 hover:bg-[#d0bcff]/20 border border-[#d0bcff]/25'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" strokeWidth={2} />
            <span>{lang === 'fa' ? 'ثبت سفارش' : 'Order'}</span>
          </button>

          {/* Portfolio */}
          <button
            onClick={() => setActiveTab('portfolio')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs transition-all duration-200 cursor-pointer ${
              activeTab === 'portfolio'
                ? 'bg-white/15 text-white font-bold shadow-sm'
                : 'text-[#9da3af] hover:text-white hover:bg-white/[0.05]'
            }`}
          >
            <FolderKanban className="w-3.5 h-3.5" strokeWidth={1.75} />
            <span>{lang === 'fa' ? 'نمونه‌کارها' : 'Portfolio'}</span>
          </button>

          {/* Tracking */}
          <button
            onClick={() => setActiveTab('client')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs transition-all duration-200 cursor-pointer ${
              activeTab === 'client'
                ? 'bg-white/15 text-white font-bold shadow-sm'
                : 'text-[#9da3af] hover:text-white hover:bg-white/[0.05]'
            }`}
          >
            <Clock className="w-3.5 h-3.5 text-[#adc6ff]" strokeWidth={1.75} />
            <span>{lang === 'fa' ? 'پیگیری سفارش' : 'Track'}</span>
          </button>

          {/* Desktop Admin Tabs (Only if logged in) */}
          {isAdminLoggedIn && (
            <>
              <div className="h-3 w-[1px] bg-white/15 mx-0.5" />
              <button
                onClick={() => setActiveTab('admin')}
                className={`flex items-center gap-1 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'admin'
                    ? 'bg-[#d0bcff]/20 text-[#d0bcff] border border-[#d0bcff]/40 shadow-sm'
                    : 'text-[#d0bcff]/80 hover:text-[#d0bcff] hover:bg-white/[0.05]'
                }`}
              >
                <Shield className="w-3.5 h-3.5" />
                <span>{lang === 'fa' ? 'پنل ادمین' : 'Admin'}</span>
                {pendingCount > 0 && (
                  <span className="px-1.5 rounded-full bg-[#ffb869] text-[#131313] text-[9px] font-bold">
                    {pendingCount}
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveTab('status')}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs transition-all cursor-pointer ${
                  activeTab === 'status'
                    ? 'bg-white/15 text-white font-bold'
                    : 'text-[#9da3af] hover:text-white hover:bg-white/[0.05]'
                }`}
              >
                <Terminal className="w-3 h-3 text-[#adc6ff]" />
                <span>{lang === 'fa' ? 'لاگ' : 'Logs'}</span>
              </button>
            </>
          )}
        </nav>

        {/* ========================================================= */}
        {/* ISLAND 3: ACTIONS & AUTH (Clean Semi-Circular Pill)        */}
        {/* ========================================================= */}
        <div
          className={`flex items-center gap-1 sm:gap-1.5 rounded-full transition-all duration-300 border shrink-0 ${
            scrolled
              ? 'p-1 bg-[#07080c]/95 backdrop-blur-2xl border-[#d0bcff]/25 shadow-[0_8px_30px_rgba(0,0,0,0.85)]'
              : 'p-1.5 bg-[#0d0f16]/90 backdrop-blur-xl border-white/10 shadow-[0_4px_20px_rgba(0,0,0,0.4)]'
          }`}
        >
          {/* User state / Login */}
          {currentUser ? (
            <button
              onClick={() => setActiveTab('client')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.06] border border-white/10 text-xs text-[#d0bcff] font-semibold hover:bg-white/10 transition-colors cursor-pointer"
              title="ورود به پنل کاربری"
            >
              <User className="w-3.5 h-3.5 text-[#d0bcff]" />
              <span className="max-w-[70px] sm:max-w-[95px] truncate">{currentUser.first_name || currentUser.username}</span>
            </button>
          ) : (
            <button
              onClick={() => setActiveTab('client')}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-xs text-white font-medium hover:text-[#d0bcff] transition-all cursor-pointer whitespace-nowrap"
            >
              <User className="w-3.5 h-3.5 text-[#d0bcff]" />
              <span>{lang === 'fa' ? 'ورود کاربر' : 'Login'}</span>
            </button>
          )}

          {/* Admin Logout (Desktop only, if admin is logged in) */}
          {isAdminLoggedIn && onAdminLogout && (
            <button
              onClick={onAdminLogout}
              className="hidden sm:inline-flex p-1.5 px-3 rounded-full bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 text-xs items-center gap-1 transition-colors cursor-pointer"
              title="خروج از پنل ادمین"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>{lang === 'fa' ? 'خروج' : 'Logout'}</span>
            </button>
          )}

          {/* PWA Install Button (Mobile & Desktop) */}
          {onOpenInstallModal && (
            <button
              onClick={onOpenInstallModal}
              className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full bg-[#d0bcff]/15 hover:bg-[#d0bcff]/25 border border-[#d0bcff]/30 text-xs font-bold text-[#d0bcff] hover:text-white transition-all cursor-pointer shadow-sm hover:shadow-[0_0_12px_rgba(208,188,255,0.3)] active:scale-95"
              title={lang === 'fa' ? 'نصب اپلیکیشن ریتم روی گوشی' : 'Install RITM App'}
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">{lang === 'fa' ? 'نصب ریتم' : 'Install'}</span>
            </button>
          )}

          {/* Language Switcher */}
          <button
            onClick={() => setLang(lang === 'fa' ? 'en' : 'fa')}
            className="flex items-center gap-0.5 px-2.5 py-1.5 rounded-full border border-white/10 hover:border-white/20 text-[10px] font-mono text-[#9da3af] hover:text-white transition-colors bg-white/[0.02] cursor-pointer"
            title="Switch Language"
          >
            <Globe className="w-3 h-3" />
            <span>{lang === 'fa' ? 'EN' : 'فا'}</span>
          </button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* MOBILE COMPACT FLOATING DOCK (Clean 4 Tabs - No Chat)     */}
      {/* ========================================================= */}
      <div className="md:hidden fixed bottom-3 inset-x-4 max-w-xs mx-auto z-[100] rounded-full bg-[#08090e]/95 backdrop-blur-2xl border border-white/20 shadow-[0_12px_36px_rgba(0,0,0,0.9)] p-1.5 flex items-center justify-around text-xs pointer-events-auto">
        <button
          onClick={() => setActiveTab('home')}
          className={`flex flex-col items-center gap-0.5 px-3.5 py-1 rounded-full transition-all cursor-pointer ${
            activeTab === 'home' ? 'bg-white/15 text-white font-bold' : 'text-[#9da3af] hover:text-white'
          }`}
        >
          <Home className="w-4 h-4" />
          <span className="text-[9px]">{lang === 'fa' ? 'خانه' : 'Home'}</span>
        </button>

        <button
          onClick={() => setActiveTab('order')}
          className={`flex flex-col items-center gap-0.5 px-4 py-1 rounded-full transition-all cursor-pointer ${
            activeTab === 'order'
              ? 'bg-[#d0bcff] text-[#0b0c10] font-bold shadow-[0_0_12px_rgba(208,188,255,0.45)]'
              : 'text-[#d0bcff]'
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          <span className="text-[9px] font-bold">{lang === 'fa' ? 'سفارش' : 'Order'}</span>
        </button>

        <button
          onClick={() => setActiveTab('portfolio')}
          className={`flex flex-col items-center gap-0.5 px-3.5 py-1 rounded-full transition-all cursor-pointer ${
            activeTab === 'portfolio' ? 'bg-white/15 text-white font-bold' : 'text-[#9da3af] hover:text-white'
          }`}
        >
          <FolderKanban className="w-4 h-4" />
          <span className="text-[9px]">{lang === 'fa' ? 'نمونه‌ها' : 'Work'}</span>
        </button>

        <button
          onClick={() => setActiveTab('client')}
          className={`flex flex-col items-center gap-0.5 px-3.5 py-1 rounded-full transition-all cursor-pointer ${
            activeTab === 'client' ? 'bg-white/15 text-white font-bold' : 'text-[#9da3af] hover:text-white'
          }`}
        >
          <Clock className="w-4 h-4 text-[#adc6ff]" />
          <span className="text-[9px]">{lang === 'fa' ? 'پیگیری' : 'Track'}</span>
        </button>
      </div>
    </header>
  );
};
