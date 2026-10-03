import React, { useState } from 'react';
import {
  HelpCircle,
  ChevronDown,
  CreditCard,
  FolderSync,
  RefreshCw,
  ShieldCheck,
  Search,
  MessageCircle,
  Sparkles,
  Zap,
  CheckCircle2,
  Clock
} from 'lucide-react';

interface FaqItem {
  id: string;
  category: 'payment' | 'delivery' | 'revisions' | 'guarantee' | 'timing';
  question: string;
  shortAnswer: string;
  details: string[];
  icon: any;
  highlight?: string;
}

const FAQ_DATA: FaqItem[] = [
  {
    id: 'faq-1',
    category: 'payment',
    question: 'نحوه تسویه‌حساب و پرداخت هزینه‌ها چگونه است؟',
    shortAnswer: 'تسویه‌حساب در دو مرحله با نهایت احترام به اعتماد شما انجام می‌شود.',
    details: [
      'شروع کار با پیش‌پرداخت توافقی (معمولاً ۳۰ الی ۵۰ درصد مبلغ کل) آغاز می‌شود.',
      'نسخه اولیه پروژه با واترمرک ظریف ریتم جهت بازبینی و تایید برای شما ارسال خواهد شد.',
      'تسویه نهایی باقی‌مانده مبلغ، دقیقاً پس از اعلام رضایت کامل شما از کیفیت کار و قبل از ارسال فایل نسخه نهایی بدون واترمرک انجام می‌گیرد.',
      'برای پروژه‌های ماهانه (همکاری مستمر پکیجی)، امکان قرارداد دوره‌ای و پرداخت هفتگی یا ماهانه فراهم است.',
    ],
    icon: CreditCard,
    highlight: 'تسویه نهایی منوط به رضایت شما',
  },
  {
    id: 'faq-2',
    category: 'delivery',
    question: 'راش‌ها (فایل‌های خام) و ویدیوها را چطور تحویل دهم؟',
    shortAnswer: 'به ساده‌ترین و بدون افت کیفیت‌ترین روش‌های ممکن می‌توانید فایل‌ها را ارسال کنید.',
    details: [
      'گوگل درایو (Google Drive): مناسب‌ترین روش؛ لینک فولدر راش‌ها را برای ما بفرستید تا سریعاً دانلود شود.',
      'تلگرام (Telegram Document): ارسال راش‌ها و فایل‌های صوتی به صورت File/Document بدون کوچک‌ترین فشرده‌سازی و افت رزولوشن.',
      'سایر سرویس‌های ابری: دراپ‌باکس (Dropbox)، مگا (MEGA) یا وی‌تنسفر (WeTransfer) نیز به صورت کامل پشتیبانی می‌شوند.',
      'آپلود مستقیم در سایت: هنگام ثبت سفارش می‌توانید فایل نمونه و لینک راش‌های خود را مستقیماً ضمیمه کنید.',
    ],
    icon: FolderSync,
    highlight: 'بدون افت کیفیت تا رزولوشن 4K',
  },
  {
    id: 'faq-3',
    category: 'revisions',
    question: 'مهلت بازبینی، تعداد اصلاحات و ادیت مجدد چگونه است؟',
    shortAnswer: 'ما پروژه را تا رسیدن به نتیجه مدنظر و ایده‌آل شما بازبینی می‌کنیم.',
    details: [
      'تا ۲ مرحله بازبینی کامل و دقیق روی تمامی جزئیات (کات، موزیک، متن، فونت، افکت صوتی و کالرگریدینگ) به صورت ۱۰۰٪ رایگان انجام می‌شود.',
      'شما تا ۳ روز کاری پس از دریافت نسخه اولیه، مهلت دارید فیدبک‌ها و تایم‌کدهای اصلاحی خود را ارسال کنید.',
      'اصلاحات معمولاً با اولویت بالا و در کمتر از ۱۲ تا ۲۴ ساعت کاری اعمال و نسخه جدید تقدیم می‌شود.',
      'در صورتی که اصلاحات جزئی بیشتری نیاز باشد، تیم ریتم تا رضایت نهایی با همراهی و انعطاف کامل در کنار شماست.',
    ],
    icon: RefreshCw,
    highlight: '۲ مرحله بازبینی رایگان و سریع',
  },
  {
    id: 'faq-4',
    category: 'guarantee',
    question: 'ضمانت کیفیت، محرمانگی راش‌ها و تعهد ریتم چیست؟',
    shortAnswer: 'امنیت راش‌ها و حقوق مالکیت معنوی شما اولویت تخطی‌ناپذیر ماست.',
    details: [
      'حفظ محرمانگی: راش‌ها، اسرار تجاری و محتوای شخصی شما کاملاً محرمانه مانده و هرگز بدون اجازه کتبی شما منتشر نمی‌شود.',
      'قرارداد دیجیتال: امکان دریافت پیش‌فاکتور و قرارداد دیجیتال معتبر با مهر و امضای فنی ریتم در پنل کاربری وجود دارد.',
      'گارانتی تطابق با سناریو: اگر خروجی تدوین با توافق اولیه و رفرنس هماهنگ‌شده تطابق نداشته باشد، کل پروژه بدون هزینه بازتولید یا وجه پیش‌پرداخت مرجوع خواهد شد.',
      'آرشیو ابری امن: فایل‌های ادیت‌شده تا ۳۰ روز پس از تحویل در سرور ریتم بکاپ دارند تا در صورت مفقودی مجدداً دانلود کنید.',
    ],
    icon: ShieldCheck,
    highlight: 'تعهد عدم افشای راش‌ها + ضمانت بازگشت وجه',
  },
  {
    id: 'faq-5',
    category: 'timing',
    question: 'زمان معمول تدوین و تحویل هر ویدیو چقدر است؟',
    shortAnswer: 'زمان‌بندی دقیق در ابتدای پروژه مشخص و بدون یک ساعت تاخیر تحویل می‌شود.',
    details: [
      'ویدیوهای ریلز اینستاگرام و شورتز یوتیوب: ۲۴ الی ۴۸ ساعت کاری.',
      'ویدیوهای کامل یوتیوب و پادکست‌های تصویری: ۳ الی ۴ روز کاری.',
      'تیزرهای سینمایی و تبلیغاتی حرفه‌ای با موشن و اصلاح رنگ اختصاصی: ۳ الی ۵ روز کاری.',
      'سفارش فوری و اکسپرس: برای موقعیت‌های فوری، امکان فعال‌سازی «تحویل فوری زیر ۱۲ یا ۲۴ ساعت» وجود دارد.',
    ],
    icon: Clock,
    highlight: 'تحویل در ۲۴ الی ۴۸ ساعت + اکسپرس',
  },
  {
    id: 'faq-6',
    category: 'payment',
    question: 'آیا امکان تعیین بودجه دلخواه توسط خود من وجود دارد؟',
    shortAnswer: 'بله، فلسفه ریتم این است که هیچ تولیدکننده‌ای به دلیل کمبود بودجه متوقف نشود.',
    details: [
      'شما هنگام ثبت سفارش می‌توانید بودجه پیشنهادی خود را صراحتاً قید کنید.',
      'ما بهترین ترکیب و فرمول ادیت را متناسب با سقف بودجه شما مهندسی می‌کنیم تا حداکثر خروجی حاصل شود.',
      'برای کانال‌های پرکار و همکاری‌های پکیجی (مثلاً ۱۰ الی ۳۰ ویدیو در ماه)، تخفیف ویژه همکاری بلندمدت لحاظ می‌گردد.',
    ],
    icon: Zap,
    highlight: 'بودجه کاملاً توافقی و منعطف',
  },
];

