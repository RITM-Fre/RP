import React, { useState, useEffect } from 'react';
import {
  Film,
  Code,
  Smartphone,
  Sparkles,
  ExternalLink,
  Play,
  X,
  Plus,
  Edit2,
  Trash2,
  Download,
  Github,
  Globe,
  Layers,
  Save,
  CheckCircle2,
} from 'lucide-react';
import { SERVICES, PORTFOLIO_ITEMS, heroImage, videoImage } from '../data/mockData';
import { ProjectType } from '../types';

interface ProducedWebsite {
  id: string;
  titleFa: string;
  titleEn: string;
  descFa: string;
  descEn: string;
  siteUrl: string;
  githubUrl?: string;
  badge?: string;
}

interface BuiltApp {
  id: string;
  titleFa: string;
  titleEn: string;
  descFa: string;
  descEn: string;
  downloadUrl: string;
  version?: string;
  size?: string;
  platform?: string;
}

interface PortfolioShowcaseProps {
  lang: 'fa' | 'en';
  isAdminLoggedIn?: boolean;
  onSelectCategoryForOrder: (category: ProjectType) => void;
}

const DEFAULT_WEBSITES: ProducedWebsite[] = [
  {
    id: 'web-1',
    titleFa: 'سامانه فروشگاهی و پلتفرم مدرن نکسوس',
    titleEn: 'Nexus E-Commerce & Brand Platform',
    descFa: 'طراحی فول‌استک فروشگاه اینترنتی با معماری میکروسرویس، درگاه پرداخت اختصاصی، انیمیشن‌های تعاملی و سرعت لود زیر ۱ ثانیه.',
    descEn: 'Full-stack high performance e-commerce platform with smooth checkout, responsive UI, and optimized SEO.',
    siteUrl: 'https://nexus-demo.ritm.studio',
    githubUrl: 'https://github.com/RITM-Freelancer/nexus-ecommerce',
    badge: 'Full Stack Web',
  },
  {
    id: 'web-2',
    titleFa: 'پرتال ابری و داشبورد تحلیلی سینک',
    titleEn: 'Sync Cloud Analytics Dashboard',
    descFa: 'وب‌اپلیکیشن تحلیلی شرکتی با نمودارهای تعاملی بی‌درنگ، پنل نظارت دسترسی‌ها و رابط کاربری دارک مدرن.',
    descEn: 'Real-time corporate analytics dashboard with interactive charts, RBAC controls, and responsive UI.',
    siteUrl: 'https://sync-dashboard.ritm.studio',
    githubUrl: 'https://github.com/RITM-Freelancer/sync-dashboard',
    badge: 'SaaS Platform',
  },
  {
    id: 'web-3',
    titleFa: 'وب‌سایت اختصاصی برندینگ آرتک',
    titleEn: 'Artek Brand Identity Showcase',
    descFa: 'لندینگ پیج مینیمال با تایپوگرافی ویژه فارسی و افکت‌های حرکتی سبک، بهینه‌سازی شده برای بالاترین نرخ تبدیل کارفرما.',
    descEn: 'Minimalist creative agency landing page with Persian typography, micro-interactions, and high conversion rate.',
    siteUrl: 'https://artek.ritm.studio',
    githubUrl: 'https://github.com/RITM-Freelancer/artek-landing',
    badge: 'Creative Landing',
  },
];

const DEFAULT_APPS: BuiltApp[] = [
  {
    id: 'app-1',
    titleFa: 'اپلیکیشن ریتم پلیر پرو (RITM Player Pro)',
    titleEn: 'RITM Player Pro Assistant',
    descFa: 'دستیار هوشمند و پلیر تدوین‌گران ویدیو، پیش‌نمایش بدون افت فریم راش‌های 4K، استخراج متادیتا و همگام‌سازی ابری.',
    descEn: 'Video editor companion player, real-time 4K footage previews, metadata inspector, and cloud sync.',
    downloadUrl: 'https://dl.ritm.studio/apps/ritm-player-pro-v2.apk',
    version: 'v2.4.0',
    size: '28 MB',
    platform: 'Android & PWA',
  },
  {
    id: 'app-2',
    titleFa: 'اپلیکیشن مدیریت تسک و سفارشات تسک‌استریم',
    titleEn: 'TaskStream Mobile Workflow',
    descFa: 'اپلیکیشن سبک و آفلاین برای پیگیری صف تولید محتوا، تحویل مراحل راف‌کات و فاینال‌کات به همراه نوتیفیکیشن اختصاصی.',
    descEn: 'Lightweight offline-capable production tracking app for video milestone deliveries and real-time alerts.',
    downloadUrl: 'https://dl.ritm.studio/apps/taskstream-app.apk',
    version: 'v1.8.2',
    size: '19 MB',
    platform: 'Android & iOS PWA',
  },
  {
    id: 'app-3',
    titleFa: 'اپلیکیشن همراه کارفرما ریتم (Client Hub)',
    titleEn: 'RITM Client Companion App',
    descFa: 'دسترسی فوری کارفرمایان به قرارداد، فاکتورها، پیش‌نمایش خروجی‌های ویدیویی و دریافت فایل‌های پروژه با یک تپ.',
    descEn: 'Instant client portal access for contracts, video watermarked previews, and one-tap asset downloads.',
    downloadUrl: 'https://dl.ritm.studio/apps/ritm-client-hub.apk',
    version: 'v3.0.1',
    size: '22 MB',
    platform: 'Android & WebApp',
  },
];

