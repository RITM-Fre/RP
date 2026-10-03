import React from 'react';
import {
  Download,
  X,
  Smartphone,
  Share,
  PlusSquare,
  CheckCircle2,
  Sparkles,
  Zap,
  ShieldCheck,
  ArrowDown
} from 'lucide-react';

interface PWAInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInstall: () => void;
  isInstallable: boolean;
  isIOS: boolean;
  lang?: 'fa' | 'en';
}

export const PWAInstallModal: React.FC<PWAInstallModalProps> = ({
  isOpen,
  onClose,
  onInstall,
  isInstallable,
  isIOS,
  lang = 'fa',
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[250] flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto animate-fade-in">
      <div
        dir={lang === 'fa' ? 'rtl' : 'ltr'}
        className="relative w-full max-w-lg bg-[#0e1017]/95 border border-white/15 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-[#d0bcff]/10 text-right space-y-6 my-auto"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 left-4 p-2 rounded-full bg-white/5 hover:bg-white/10 text-[#8c94a4] hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header with App Logo & Title */}
        <div className="flex items-center gap-4">
          <div className="relative w-16 h-16 rounded-2xl p-1 bg-gradient-to-br from-[#d0bcff]/40 via-[#38bdf8]/20 to-transparent border border-white/20 shadow-lg shadow-[#d0bcff]/20 flex items-center justify-center overflow-hidden shrink-0">
            <img
              src="/assets/logo.png"
              alt="RITM Logo"
              className="w-full h-full object-contain rounded-xl"
              onError={(e) => {
                // Fallback icon if image fails
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
          </div>

          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#d0bcff]/15 border border-[#d0bcff]/30 text-[11px] font-bold text-[#d0bcff]">
              <Sparkles className="w-3 h-3" />
              <span>{lang === 'fa' ? 'نسخه رسمی وب‌اپلیکیشن (PWA)' : 'Official Web App (PWA)'}</span>
            </div>
            <h3 className="text-xl font-black text-white">
              {lang === 'fa' ? 'نصب اپلیکیشن ریتم روی گوشی' : 'Install RITM App'}
            </h3>
            <p className="text-xs text-[#8c94a4]">
              {lang === 'fa'
                ? 'دسترسی فوق‌سریع بدون نیاز به دانلود از بازار یا گوگل‌پلی'
                : 'Fast direct access without app stores'}
            </p>
          </div>
        </div>

        {/* Benefits Badges */}
        <div className="grid grid-cols-3 gap-2 py-1">
          <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5 text-center space-y-1">
            <Zap className="w-4 h-4 mx-auto text-[#a3e635]" />
            <div className="text-[11px] font-bold text-white">{lang === 'fa' ? 'فوق‌سریع' : 'Blazing Fast'}</div>
            <div className="text-[9px] text-[#8c94a4]">{lang === 'fa' ? 'کمتر از ۱ مگابایت' : '< 1 MB size'}</div>
          </div>
          <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5 text-center space-y-1">
            <Smartphone className="w-4 h-4 mx-auto text-[#38bdf8]" />
            <div className="text-[11px] font-bold text-white">{lang === 'fa' ? 'صفحه اصلی' : 'Home Screen'}</div>
            <div className="text-[9px] text-[#8c94a4]">{lang === 'fa' ? 'مثل برنامه نیتیو' : 'Native look'}</div>
          </div>
          <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5 text-center space-y-1">
            <ShieldCheck className="w-4 h-4 mx-auto text-[#d0bcff]" />
            <div className="text-[11px] font-bold text-white">{lang === 'fa' ? 'امن و پایدار' : '100% Safe'}</div>
            <div className="text-[9px] text-[#8c94a4]">{lang === 'fa' ? 'آپدیت خودکار' : 'Auto updates'}</div>
          </div>
        </div>

        {/* Action / Instructions depending on device & browser */}
        {isInstallable ? (
          <div className="space-y-4 pt-1">
            <div className="p-4 rounded-2xl bg-gradient-to-r from-[#d0bcff]/10 to-[#38bdf8]/10 border border-[#d0bcff]/20 text-xs text-[#cfd3dc] leading-relaxed">
              {lang === 'fa'
                ? 'مرورگر شما از نصب مستقیم با یک کلیک پشتیبانی می‌کند! کافیست روی دکمه زیر کلیک کنید و گزینه Install یا «افزودن» را تایید نمایید.'
                : 'Your browser supports 1-click installation! Click the button below.'}
            </div>

            <button
              onClick={() => {
                onInstall();
                onClose();
              }}
              className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-[#d0bcff] to-[#b69df8] hover:from-[#d0bcff]/90 hover:to-[#b69df8]/90 text-[#0d0f17] font-black text-sm flex items-center justify-center gap-2 shadow-xl shadow-[#d0bcff]/25 transition-all cursor-pointer hover:scale-[1.01] active:scale-[0.98]"
            >
              <Download className="w-5 h-5 fill-current" />
              <span>{lang === 'fa' ? 'نصب آنی اپلیکیشن ریتم' : 'Install RITM App Now'}</span>
            </button>
          </div>
        ) : isIOS ? (
          /* iOS Safari Specific Step-by-Step Interactive Guide */
          <div className="space-y-3 pt-1">
            <div className="text-xs font-bold text-[#d0bcff] flex items-center gap-1.5">
              <span>راهنمای نصب ویژه آیفون و آیپد (iOS Safari):</span>
            </div>

            <div className="space-y-2.5 text-xs text-[#cfd3dc]">
              {/* Step 1 */}
              <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10 flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg bg-[#38bdf8]/20 text-[#38bdf8] flex items-center justify-center font-bold text-xs shrink-0">
                  ۱
                </div>
                <div className="flex-1">
                  در نوار پایین یا بالای مرورگر سافاری (Safari)، دکمه{' '}
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-white/10 text-white font-bold mx-1">
                    <Share className="w-3 h-3 text-[#38bdf8]" /> اشتراک‌گذاری (Share)
                  </span>{' '}
                  را لمس کنید.
                </div>
              </div>

              {/* Step 2 */}
              <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10 flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg bg-[#d0bcff]/20 text-[#d0bcff] flex items-center justify-center font-bold text-xs shrink-0">
                  ۲
                </div>
                <div className="flex-1">
                  منو را کمی به پایین اسکرول کرده و گزینه{' '}
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-white/10 text-white font-bold mx-1">
                    <PlusSquare className="w-3 h-3 text-[#a3e635]" /> Add to Home Screen
                  </span>{' '}
                  (افزودن به صفحه اصلی) را انتخاب نمایید.
                </div>
              </div>

              {/* Step 3 */}
              <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10 flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg bg-[#a3e635]/20 text-[#a3e635] flex items-center justify-center font-bold text-xs shrink-0">
                  ۳
                </div>
                <div className="flex-1">
                  در گوشه بالا، دکمه <strong className="text-white font-black">Add</strong> یا «افزودن» را لمس کنید تا آیکون ریتم به صفحه گوشی شما اضافه شود.
                </div>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-full mt-2 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs transition-colors cursor-pointer"
            >
              متوجه شدم، انجام می‌دهم
            </button>
          </div>
        ) : (
          /* General Android Chrome / Desktop Guide */
          <div className="space-y-3 pt-1">
            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2 text-xs text-[#cfd3dc]">
              <div className="font-bold text-white flex items-center gap-1.5">
                <Smartphone className="w-4 h-4 text-[#d0bcff]" />
                <span>نحوه نصب در مرورگر کروم یا سایر مرورگرها:</span>
              </div>
              <p className="leading-relaxed">
                روی علامت ۳ نقطه <strong className="text-white">⋮</strong> در بالای مرورگر کلیک کنید و گزینه{' '}
                <strong className="text-[#d0bcff]">«نصب برنامه» (Install App)</strong> یا{' '}
                <strong className="text-[#38bdf8]">«افزودن به صفحه اصلی» (Add to Home screen)</strong> را بزنید.
              </p>
            </div>

            <button
              onClick={() => {
                onInstall();
                onClose();
              }}
              className="w-full py-3.5 px-6 rounded-2xl bg-[#d0bcff] hover:bg-[#d0bcff]/90 text-[#0d0f17] font-black text-sm flex items-center justify-center gap-2 cursor-pointer transition-transform active:scale-95"
            >
              <Download className="w-4 h-4 fill-current" />
              <span>تلاش برای نصب خودکار</span>
            </button>
          </div>
        )}

        {/* Footer Note */}
        <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[11px] text-[#8c94a4]">
          <span className="flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#a3e635]" />
            توسعه‌یافته مطابق استاندارد PWA گوگل
          </span>
          <span>نسخه 2.5.0</span>
        </div>
      </div>
    </div>
  );
};