interface FaqSectionProps {
  lang: 'fa' | 'en';
}

export const FaqSection: React.FC<FaqSectionProps> = ({ lang }) => {
  const [openId, setOpenId] = useState<string | null>('faq-1');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const toggleAccordion = (id: string) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  const filteredFaqs = FAQ_DATA.filter((item) => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesSearch =
      searchQuery.trim() === '' ||
      item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.shortAnswer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.details.some((d) => d.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <section className="max-w-4xl mx-auto px-4 py-8 relative">
      {/* Background Glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-80 h-80 bg-[#38bdf8]/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="text-center max-w-xl mx-auto mb-8 space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/[0.04] border border-white/10 text-xs font-semibold text-[#38bdf8] shadow-sm">
          <HelpCircle className="w-3.5 h-3.5" />
          <span>{lang === 'fa' ? 'شفافیت کامل در همکاری' : 'Frequently Asked Questions'}</span>
        </div>

        <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
          {lang === 'fa' ? (
            <>
              سوالات متداول درباره <span className="text-[#38bdf8]">روند کار در ریتم</span>
            </>
          ) : (
            <>
              Common Questions <span className="text-[#38bdf8]">About RITM</span>
            </>
          )}
        </h2>

        <p className="text-xs sm:text-sm text-[#8c94a4] leading-relaxed">
          {lang === 'fa'
            ? 'همه چیز درباره نحوه تسویه‌حساب، تحویل راش‌ها، مهلت بازبینی و ضمانت امنیت پروژه‌های شما.'
            : 'Details on payment terms, footage handoff, revision cycles, and quality guarantees.'}
        </p>

        {/* Live Instant Search Bar */}
        <div className="relative pt-2 max-w-md mx-auto">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={
              lang === 'fa'
                ? 'جستجوی سریع سوال (مثال: تسویه، راش، بازبینی، زمان)...'
                : 'Search FAQ (payment, footage, revision)...'
            }
            className="w-full pl-4 pr-10 py-2.5 rounded-2xl bg-white/[0.04] hover:bg-white/[0.07] border border-white/10 focus:border-[#38bdf8] text-white text-xs placeholder-[#8c94a4] focus:outline-none transition-all shadow-inner"
          />
          <Search className="w-4 h-4 text-[#8c94a4] absolute right-3.5 top-[18px] pointer-events-none" />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute left-3 top-[18px] text-[11px] text-[#8c94a4] hover:text-white"
            >
              پاک کردن
            </button>
          )}
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center justify-center gap-1.5 overflow-x-auto pb-4 mb-6 no-scrollbar">
        {[
          { id: 'all', label: lang === 'fa' ? 'همه سوالات' : 'All FAQs' },
          { id: 'payment', label: lang === 'fa' ? 'تسویه‌حساب و مالی' : 'Payments' },
          { id: 'delivery', label: lang === 'fa' ? 'تحویل راش‌ها' : 'Footage' },
          { id: 'revisions', label: lang === 'fa' ? 'مهلت بازبینی' : 'Revisions' },
          { id: 'guarantee', label: lang === 'fa' ? 'ضمانت و امنیت' : 'Security' },
          { id: 'timing', label: lang === 'fa' ? 'زمان‌بندی' : 'Timing' },
        ].map((tab) => {
          const isActive = selectedCategory === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setSelectedCategory(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'bg-[#38bdf8] text-[#07080c] font-black shadow-md shadow-[#38bdf8]/20'
                  : 'bg-white/[0.03] text-[#8c94a4] hover:text-white hover:bg-white/[0.07] border border-white/5'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Accordion Items List */}
      <div className="space-y-3">
        {filteredFaqs.length === 0 ? (
          <div className="text-center py-10 bg-white/[0.02] border border-white/10 rounded-2xl space-y-2">
            <p className="text-sm text-[#8c94a4]">سوالی با این عبارت یافت نشد.</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
              }}
              className="text-xs text-[#38bdf8] hover:underline"
            >
              نمایش همه سوالات
            </button>
          </div>
        ) : (
          filteredFaqs.map((faq) => {
            const isOpen = openId === faq.id;
            const Icon = faq.icon;

            return (
              <div
                key={faq.id}
                className={`rounded-2xl transition-all duration-300 border overflow-hidden ${
                  isOpen
                    ? 'bg-[#11131c]/95 border-[#38bdf8]/40 shadow-xl shadow-[#38bdf8]/10'
                    : 'bg-[#0d0f17]/60 border-white/10 hover:border-white/20 hover:bg-[#11131c]/50'
                }`}
              >
                {/* Header Accordion Bar */}
                <button
                  type="button"
                  onClick={() => toggleAccordion(faq.id)}
                  className="w-full p-4 sm:p-5 flex items-center justify-between gap-4 text-right cursor-pointer select-none"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                        isOpen
                          ? 'bg-[#38bdf8] text-[#07080c] shadow-md shadow-[#38bdf8]/30'
                          : 'bg-white/5 text-[#8c94a4]'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>

                    <div className="min-w-0">
                      <h3
                        className={`text-xs sm:text-sm font-bold transition-colors ${
                          isOpen ? 'text-white' : 'text-[#cfd3dc]'
                        }`}
                      >
                        {faq.question}
                      </h3>
                      {faq.highlight && (
                        <span className="text-[10px] text-[#38bdf8] font-semibold hidden sm:inline-block mt-0.5">
                          ✦ {faq.highlight}
                        </span>
                      )}
                    </div>
                  </div>

                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-transform duration-300 ${
                      isOpen ? 'rotate-180 bg-[#38bdf8]/20 text-[#38bdf8]' : 'bg-white/5 text-[#8c94a4]'
                    }`}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </button>

                {/* Animated Body Content */}
                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-right space-y-3.5 border-t border-white/5 animate-fade-in">
                    <p className="text-xs text-[#a3e635] font-semibold flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{faq.shortAnswer}</span>
                    </p>

                    <div className="space-y-2.5 bg-black/30 p-4 rounded-xl border border-white/5">
                      {faq.details.map((point, idx) => (
                        <div key={idx} className="flex items-start gap-2.5 text-xs text-[#cfd3dc] leading-relaxed">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#38bdf8] shrink-0 mt-0.5" />
                          <span>{point}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Extra Question CTA */}
      <div className="mt-8 p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-[#d0bcff]/10 via-[#38bdf8]/10 to-transparent border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-right">
        <div className="space-y-1">
          <h4 className="text-sm font-bold text-white flex items-center gap-2">
            <span>سوالی دارید که در لیست بالا نیست؟</span>
          </h4>
          <p className="text-xs text-[#8c94a4]">
            مدیریت ریتم در تلگرام مستقیماً پاسخگوی سوالات فنی، مالی و نحوه آغاز پروژه شماست.
          </p>
        </div>

        <a
          href="https://t.me/AdvRFL"
          target="_blank"
          rel="noopener noreferrer"
          className="px-5 py-2.5 rounded-xl bg-[#38bdf8] hover:bg-[#38bdf8]/90 text-[#07080c] font-black text-xs transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#38bdf8]/20 cursor-pointer shrink-0 active:scale-95"
        >
          <MessageCircle className="w-4 h-4" />
          <span>گفتگو مستقیم در تلگرام (@AdvRFL)</span>
        </a>
      </div>
    </section>
  );
};
