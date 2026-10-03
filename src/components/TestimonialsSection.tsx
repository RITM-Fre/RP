import React, { useState, useEffect } from 'react';
import {
  Star,
  Quote,
  CheckCircle2,
  Sparkles,
  TrendingUp,
  Plus,
  Trash2,
  X,
  MessageSquareHeart,
  Award,
  Video,
  Youtube,
  Instagram,
  Globe,
  Layers
} from 'lucide-react';

export interface TestimonialItem {
  id: string;
  name: string;
  role: string;
  category: 'reels' | 'youtube' | 'teaser' | 'web';
  avatar?: string;
  avatarBg?: string;
  rating: number;
  projectTitle: string;
  metric?: string;
  comment: string;
  date: string;
  verified: boolean;
}

const DEFAULT_TESTIMONIALS: TestimonialItem[] = [
  {
    id: 'test-1',
    name: 'مهندس حسام امینی',
    role: 'مدیر آکادمی رمزینو و چنل یوتیوب (۱۴۰k سابسکرایب)',
    category: 'youtube',
    avatarBg: 'from-[#38bdf8] to-[#0284c7]',
    rating: 5,
    projectTitle: 'تدوین سری ویدیوهای ۴K یوتیوب و پادکست',
    metric: '+۲۸۰٪ افزایش میانگین زمان تماشا (Retention)',
    comment:
      'همکاری با ریتم سطح محتوای یوتیوب ما رو دگرگون کرد. کات‌های دقیق، ساوند دیزاین هوشمندانه و بدون نیاز به اصلاحات مکرر. تحویل هم دقیقا در مهلت توافق‌شده انجام شد.',
    date: '۳ روز پیش',
    verified: true,
  },
  {
    id: 'test-2',
    name: 'سارا تهرانی',
    role: 'برندینگ و پیج اینستاگرام مد و استایل (۴۲۰k فالوور)',
    category: 'reels',
    avatarBg: 'from-[#ec4899] to-[#be185d]',
    rating: 5,
    projectTitle: 'پک ۳۰ تایی ریلز ریتمیک و اینگیجینگ',
    metric: '+۱.۴M ویو ارگانیک در اکسپلور',
    comment:
      'ریتم و موزیک سینک ویدیوها دیوانه‌کننده بود! هوک ۳ ثانیه اول ویدیوها طوری طراحی شده بود که بازدید اکسپلور ما سه‌برابر شد. واقعا تیم خوش‌قول و باحوصله‌ای هستند.',
    date: 'هفته گذشته',
    verified: true,
  },
  {
    id: 'test-3',
    name: 'آرش علوی',
    role: 'مدیر مارکتینگ هلدینگ ویستا تجارت',
    category: 'teaser',
    avatarBg: 'from-[#d0bcff] to-[#7c3aed]',
    rating: 5,
    projectTitle: 'تیزر سینمایی پروداکت و کمپین بلک‌فرایدی',
    metric: 'نرخ تبدیل فروش +۴۲٪ در کمپین',
    comment:
      'اصلاح رنگ (Color Grading) با داوینچی و موشن‌های اختصاصی که برامون زدن دقیقا کیفیت تیزرهای خارجی رو داشت. از همه مهم‌تر نحوه تسویه‌حساب عادلانه بعد از تایید نهایی بود.',
    date: '۲ هفته پیش',
    verified: true,
  },
  {
    id: 'test-4',
    name: 'دکتر میلاد فراهانی',
    role: 'موسس کلینیک زیبایی و آکادمی پوست',
    category: 'reels',
    avatarBg: 'from-[#10b981] to-[#047857]',
    rating: 5,
    projectTitle: 'ادیت ویدیوهای آموزشی و ریلزهای پزشکی',
    metric: 'تحویل منظم در کمتر از ۲۴ ساعت',
    comment:
      'برای من که وقت ادیت نداشتم، ریتم یک نجات‌دهنده واقعی بود. راش‌ها رو توی گوگل‌درایو می‌ذاشتم و فردا عصر ویدیوی نهایی آماده انتشار بود. احترام و اخلاق کاری‌شون کم‌نظیره.',
    date: '۳ هفته پیش',
    verified: true,
  },
  {
    id: 'test-5',
    name: 'نوید رادپور',
    role: 'هم‌بنیان‌گذار استارتاپ لایف‌تک',
    category: 'web',
    avatarBg: 'from-[#f59e0b] to-[#d97706]',
    rating: 5,
    projectTitle: 'طراحی لندینگ پیج و مینی‌اپ معرفی محصول',
    metric: 'سرعت لود زیر ۱ ثانیه + UX روان',
    comment:
      'ترکیب تدوین ویدیو با توسعه وب و تلگرام باعث شد صفر تا صد معرفی محصولمون یکدست و فوق‌العاده مدرن دربیاد. تمام بازبینی‌ها بدون هزینه اضافه و سریع اعمال شد.',
    date: 'یک ماه پیش',
    verified: true,
  },
  {
    id: 'test-6',
    name: 'پرهام شایان',
    role: 'یوتیوبر حوزه مستند و سینما',
    category: 'youtube',
    avatarBg: 'from-[#6366f1] to-[#4338ca]',
    rating: 5,
    projectTitle: 'تدوین مستند تحلیلی ۴۵ دقیقه‌ای با استایل ووکس (Vox)',
    metric: 'بیش از ۷۵ هزار بازدید ارگانیک',
    comment:
      'پیدا کردن تدوینگری که فرمت داکیومنتری و موشن‌گرافیک مپینگ رو بفهمه خیلی سخته. ریتم دقیقا همون سناریوی ذهنی من رو با ضرب‌آهنگ عالی و استاندارد پیاده کرد.',
    date: 'یک ماه پیش',
    verified: true,
  },
];