export const PortfolioShowcase: React.FC<PortfolioShowcaseProps> = ({
  lang,
  isAdminLoggedIn = false,
  onSelectCategoryForOrder,
}) => {
  const [filter, setFilter] = useState<'all' | ProjectType>('all');
  const [selectedMediaProject, setSelectedMediaProject] = useState<any | null>(null);

  // 1. Portfolio items state (Persistent & Editable by Admin)
  const [portfolioItems, setPortfolioItems] = useState<any[]>(() => {
    try {
      const stored = localStorage.getItem('ritm_custom_portfolio_items');
      return stored ? JSON.parse(stored) : PORTFOLIO_ITEMS;
    } catch (e) {
      return PORTFOLIO_ITEMS;
    }
  });

  // 2. Websites list state (Persistent & Editable by Admin)
  const [websites, setWebsites] = useState<ProducedWebsite[]>(() => {
    try {
      const stored = localStorage.getItem('ritm_custom_websites');
      return stored ? JSON.parse(stored) : DEFAULT_WEBSITES;
    } catch (e) {
      return DEFAULT_WEBSITES;
    }
  });

  // 3. Apps list state (Persistent & Editable by Admin)
  const [apps, setApps] = useState<BuiltApp[]>(() => {
    try {
      const stored = localStorage.getItem('ritm_custom_apps');
      return stored ? JSON.parse(stored) : DEFAULT_APPS;
    } catch (e) {
      return DEFAULT_APPS;
    }
  });

  // Modal editing states
  const [editingItem, setEditingItem] = useState<any | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);

  const [editingWebsite, setEditingWebsite] = useState<ProducedWebsite | null>(null);
  const [isAddingWebsite, setIsAddingWebsite] = useState(false);

  const [editingApp, setEditingApp] = useState<BuiltApp | null>(null);
  const [isAddingApp, setIsAddingApp] = useState(false);

  const savePortfolioItems = (items: any[]) => {
    setPortfolioItems(items);
    try {
      localStorage.setItem('ritm_custom_portfolio_items', JSON.stringify(items));
    } catch (e) {}
  };

  const saveWebsites = (items: ProducedWebsite[]) => {
    setWebsites(items);
    try {
      localStorage.setItem('ritm_custom_websites', JSON.stringify(items));
    } catch (e) {}
  };

  const saveApps = (items: BuiltApp[]) => {
    setApps(items);
    try {
      localStorage.setItem('ritm_custom_apps', JSON.stringify(items));
    } catch (e) {}
  };

  // Handlers for Portfolio Cards
  const handleDeletePortfolioItem = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = portfolioItems.filter((item) => item.id !== id);
    savePortfolioItems(updated);
  };

  const handleSavePortfolioItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    if (isAddingNew) {
      const newItem = {
        ...editingItem,
        id: `custom-pr-${Date.now()}`,
        cardNumber: portfolioItems.length + 1,
        tags: typeof editingItem.tags === 'string' ? editingItem.tags.split(',').map((t: string) => t.trim()) : editingItem.tags || [],
        image: editingItem.image || videoImage,
      };
      savePortfolioItems([newItem, ...portfolioItems]);
    } else {
      const updated = portfolioItems.map((item) => {
        if (item.id === editingItem.id) {
          return {
            ...editingItem,
            tags: typeof editingItem.tags === 'string' ? editingItem.tags.split(',').map((t: string) => t.trim()) : editingItem.tags || [],
          };
        }
        return item;
      });
      savePortfolioItems(updated);
    }
    setEditingItem(null);
    setIsAddingNew(false);
  };

  // Handlers for Websites
  const handleDeleteWebsite = (id: string) => {
    const updated = websites.filter((w) => w.id !== id);
    saveWebsites(updated);
  };

  const handleSaveWebsite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingWebsite) return;

    if (isAddingWebsite) {
      const newWeb = {
        ...editingWebsite,
        id: `web-${Date.now()}`,
      };
      saveWebsites([...websites, newWeb]);
    } else {
      const updated = websites.map((w) => (w.id === editingWebsite.id ? editingWebsite : w));
      saveWebsites(updated);
    }
    setEditingWebsite(null);
    setIsAddingWebsite(false);
  };

  // Handlers for Apps
  const handleDeleteApp = (id: string) => {
    const updated = apps.filter((a) => a.id !== id);
    saveApps(updated);
  };

  const handleSaveApp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingApp) return;

    if (isAddingApp) {
      const newApp = {
        ...editingApp,
        id: `app-${Date.now()}`,
      };
      saveApps([...apps, newApp]);
    } else {
      const updated = apps.map((a) => (a.id === editingApp.id ? editingApp : a));
      saveApps(updated);
    }
    setEditingApp(null);
    setIsAddingApp(false);
  };

  const filteredItems = portfolioItems.filter((item) =>
    filter === 'all' ? true : item.category === filter
  );

  return (
    <div className="max-w-7xl mx-auto py-6 sm:py-10 px-4 space-y-16">
      {/* Hero Showcase Banner: Strictly "ریتم" */}
      <div className="relative rounded-3xl overflow-hidden border border-white/10 glass-panel p-6 sm:p-10 md:p-14 shadow-2xl">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{ backgroundImage: `url(${heroImage})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#07080c] via-[#07080c]/90 to-transparent" />

        <div className="relative z-10 max-w-2xl text-right space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/10 border border-white/10 text-xs font-mono text-[#d0bcff]">
            <span className="w-2 h-2 rounded-full bg-[#d0bcff] animate-pulse" />
            <span>{lang === 'fa' ? 'ریتم — ویترین پروژه‌ها' : 'RITM Showcase'}</span>
          </div>

          <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-[#e5e2e1] leading-tight tracking-tight">
            {lang === 'fa' ? (
              <>
                ریتم – <span className="text-[#d0bcff]">تدوین خلاقانه</span> و مهندسی دیجیتال
              </>
            ) : (
              <>
                RITM – <span className="text-[#d0bcff]">Creative Production</span> & Code
              </>
            )}
          </h1>

          <p className="text-xs sm:text-sm md:text-base text-[#958ea0] leading-relaxed">
            {lang === 'fa'
              ? 'تلفیق هنر تدوین سینمایی با مهندسی پیشرفته نرم‌افزار. تمامی پروژه‌ها با استانداردهای بین‌المللی و دقت فریم به فریم پیاده‌سازی می‌شوند.'
              : 'Bridging the gap between cinematic post-production and software engineering.'}
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={() => onSelectCategoryForOrder('video')}
              className="px-6 py-3 rounded-xl bg-[#d0bcff] text-[#131313] font-bold text-xs hover:bg-[#d0bcff]/90 transition-all shadow-lg hover:shadow-[#d0bcff]/20 cursor-pointer"
            >
              {lang === 'fa' ? 'شروع پروژه جدید' : 'Start a Project'}
            </button>
            <a
              href="https://t.me/RITM_FreeLancer"
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-[#e5e2e1] text-xs font-semibold transition-all inline-flex items-center gap-2"
            >
              <span>{lang === 'fa' ? 'کانال تلگرام @RITM_FreeLancer' : 'Telegram Channel'}</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>

      {/* Services Section: (PRICES COMPLETELY REMOVED AS REQUESTED!) */}
      <div>
        <div className="text-center max-w-xl mx-auto mb-10">
          <span className="font-mono text-xs uppercase tracking-wider text-[#d0bcff] font-semibold">
            {lang === 'fa' ? 'خدمات تخصصی ریتم' : 'Specialized Capabilities'}
          </span>
          <h2 className="text-2xl md:text-3xl font-bold text-[#e5e2e1] mt-2 mb-3">
            {lang === 'fa' ? 'راهکارهای جامع ریتم برای کسب‌و‌کار شما' : 'Creative & Engineering Solutions'}
          </h2>
          <p className="text-xs text-[#958ea0]">
            {lang === 'fa'
              ? 'تلفیق ریتم، حرکت، تصویر و کد برای خلق تجربه‌ای متمایز و اثرگذار'
              : 'Combining motion, cinematic audio, and modern code'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {SERVICES.map((srv) => (
            <div
              key={srv.id}
              className="glass-card rounded-2xl p-6 border border-white/10 flex flex-col justify-between group hover:border-[#d0bcff]/40 transition-all text-right"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-[#d0bcff] group-hover:scale-110 transition-transform">
                    {srv.id === 'video' ? (
                      <Film className="w-6 h-6" />
                    ) : srv.id === 'web' ? (
                      <Code className="w-6 h-6" />
                    ) : srv.id === 'mobile' ? (
                      <Smartphone className="w-6 h-6" />
                    ) : (
                      <Sparkles className="w-6 h-6" />
                    )}
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 text-[#958ea0]">
                    {srv.badge}
                  </span>
                </div>

                <h3 className="text-base font-bold text-[#e5e2e1] mb-2 group-hover:text-[#d0bcff] transition-colors">
                  {lang === 'fa' ? srv.titleFa : srv.titleEn}
                </h3>
                <p className="text-xs text-[#958ea0] mb-4 leading-relaxed">
                  {lang === 'fa' ? srv.descFa : srv.descEn}
                </p>

                <ul className="space-y-1.5 mb-6 text-xs text-[#e5e2e1]/80">
                  {(lang === 'fa' ? srv.featuresFa : srv.featuresEn).map((f, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#d0bcff]" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Action Button without any price tag */}
              <div className="pt-4 border-t border-white/[0.08] flex items-center justify-between">
                <span className="text-[11px] text-[#a3e635] font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{lang === 'fa' ? 'کیفیت تضمین‌شده' : 'Verified Standard'}</span>
                </span>
                <button
                  onClick={() => onSelectCategoryForOrder(srv.id)}
                  className="px-4 py-2 rounded-xl bg-[#d0bcff] hover:bg-[#d0bcff]/90 text-[#131313] text-xs font-bold transition-all cursor-pointer"
                >
                  {lang === 'fa' ? 'ثبت سفارش' : 'Order'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECTION 1: FEATURED PORTFOLIO CARDS (WITH ADMIN EDIT/ADD/DELETE CONTROLS) */}
      {/* ========================================================================= */}
      <div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold text-[#e5e2e1]">
                {lang === 'fa' ? 'نمونه‌کارهای برگزیده' : 'Featured Portfolio'}
              </h2>
              {isAdminLoggedIn && (
                <button
                  onClick={() => {
                    setEditingItem({
                      category: 'video',
                      titleFa: '',
                      titleEn: '',
                      descFa: '',
                      descEn: '',
                      tags: 'Premiere Pro, 4K, Color',
                      image: videoImage,
                      type: 'video',
                    });
                    setIsAddingNew(true);
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#a3e635]/15 hover:bg-[#a3e635]/25 border border-[#a3e635]/35 text-[#a3e635] text-xs font-bold transition-all cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{lang === 'fa' ? '+ افزودن نمونه‌کار جدید' : '+ Add Portfolio Card'}</span>
                </button>
              )}
            </div>
            <p className="text-xs text-[#958ea0] mt-1">
              {lang === 'fa' ? 'منتخبی از پروژه‌های اجرا شده توسط تیم ریتم' : 'A selection of our latest client work'}
            </p>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-white/5 border border-white/10 text-xs">
            {[
              { id: 'all', labelFa: 'همه', labelEn: 'All' },
              { id: 'video', labelFa: 'ویدیو', labelEn: 'Video' },
              { id: 'web', labelFa: 'وب‌سایت', labelEn: 'Web' },
              { id: 'mobile', labelFa: 'اپلیکیشن', labelEn: 'Mobile' },
              { id: 'other', labelFa: 'هوش مصنوعی', labelEn: 'AI' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilter(tab.id as any)}
                className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                  filter === tab.id
                    ? 'bg-[#d0bcff] text-[#131313] font-bold'
                    : 'text-[#958ea0] hover:text-[#e5e2e1]'
                }`}
              >
                {lang === 'fa' ? tab.labelFa : tab.labelEn}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="glass-card rounded-2xl overflow-hidden border border-white/10 group flex flex-col justify-between hover:border-[#d0bcff]/40 transition-all cursor-pointer relative"
              onClick={() => setSelectedMediaProject(item)}
            >
              <div className="relative aspect-[16/10] overflow-hidden bg-black/50">
                <img
                  src={item.image}
                  alt={item.titleFa}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#07080c] via-transparent to-transparent opacity-80" />

                {item.type === 'video' && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-[#d0bcff]/30 backdrop-blur-md border border-[#d0bcff]/60 flex items-center justify-center text-white group-hover:scale-110 transition-transform shadow-lg">
                      <Play className="w-5 h-5 fill-current ml-0.5" />
                    </div>
                  </div>
                )}

                {/* Top Right Card Badge */}
                <div className="absolute top-3 right-3 z-10">
                  <span className="px-2.5 py-1 rounded-lg text-[10.5px] font-mono font-bold bg-black/85 text-[#a3e635] backdrop-blur-md border border-[#a3e635]/40 shadow-md flex items-center gap-1.5">
                    <span>{lang === 'fa' ? `کارت ${item.cardNumber || ''}` : `Card ${item.cardNumber || ''}`}</span>
                    {item.fileName && (
                      <>
                        <span className="text-white/40">|</span>
                        <span className="text-white dir-ltr text-[10px]">{item.fileName}</span>
                      </>
                    )}
                  </span>
                </div>

                {/* Admin Quick Action Controls on Card (Only visible to admin) */}
                {isAdminLoggedIn && (
                  <div
                    className="absolute top-3 left-3 z-20 flex items-center gap-1.5 bg-black/80 backdrop-blur-md p-1 rounded-xl border border-white/20"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      type="button"
                      onClick={() => {
                        setEditingItem({
                          ...item,
                          tags: Array.isArray(item.tags) ? item.tags.join(', ') : item.tags,
                        });
                        setIsAddingNew(false);
                      }}
                      className="p-1.5 rounded-lg bg-white/10 hover:bg-[#d0bcff] hover:text-black text-white text-xs transition-colors cursor-pointer"
                      title="ویرایش کارت"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => handleDeletePortfolioItem(item.id, e)}
                      className="p-1.5 rounded-lg bg-red-500/20 hover:bg-red-500 text-red-400 hover:text-white text-xs transition-colors cursor-pointer"
                      title="حذف کارت"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>

              <div className="p-5 text-right flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-bold text-[#e5e2e1] mb-2 group-hover:text-[#d0bcff] transition-colors">
                    {lang === 'fa' ? item.titleFa : item.titleEn}
                  </h3>
                  <p className="text-xs text-[#958ea0] leading-relaxed mb-4">
                    {lang === 'fa' ? item.descFa : item.descEn}
                  </p>
                </div>

                <div className="pt-3 border-t border-white/[0.08] flex items-center justify-between text-xs">
                  <span className="text-[#d0bcff] font-mono text-[11px]">
                    {item.category === 'video'
                      ? 'Adobe Premiere Pro'
                      : item.category === 'web'
                      ? 'React / FullStack'
                      : 'Digital Production'}
                  </span>
                  <span className="text-[#a3e635] text-[11px] font-semibold">
                    {lang === 'fa' ? 'مشاهده و جزئیات ←' : 'View Project →'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECTION 2: PRODUCED WEBSITES SHOWCASE (آدرس سایت‌های تولید شده)             */}
      {/* ========================================================================= */}
      <div className="pt-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#38bdf8]/15 border border-[#38bdf8]/30 flex items-center justify-center text-[#38bdf8]">
                <Globe className="w-5 h-5" />
              </div>
              <h2 className="text-2xl font-bold text-white">
                {lang === 'fa' ? 'آدرس سایت‌های تولید شده توسط ریتم' : 'Live Websites Produced by RITM'}
              </h2>
              {isAdminLoggedIn && (
                <button
                  onClick={() => {
                    setEditingWebsite({
                      id: '',
                      titleFa: '',
                      titleEn: '',
                      descFa: '',
                      descEn: '',
                      siteUrl: 'https://',
                      githubUrl: '',
                      badge: 'Live Website',
                    });
                    setIsAddingWebsite(true);
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#38bdf8]/15 hover:bg-[#38bdf8]/25 border border-[#38bdf8]/35 text-[#38bdf8] text-xs font-bold transition-all cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{lang === 'fa' ? '+ افزودن وب‌سایت جدید' : '+ Add Website'}</span>
                </button>
              )}
            </div>
            <p className="text-xs text-[#958ea0] mt-1">
              {lang === 'fa'
                ? 'پلتفرم‌های آنلاین و وب‌سایت‌های کدنویسی شده توسط تیم ریتم همراه با لینک بازدید و مخزن گیت‌هاب'
                : 'Live web applications and corporate websites engineered by our team.'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {websites.map((web) => (
            <div
              key={web.id}
              className="glass-card rounded-2xl p-6 border border-white/10 flex flex-col justify-between group hover:border-[#38bdf8]/40 transition-all text-right relative"
            >
              {/* Admin Actions */}
              {isAdminLoggedIn && (
                <div className="absolute top-4 left-4 z-10 flex items-center gap-1.5 bg-black/70 p-1 rounded-xl border border-white/15">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingWebsite(web);
                      setIsAddingWebsite(false);
                    }}
                    className="p-1.5 rounded-lg bg-white/10 hover:bg-[#38bdf8] hover:text-black text-white text-xs transition-colors cursor-pointer"
                    title="ویرایش وب‌سایت"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteWebsite(web.id)}
                    className="p-1.5 rounded-lg bg-red-500/20 hover:bg-red-500 text-red-400 hover:text-white text-xs transition-colors cursor-pointer"
                    title="حذف وب‌سایت"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-mono bg-[#38bdf8]/15 text-[#38bdf8] border border-[#38bdf8]/30">
                    {web.badge || 'Live Web'}
                  </span>
                  <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/60">
                    <Globe className="w-4 h-4" />
                  </div>
                </div>

                <h3 className="text-base font-bold text-white mb-2 group-hover:text-[#38bdf8] transition-colors">
                  {lang === 'fa' ? web.titleFa : web.titleEn}
                </h3>
                <p className="text-xs text-[#958ea0] leading-relaxed mb-6">
                  {lang === 'fa' ? web.descFa : web.descEn}
                </p>
              </div>

              {/* Glass Action Buttons: Visit Live Site & GitHub Repository */}
              <div className="pt-4 border-t border-white/[0.08] flex items-center gap-2.5">
                <a
                  href={web.siteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-2.5 px-3 rounded-xl bg-white/[0.05] hover:bg-[#38bdf8] text-white hover:text-[#0b0c10] border border-white/10 hover:border-[#38bdf8] text-xs font-bold transition-all backdrop-blur-md flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                  title="مشاهده آنلاین وب‌سایت"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>{lang === 'fa' ? 'مشاهده وب‌سایت' : 'Visit Live Site'}</span>
                </a>

                {web.githubUrl && (
                  <a
                    href={web.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-2.5 px-3 rounded-xl bg-white/[0.04] hover:bg-white/[0.12] text-white border border-white/10 text-xs font-mono transition-all backdrop-blur-md flex items-center justify-center gap-1.5 cursor-pointer"
                    title="مشاهده سورس در گیت‌هاب"
                  >
                    <Github className="w-3.5 h-3.5" />
                    <span>GitHub</span>
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECTION 3: BUILT APPLICATIONS SHOWCASE (دانلود نمونه اپلیکیشن‌های ساخته شده) */}
      {/* ========================================================================= */}
      <div className="pt-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#a3e635]/15 border border-[#a3e635]/30 flex items-center justify-center text-[#a3e635]">
                <Smartphone className="w-5 h-5" />
              </div>
              <h2 className="text-2xl font-bold text-white">
                {lang === 'fa' ? 'دانلود نمونه اپلیکیشن‌های ساخته شده' : 'Applications Built by RITM'}
              </h2>
              {isAdminLoggedIn && (
                <button
                  onClick={() => {
                    setEditingApp({
                      id: '',
                      titleFa: '',
                      titleEn: '',
                      descFa: '',
                      descEn: '',
                      downloadUrl: 'https://',
                      version: 'v1.0.0',
                      size: '25 MB',
                      platform: 'Android',
                    });
                    setIsAddingApp(true);
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#a3e635]/15 hover:bg-[#a3e635]/25 border border-[#a3e635]/35 text-[#a3e635] text-xs font-bold transition-all cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{lang === 'fa' ? '+ افزودن اپلیکیشن جدید' : '+ Add App'}</span>
                </button>
              )}
            </div>
            <p className="text-xs text-[#958ea0] mt-1">
              {lang === 'fa'
                ? 'اپلیکیشن‌های موبایل و کلاینت توسعه داده شده توسط تیم فنی ریتم برای دانلود و بررسی'
                : 'Mobile applications and client tools engineered by our studio.'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {apps.map((app) => (
            <div
              key={app.id}
              className="glass-card rounded-2xl p-6 border border-white/10 flex flex-col justify-between group hover:border-[#a3e635]/40 transition-all text-right relative"
            >
              {/* Admin Actions */}
              {isAdminLoggedIn && (
                <div className="absolute top-4 left-4 z-10 flex items-center gap-1.5 bg-black/70 p-1 rounded-xl border border-white/15">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingApp(app);
                      setIsAddingApp(false);
                    }}
                    className="p-1.5 rounded-lg bg-white/10 hover:bg-[#a3e635] hover:text-black text-white text-xs transition-colors cursor-pointer"
                    title="ویرایش اپلیکیشن"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteApp(app.id)}
                    className="p-1.5 rounded-lg bg-red-500/20 hover:bg-red-500 text-red-400 hover:text-white text-xs transition-colors cursor-pointer"
                    title="حذف اپلیکیشن"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-mono bg-[#a3e635]/15 text-[#a3e635] border border-[#a3e635]/30">
                      {app.platform || 'Android'}
                    </span>
                    {app.version && (
                      <span className="text-[10px] font-mono text-[#958ea0]">{app.version}</span>
                    )}
                  </div>
                  {app.size && (
                    <span className="text-[10px] font-mono text-[#8c94a4]">{app.size}</span>
                  )}
                </div>

                <h3 className="text-base font-bold text-white mb-2 group-hover:text-[#a3e635] transition-colors">
                  {lang === 'fa' ? app.titleFa : app.titleEn}
                </h3>
                <p className="text-xs text-[#958ea0] leading-relaxed mb-6">
                  {lang === 'fa' ? app.descFa : app.descEn}
                </p>
              </div>

              {/* Glass Download Button */}
              <div className="pt-4 border-t border-white/[0.08]">
                <a
                  href={app.downloadUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 px-4 rounded-xl bg-white/[0.05] hover:bg-[#a3e635] text-white hover:text-[#0b0c10] border border-white/10 hover:border-[#a3e635] text-xs font-bold transition-all backdrop-blur-md flex items-center justify-center gap-2 cursor-pointer shadow-sm group-hover:shadow-[0_0_20px_rgba(163,230,53,0.15)]"
                  title="دانلود مستقیم اپلیکیشن"
                >
                  <Download className="w-4 h-4" />
                  <span>{lang === 'fa' ? 'دانلود و دریافت اپلیکیشن' : 'Download Application'}</span>
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* ADMIN MODAL 1: ADD/EDIT PORTFOLIO ITEM                                     */}
      {/* ========================================================================= */}
      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="glass-panel w-full max-w-lg rounded-3xl border border-white/20 p-6 sm:p-8 space-y-4 text-right max-h-[90vh] overflow-y-auto custom-scrollbar">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="text-base font-bold text-white">
                {isAddingNew ? 'افزودن نمونه‌کار جدید' : 'ویرایش اطلاعات نمونه‌کار'}
              </h3>
              <button
                onClick={() => setEditingItem(null)}
                className="p-1.5 rounded-full hover:bg-white/10 text-white/60 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSavePortfolioItem} className="space-y-4 text-xs">
              <div>
                <label className="block text-[#958ea0] mb-1">عنوان فارسی کارت:</label>
                <input
                  type="text"
                  required
                  value={editingItem.titleFa || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, titleFa: e.target.value })}
                  placeholder="مثال: تیزر تبلیغاتی محصول جدید"
                  className="w-full bg-black/50 border border-white/15 focus:border-[#d0bcff] rounded-xl p-2.5 text-white outline-none"
                />
              </div>

              <div>
                <label className="block text-[#958ea0] mb-1">دسته‌بندی پروژه:</label>
                <select
                  value={editingItem.category || 'video'}
                  onChange={(e) => setEditingItem({ ...editingItem, category: e.target.value })}
                  className="w-full bg-black/50 border border-white/15 focus:border-[#d0bcff] rounded-xl p-2.5 text-white outline-none"
                >
                  <option value="video">تدوین ویدیو (Video)</option>
                  <option value="web">توسعه وب‌سایت (Web)</option>
                  <option value="mobile">اپلیکیشن موبایل (Mobile)</option>
                  <option value="other">هوش مصنوعی و طراحی (AI)</option>
                </select>
              </div>

              <div>
                <label className="block text-[#958ea0] mb-1">توضیحات کامل فارسی:</label>
                <textarea
                  rows={3}
                  required
                  value={editingItem.descFa || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, descFa: e.target.value })}
                  placeholder="توضیحات درباره مراحل تدوین، نرم‌افزارها و نتیجه پروژه..."
                  className="w-full bg-black/50 border border-white/15 focus:border-[#d0bcff] rounded-xl p-2.5 text-white outline-none leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-[#958ea0] mb-1">برچسب‌ها (با کاما جدا کنید):</label>
                <input
                  type="text"
                  value={editingItem.tags || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, tags: e.target.value })}
                  placeholder="Premiere Pro, 4K, Color Grading"
                  className="w-full bg-black/50 border border-white/15 focus:border-[#d0bcff] rounded-xl p-2.5 text-white outline-none dir-ltr text-left font-mono"
                />
              </div>

              <div>
                <label className="block text-[#958ea0] mb-1">آدرس پوستر یا تصویر کاور:</label>
                <input
                  type="text"
                  value={editingItem.image || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, image: e.target.value })}
                  placeholder="https://... یا مسیر عکس"
                  className="w-full bg-black/50 border border-white/15 focus:border-[#d0bcff] rounded-xl p-2.5 text-white outline-none dir-ltr text-left font-mono"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white cursor-pointer"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-[#d0bcff] text-[#131313] font-bold cursor-pointer hover:bg-[#d0bcff]/90"
                >
                  ذخیره تغییرات
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ADMIN MODAL 2: ADD/EDIT WEBSITE                                            */}
      {/* ========================================================================= */}
      {editingWebsite && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="glass-panel w-full max-w-md rounded-3xl border border-white/20 p-6 sm:p-8 space-y-4 text-right">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="text-base font-bold text-white">
                {isAddingWebsite ? 'افزودن وب‌سایت جدید' : 'ویرایش اطلاعات وب‌سایت'}
              </h3>
              <button
                onClick={() => setEditingWebsite(null)}
                className="p-1.5 rounded-full hover:bg-white/10 text-white/60 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveWebsite} className="space-y-4 text-xs">
              <div>
                <label className="block text-[#958ea0] mb-1">نام یا عنوان سایت:</label>
                <input
                  type="text"
                  required
                  value={editingWebsite.titleFa || ''}
                  onChange={(e) => setEditingWebsite({ ...editingWebsite, titleFa: e.target.value })}
                  placeholder="مثال: فروشگاه مدرن نکسوس"
                  className="w-full bg-black/50 border border-white/15 focus:border-[#38bdf8] rounded-xl p-2.5 text-white outline-none"
                />
              </div>

              <div>
                <label className="block text-[#958ea0] mb-1">توضیحات کوتاه درباره سایت:</label>
                <textarea
                  rows={3}
                  required
                  value={editingWebsite.descFa || ''}
                  onChange={(e) => setEditingWebsite({ ...editingWebsite, descFa: e.target.value })}
                  placeholder="توضیحات فنی، زبان‌های استفاده شده و امکانات سایت..."
                  className="w-full bg-black/50 border border-white/15 focus:border-[#38bdf8] rounded-xl p-2.5 text-white outline-none leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-[#958ea0] mb-1">لینک مشاهده سایت (URL):</label>
                <input
                  type="url"
                  required
                  value={editingWebsite.siteUrl || ''}
                  onChange={(e) => setEditingWebsite({ ...editingWebsite, siteUrl: e.target.value })}
                  placeholder="https://example.com"
                  className="w-full bg-black/50 border border-white/15 focus:border-[#38bdf8] rounded-xl p-2.5 text-white outline-none dir-ltr text-left font-mono"
                />
              </div>

              <div>
                <label className="block text-[#958ea0] mb-1">لینک مخزن گیت‌هاب (اختیاری):</label>
                <input
                  type="url"
                  value={editingWebsite.githubUrl || ''}
                  onChange={(e) => setEditingWebsite({ ...editingWebsite, githubUrl: e.target.value })}
                  placeholder="https://github.com/username/project"
                  className="w-full bg-black/50 border border-white/15 focus:border-[#38bdf8] rounded-xl p-2.5 text-white outline-none dir-ltr text-left font-mono"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setEditingWebsite(null)}
                  className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white cursor-pointer"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-[#38bdf8] text-[#0b0c10] font-bold cursor-pointer hover:bg-[#38bdf8]/90"
                >
                  ذخیره وب‌سایت
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ADMIN MODAL 3: ADD/EDIT APPLICATION                                        */}
      {/* ========================================================================= */}
      {editingApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="glass-panel w-full max-w-md rounded-3xl border border-white/20 p-6 sm:p-8 space-y-4 text-right">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="text-base font-bold text-white">
                {isAddingApp ? 'افزودن اپلیکیشن جدید' : 'ویرایش اطلاعات اپلیکیشن'}
              </h3>
              <button
                onClick={() => setEditingApp(null)}
                className="p-1.5 rounded-full hover:bg-white/10 text-white/60 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveApp} className="space-y-4 text-xs">
              <div>
                <label className="block text-[#958ea0] mb-1">نام یا عنوان اپلیکیشن:</label>
                <input
                  type="text"
                  required
                  value={editingApp.titleFa || ''}
                  onChange={(e) => setEditingApp({ ...editingApp, titleFa: e.target.value })}
                  placeholder="مثال: ریتم پلیر پرو"
                  className="w-full bg-black/50 border border-white/15 focus:border-[#a3e635] rounded-xl p-2.5 text-white outline-none"
                />
              </div>

              <div>
                <label className="block text-[#958ea0] mb-1">توضیحات کوتاه اپلیکیشن:</label>
                <textarea
                  rows={3}
                  required
                  value={editingApp.descFa || ''}
                  onChange={(e) => setEditingApp({ ...editingApp, descFa: e.target.value })}
                  placeholder="قابلیت‌های کلیدی، ویژگی‌های منحصر‌به‌فرد و نحوه استفاده..."
                  className="w-full bg-black/50 border border-white/15 focus:border-[#a3e635] rounded-xl p-2.5 text-white outline-none leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-[#958ea0] mb-1">لینک مستقیم دانلود فایل (APK / نصب):</label>
                <input
                  type="url"
                  required
                  value={editingApp.downloadUrl || ''}
                  onChange={(e) => setEditingApp({ ...editingApp, downloadUrl: e.target.value })}
                  placeholder="https://dl.example.com/app.apk"
                  className="w-full bg-black/50 border border-white/15 focus:border-[#a3e635] rounded-xl p-2.5 text-white outline-none dir-ltr text-left font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#958ea0] mb-1">نسخه (Version):</label>
                  <input
                    type="text"
                    value={editingApp.version || ''}
                    onChange={(e) => setEditingApp({ ...editingApp, version: e.target.value })}
                    placeholder="v1.0.0"
                    className="w-full bg-black/50 border border-white/15 focus:border-[#a3e635] rounded-xl p-2.5 text-white outline-none dir-ltr text-left font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[#958ea0] mb-1">حجم تقریبی:</label>
                  <input
                    type="text"
                    value={editingApp.size || ''}
                    onChange={(e) => setEditingApp({ ...editingApp, size: e.target.value })}
                    placeholder="25 MB"
                    className="w-full bg-black/50 border border-white/15 focus:border-[#a3e635] rounded-xl p-2.5 text-white outline-none dir-ltr text-left font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setEditingApp(null)}
                  className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white cursor-pointer"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-[#a3e635] text-[#0b0c10] font-bold cursor-pointer hover:bg-[#a3e635]/90"
                >
                  ذخیره اپلیکیشن
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Media Detail Modal */}
      {selectedMediaProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="glass-panel w-full max-w-3xl rounded-3xl border border-white/20 p-6 shadow-2xl relative space-y-4 text-right overflow-hidden my-auto max-h-[92vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <span className="font-mono text-xs text-[#a3e635] font-bold">
                {selectedMediaProject.fileName || 'RITM Production File'}
              </span>
              <button
                onClick={() => setSelectedMediaProject(null)}
                className="p-1.5 rounded-full hover:bg-white/10 text-white/60 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto space-y-4 pr-1 custom-scrollbar">
              <div className="relative aspect-video rounded-2xl overflow-hidden bg-black border border-white/10 flex items-center justify-center">
                {selectedMediaProject.type === 'video' && selectedMediaProject.mediaUrl ? (
                  <video
                    src={selectedMediaProject.mediaUrl}
                    controls
                    autoPlay
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <img
                    src={selectedMediaProject.image}
                    alt={selectedMediaProject.titleFa}
                    className="w-full h-full object-contain"
                  />
                )}
              </div>

              <div>
                <h3 className="text-lg font-bold text-white mb-2">
                  {lang === 'fa' ? selectedMediaProject.titleFa : selectedMediaProject.titleEn}
                </h3>
                <p className="text-xs sm:text-sm text-[#958ea0] leading-relaxed">
                  {lang === 'fa' ? selectedMediaProject.descFa : selectedMediaProject.descEn}
                </p>
              </div>

              <div className="flex flex-wrap gap-2 pt-2">
                {selectedMediaProject.tags &&
                  selectedMediaProject.tags.map((tag: string, i: number) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 rounded-lg text-xs font-mono bg-white/5 text-[#d0bcff] border border-white/10"
                    >
                      {tag}
                    </span>
                  ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
