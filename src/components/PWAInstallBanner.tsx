import React, { useState, useEffect } from 'react';
import { Download, Smartphone, X, Sparkles, ArrowLeft } from 'lucide-react';

interface PWAInstallBannerProps {
  onOpenInstallModal: () => void;
  isInstalled: boolean;
  lang?: 'fa' | 'en';
}

export const PWAInstallBanner: React.FC<PWAInstallBannerProps> = ({
  onOpenInstallModal,
  isInstalled,
  lang = 'fa',
}) => {
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    try {
      const dismissed = sessionStorage.getItem('ritm_pwa_banner_dismissed');
      if (dismissed === 'true') {
        setIsDismissed(true);
      }
    } catch (e) {}
  }, []);

  if (isInstalled || isDismissed) {
    return null;
  }

  const handleDismiss = () => {
    setIsDismissed(true);
    try {
      sessionStorage.setItem('ritm_pwa_banner_dismissed', 'true');
    } catch (e) {}
  };

  return (
    <div
      dir={lang === 'fa' ? 'rtl' : 'ltr'}
      className="fixed bottom-3 sm:bottom-4 inset-x-3 sm:inset-x-auto sm:left-4 sm:max-w-md z-40 animate-slide-up"
    >
      <div className="relative overflow-hidden rounded-2xl bg-[#11131c]/95 border border-[#d0bcff]/30 p-3.5 sm:p-4 shadow-2xl shadow-black/80 backdrop-blur-xl flex items-center justify-between gap-3">
        {/* Ambient Glow */}
        <div className="absolute -right-8 -top-8 w-24 h-24 bg-[#d0bcff]/15 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -left-8 -bottom-8 w-24 h-24 bg-[#38bdf8]/15 rounded-full blur-2xl pointer-events-none" />

        {/* Icon & Details */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="relative w-11 h-11 rounded-xl bg-gradient-to-br from-[#d0bcff] to-[#7c3aed] p-0.5 shadow-md shadow-[#d0bcff]/20 shrink-0 flex items-center justify-center">
            <img
              src="/assets/logo.png"
              alt="RITM"
              className="w-full h-full object-contain rounded-[10px]"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-white tracking-wide truncate">
                {lang === 'fa' ? 'نصب اپلیکیشن ریتم' : 'Install RITM App'}
              </span>
              <span className="px-1.5 py-0.5 rounded-full bg-[#a3e635]/20 text-[#a3e635] text-[9px] font-black shrink-0">
                PWA
              </span>
            </div>
            <p className="text-[11px] text-[#8c94a4] truncate">
              {lang === 'fa' ? 'دسترسی سریع و بدون نیاز به مرورگر' : 'Fast 1-tap mobile access'}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onOpenInstallModal}
            className="px-3.5 py-2 rounded-xl bg-[#d0bcff] hover:bg-[#d0bcff]/90 text-[#0d0f17] font-extrabold text-xs transition-all flex items-center gap-1.5 shadow-md shadow-[#d0bcff]/20 cursor-pointer active:scale-95"
          >
            <Download className="w-3.5 h-3.5 fill-current" />
            <span>{lang === 'fa' ? 'نصب' : 'Install'}</span>
          </button>

          <button
            onClick={handleDismiss}
            aria-label="Dismiss banner"
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-[#8c94a4] hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