const LOCAL_STORAGE_KEY = 'ritm_testimonials_custom';

interface TestimonialsSectionProps {
  lang: 'fa' | 'en';
  isAdminLoggedIn?: boolean;
}

export const TestimonialsSection: React.FC<TestimonialsSectionProps> = ({
  lang,
  isAdminLoggedIn = false,
}) => {
  const [testimonials, setTestimonials] = useState<TestimonialItem[]>(() => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return DEFAULT_TESTIMONIALS;
  });

  const [activeCategory, setActiveCategory] = useState<'all' | 'reels' | 'youtube' | 'teaser' | 'web'>('all');
  const [showAddModal, setShowAddModal] = useState(false);

  // Form State
  const [newName, setNewName] = useState('');
  const [newRole, setNewRole] = useState('');
  const [newCategory, setNewCategory] = useState<'reels' | 'youtube' | 'teaser' | 'web'>('reels');
  const [newRating, setNewRating] = useState<number>(5);
  const [newProjectTitle, setNewProjectTitle] = useState('');
  const [newMetric, setNewMetric] = useState('');
  const [newComment, setNewComment] = useState('');

  const saveTestimonials = (items: TestimonialItem[]) => {
    setTestimonials(items);
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(items));
    } catch (e) {}
  };

  const handleAddTestimonial = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newComment.trim()) return;

    const colors = [
      'from-[#d0bcff] to-[#7c3aed]',
      'from-[#38bdf8] to-[#0284c7]',
      'from-[#ec4899] to-[#be185d]',
      'from-[#a3e635] to-[#15803d]',
      'from-[#f59e0b] to-[#b45309]',
    ];
    const randomBg = colors[Math.floor(Math.random() * colors.length)];

    const newItem: TestimonialItem = {
      id: 'test-' + Date.now(),
      name: newName.trim(),
      role: newRole.trim() || (lang === 'fa' ? 'کارفرمای محترم ریتم' : 'Verified Client'),
      category: newCategory,
      avatarBg: randomBg,
      rating: newRating,
      projectTitle: newProjectTitle.trim() || (lang === 'fa' ? 'تدوین ویدیو اختصاصی' : 'Video Project'),
      metric: newMetric.trim() || (lang === 'fa' ? 'رضایت ۱۰۰٪ از تحویل پروژه' : '100% Satisfaction'),
      comment: newComment.trim(),
      date: lang === 'fa' ? 'همین الان' : 'Just now',
      verified: true,
    };

    saveTestimonials([newItem, ...testimonials]);
    setNewName('');
    setNewRole('');
    setNewProjectTitle('');
    setNewMetric('');
    setNewComment('');
    setShowAddModal(false);
  };

  const handleDeleteTestimonial = (id: string) => {
    if (window.confirm(lang === 'fa' ? 'آیا از حذف این نظر اطمینان دارید؟' : 'Delete this testimonial?')) {
      const updated = testimonials.filter((t) => t.id !== id);
      saveTestimonials(updated);
    }
  };

  const handleResetToDefault = () => {
    if (window.confirm(lang === 'fa' ? 'بازنشانی همه نظرات به حالت پیش‌فرض اولیه؟' : 'Reset to default testimonials?')) {
      saveTestimonials(DEFAULT_TESTIMONIALS);
    }
  };

  const filteredTestimonials = activeCategory === 'all'
    ? testimonials
    : testimonials.filter((t) => t.category === activeCategory);

  const getCategoryBadge = (cat: TestimonialItem['category']) => {
    switch (cat) {
      case 'reels':
        return { label: 'ریلز و اینستاگرام', icon: Instagram, color: 'text-[#ec4899] bg-[#ec4899]/10 border-[#ec4899]/20' };
      case 'youtube':
        return { label: 'یوتیوب و مستند', icon: Youtube, color: 'text-[#ef4444] bg-[#ef4444]/10 border-[#ef4444]/20' };
      case 'teaser':
        return { label: 'تیزر تبلیغاتی', icon: Video, color: 'text-[#d0bcff] bg-[#d0bcff]/10 border-[#d0bcff]/20' };
      case 'web':
        return { label: 'وب و پلتفرم', icon: Globe, color: 'text-[#38bdf8] bg-[#38bdf8]/10 border-[#38bdf8]/20' };
    }
  };

  return (
    <section className="max-w-6xl mx-auto px-4 py-8 relative">
      {/* Glow Effects */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-96 h-96 bg-[#d0bcff]/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-[#38bdf8]/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header Container */}
      <div className="relative text-center max-w-2xl mx-auto mb-10 space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/[0.04] border border-white/10 text-xs font-semibold text-[#d0bcff] shadow-sm">
          <MessageSquareHeart className="w-3.5 h-3.5 text-[#ec4899]" />
          <span>{lang === 'fa' ? 'اعتماد کارفرمایان و خالقان محتوا' : 'Client Testimonials'}</span>
        </div>

        <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
          {lang === 'fa' ? (
            <>
              تجربه کارفرمایان از <span className="text-[#d0bcff]">ریتم تدوین</span> و همکاری
            </>
          ) : (
            <>
              What Creators & Brands <span className="text-[#d0bcff]">Say About RITM</span>
            </>
          )}
        </h2>

        <p className="text-xs sm:text-sm text-[#8c94a4] leading-relaxed">
          {lang === 'fa'
            ? 'نظرات واقعی یوتیوبرها، مدیران پیج‌های پرمخاطب اینستاگرام و برندهایی که تدوین پروژه‌هایشان را به ریتم سپرده‌اند.'
            : 'Genuine feedback from YouTubers, high-growth Instagram channels, and corporate clients.'}
        </p>

        {/* Aggregate Credibility Stats Bar */}
        <div className="pt-4 flex flex-wrap items-center justify-center gap-4 sm:gap-8 text-xs">
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.03] border border-white/10">
            <div className="flex text-[#ffb869]">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-current" />
              ))}
            </div>
            <span className="font-extrabold text-white text-sm">۴.۹ / ۵</span>
            <span className="text-[#8c94a4] text-[11px]">(+۹۵ نظر ثبت‌شده)</span>
          </div>

          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.03] border border-white/10">
            <Award className="w-4 h-4 text-[#a3e635]" />
            <span className="font-bold text-white">۹۹.۴٪ رضایت کامل</span>
            <span className="text-[#8c94a4] text-[11px]">(بدون مرجوعی)</span>
          </div>

          {/* Button to submit a testimonial */}
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 rounded-xl bg-[#d0bcff]/15 hover:bg-[#d0bcff]/25 border border-[#d0bcff]/30 text-[#d0bcff] font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer hover:scale-105 active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{lang === 'fa' ? 'ثبت تجربه و نظر شما' : 'Add Your Review'}</span>
          </button>

          {/* Admin Reset Button */}
          {isAdminLoggedIn && (
            <button
              onClick={handleResetToDefault}
              className="px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-300 text-[11px] font-semibold transition-colors cursor-pointer"
            >
              بازنشانی به پیش‌فرض
            </button>
          )}
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center justify-center gap-2 overflow-x-auto pb-4 mb-6 no-scrollbar">
        {[
          { id: 'all', label: lang === 'fa' ? 'همه نظرات' : 'All Reviews', icon: Layers },
          { id: 'reels', label: lang === 'fa' ? 'ریلز و اینستاگرام' : 'Instagram Reels', icon: Instagram },
          { id: 'youtube', label: lang === 'fa' ? 'یوتیوب و مستند' : 'YouTube & Docs', icon: Youtube },
          { id: 'teaser', label: lang === 'fa' ? 'تیزر و تبلیغات' : 'Commercial Teasers', icon: Video },
          { id: 'web', label: lang === 'fa' ? 'وب و پلتفرم' : 'Web & Apps', icon: Globe },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeCategory === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveCategory(tab.id as any)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'bg-[#d0bcff] text-[#0d0f17] shadow-md shadow-[#d0bcff]/20'
                  : 'bg-white/[0.04] text-[#8c94a4] hover:text-white hover:bg-white/[0.08] border border-white/5'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Testimonials Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredTestimonials.map((t) => {
          const badge = getCategoryBadge(t.category);
          const BadgeIcon = badge.icon;
          const initials = t.name
            .split(' ')
            .map((w) => w[0])
            .slice(0, 2)
            .join('');

          return (
            <div
              key={t.id}
              className="relative group rounded-2xl p-6 bg-gradient-to-b from-[#11131c]/90 to-[#0b0d14]/90 border border-white/10 hover:border-[#d0bcff]/40 shadow-xl shadow-black/40 transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between"
            >
              {/* Top ambient highlight on hover */}
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-[#d0bcff]/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-t-2xl" />

              <div className="space-y-4">
                {/* Card Header: Avatar + Name + Rating */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-11 h-11 rounded-xl bg-gradient-to-br ${
                        t.avatarBg || 'from-[#d0bcff] to-[#7c3aed]'
                      } flex items-center justify-center text-white font-black text-sm shadow-md shrink-0`}
                    >
                      {initials}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <h4 className="text-sm font-extrabold text-white truncate">{t.name}</h4>
                        {t.verified && (
                          <span title="کارفرمای تایید شده" className="shrink-0">
                            <CheckCircle2 className="w-3.5 h-3.5 text-[#38bdf8]" />
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-[#8c94a4] truncate">{t.role}</p>
                    </div>
                  </div>

                  {/* Admin Delete Action */}
                  {isAdminLoggedIn && (
                    <button
                      onClick={() => handleDeleteTestimonial(t.id)}
                      className="p-1 rounded-lg bg-red-500/10 hover:bg-red-500/25 text-red-400 transition-colors"
                      title="حذف نظر (مدیریت)"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Rating Stars + Category Tag */}
                <div className="flex items-center justify-between text-xs pt-1 border-t border-white/5">
                  <div className="flex items-center text-[#ffb869] gap-0.5">
                    {[...Array(t.rating)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-current" />
                    ))}
                  </div>

                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${badge.color}`}
                  >
                    <BadgeIcon className="w-3 h-3" />
                    <span>{badge.label}</span>
                  </span>
                </div>

                {/* Review Text */}
                <div className="relative pt-1">
                  <Quote className="absolute -top-1 -right-1 w-5 h-5 text-white/5 pointer-events-none" />
                  <p className="text-xs text-[#cfd3dc] leading-relaxed text-right relative z-10">
                    «{t.comment}»
                  </p>
                </div>
              </div>

              {/* Card Footer: Project Badge & Metric */}
              <div className="pt-4 mt-4 border-t border-white/5 space-y-2">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-[#8c94a4] font-medium truncate max-w-[190px]">
                    {t.projectTitle}
                  </span>
                  <span className="text-[10px] text-[#8c94a4]/80">{t.date}</span>
                </div>

                {t.metric && (
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#a3e635]/10 border border-[#a3e635]/20 text-[10px] font-bold text-[#a3e635]">
                    <TrendingUp className="w-3 h-3 shrink-0" />
                    <span className="truncate">{t.metric}</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* ADD TESTIMONIAL MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-[220] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto animate-fade-in">
          <div
            dir={lang === 'fa' ? 'rtl' : 'ltr'}
            className="relative w-full max-w-lg bg-[#0e1017] border border-white/15 rounded-3xl p-6 sm:p-8 shadow-2xl text-right space-y-5 my-auto"
          >
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute top-4 left-4 p-2 rounded-full bg-white/5 hover:bg-white/10 text-[#8c94a4] hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="space-y-1">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#d0bcff]" />
                <span>{lang === 'fa' ? 'ثبت تجربه و نظر شما درباره ریتم' : 'Submit Your Review'}</span>
              </h3>
              <p className="text-xs text-[#8c94a4]">
                {lang === 'fa'
                  ? 'دیدگاه شما بلافاصله در سایت ثبت شده و به اعتماد سایر دوستان کمک می‌کند.'
                  : 'Your testimonial will be published to help future clients.'}
              </p>
            </div>

            <form onSubmit={handleAddTestimonial} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#8c94a4]">نام و نام‌خانوادگی *</label>
                  <input
                    type="text"
                    required
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="مثال: پوریا کریمی"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:border-[#d0bcff] focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#8c94a4]">حوزه فعالیت / پیج / کانال</label>
                  <input
                    type="text"
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value)}
                    placeholder="مثال: یوتیوبر گیمینگ / پیج فروشگاهی"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:border-[#d0bcff] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#8c94a4]">دسته‌بندی پروژه</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#1a1c26] border border-white/10 text-white text-xs focus:border-[#d0bcff] focus:outline-none cursor-pointer"
                  >
                    <option value="reels">ریلز و ویدیوهای اینستاگرام</option>
                    <option value="youtube">یوتیوب و مستند</option>
                    <option value="teaser">تیزر تبلیغاتی و تجاری</option>
                    <option value="web">طراحی وب و مینی‌اپ</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#8c94a4]">امتیاز شما به ریتم</label>
                  <div className="flex items-center gap-1.5 pt-1.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setNewRating(star)}
                        className="cursor-pointer transition-transform hover:scale-125"
                      >
                        <Star
                          className={`w-6 h-6 ${
                            star <= newRating ? 'text-[#ffb869] fill-[#ffb869]' : 'text-white/20'
                          }`}
                        />
                      </button>
                    ))}
                    <span className="text-xs font-bold text-white mr-2">{newRating} از ۵</span>
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#8c94a4]">عنوان پروژه یا نوع همکاری</label>
                <input
                  type="text"
                  value={newProjectTitle}
                  onChange={(e) => setNewProjectTitle(e.target.value)}
                  placeholder="مثال: تدوین ۱۰ ویدیوی ریلز هفتگی"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:border-[#d0bcff] focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#8c94a4]">نتیجه یا دستاورد (اختیاری)</label>
                <input
                  type="text"
                  value={newMetric}
                  onChange={(e) => setNewMetric(e.target.value)}
                  placeholder="مثال: تحویل ۲۴ ساعته یا ۱۰۰k بازدید اکسپلور"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:border-[#d0bcff] focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#8c94a4]">متن نظر و تجربه شما *</label>
                <textarea
                  required
                  rows={3}
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="کیفیت ادیت، نحوه برخورد، سرعت تحویل و تجربه کلی خود را بنویسید..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:border-[#d0bcff] focus:outline-none resize-none leading-relaxed"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-[#8c94a4] text-xs font-semibold transition-colors cursor-pointer"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-[#d0bcff] hover:bg-[#d0bcff]/90 text-[#0d0f17] text-xs font-black transition-all cursor-pointer shadow-lg shadow-[#d0bcff]/20"
                >
                  ثبت دیدگاه
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};
