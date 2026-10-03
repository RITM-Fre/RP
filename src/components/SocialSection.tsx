import React, { useState } from 'react';
import {
  Send,
  Youtube,
  Twitter,
  MessageSquare,
  ExternalLink,
  Copy,
  Check,
  Sparkles,
  Instagram,
  Linkedin,
  Github,
  Globe,
  Film,
  Plus,
  Trash2,
  Edit2,
  X,
  MessageCircle,
} from 'lucide-react';
import { SOCIAL_LINKS } from '../data/mockData';

export interface SocialChannelItem {
  id: string;
  nameFa: string;
  nameEn: string;
  handle: string;
  descFa: string;
  descEn: string;
  url: string;
  badgeFa: string;
  badgeEn: string;
  iconType: 'telegram' | 'youtube' | 'x' | 'ble' | 'instagram' | 'linkedin' | 'github' | 'aparat' | 'discord' | 'whatsapp' | 'eitaa' | 'rubika' | 'globe';
  color: string;
  borderColor: string;
  btnBg: string;
}

const DEFAULT_CHANNELS: SocialChannelItem[] = [
  {
    id: 'telegram',
    nameFa: 'کانال رسمی تلگرام ریتم',
    nameEn: 'Official Telegram Channel',
    handle: '@RITM_FreeLancer',
    descFa: 'انتشار جدیدترین نمونه‌کارهای تدوین ویدیو، پکیج‌های پریمیر، تخفیف‌ها و اطلاعیه‌ها',
    descEn: 'Latest video editing showreels, Premiere assets, discounts & updates',
    url: SOCIAL_LINKS.telegramChannel,
    badgeFa: 'کانال اصلی',
    badgeEn: 'Primary Channel',
    iconType: 'telegram',
    color: 'from-[#0088cc]/30 to-[#229ed9]/10',
    borderColor: 'border-[#229ed9]/40 hover:border-[#229ed9]',
    btnBg: 'bg-gradient-to-r from-[#0088cc] to-[#229ed9] hover:from-[#0077b5] hover:to-[#1ea1d7] text-white shadow-lg shadow-[#0088cc]/30',
  },
  {
    id: 'youtube',
    nameFa: 'کانال یوتیوب ریتم',
    nameEn: 'YouTube Channel',
    handle: '@RITM_Editz',
    descFa: 'شویس‌های 4K تدوین، آموزش‌های تخصصی ادوبی پریمیر پرو و پشت صحنه پروژه‌ها',
    descEn: '4K video showreels, Adobe Premiere tutorials and behind the scenes',
    url: SOCIAL_LINKS.youtube,
    badgeFa: 'ویدیوهای 4K',
    badgeEn: '4K Content',
    iconType: 'youtube',
    color: 'from-[#ff0000]/30 to-[#cc0000]/10',
    borderColor: 'border-[#ff0000]/40 hover:border-[#ff0000]',
    btnBg: 'bg-[#ff0000] hover:bg-[#e00000] text-white shadow-lg shadow-[#ff0000]/30',
  },
  {
    id: 'x',
    nameFa: 'صفحه رسمی ایکس (توییتر)',
    nameEn: 'Official X (Twitter)',
    handle: '@RITM_Editz',
    descFa: 'ارتباط مستقیم، نکات ریز تدوین ویدیو، بحث‌های فنی تکنولوژی و هوش مصنوعی',
    descEn: 'Direct engagement, video editing tips, creative tech and AI updates',
    url: SOCIAL_LINKS.x,
    badgeFa: 'به‌روزرسانی سریع',
    badgeEn: 'Real-time',
    iconType: 'x',
    color: 'from-white/15 to-white/5',
    borderColor: 'border-white/20 hover:border-white/40',
    btnBg: 'bg-white hover:bg-zinc-200 text-black shadow-lg shadow-white/10 font-bold',
  },
  {
    id: 'ble',
    nameFa: 'کانال پیام‌رسان بله ریتم',
    nameEn: 'Bale Messenger Channel',
    handle: 'ble.ir/RITM_FreeLancer',
    descFa: 'دسترسی سریع و بدون فیلتر برای پیگیری اخبار و سفارش‌ها در بستر داخلی',
    descEn: 'Direct domestic channel for fast access without VPN',
    url: SOCIAL_LINKS.ble,
    badgeFa: 'داخلی بدون فیلتر',
    badgeEn: 'Local Access',
    iconType: 'ble',
    color: 'from-[#059669]/30 to-[#10b981]/10',
    borderColor: 'border-[#10b981]/40 hover:border-[#10b981]',
    btnBg: 'bg-gradient-to-r from-[#059669] to-[#10b981] hover:from-[#047857] hover:to-[#059669] text-white shadow-lg shadow-[#059669]/30',
  },
];

interface SocialSectionProps {
  lang: 'fa' | 'en';
  isAdminLoggedIn?: boolean;
}

export const SocialSection: React.FC<SocialSectionProps> = ({ lang, isAdminLoggedIn = false }) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const [channels, setChannels] = useState<SocialChannelItem[]>(() => {
    try {
      const stored = localStorage.getItem('ritm_custom_social_channels');
      return stored ? JSON.parse(stored) : DEFAULT_CHANNELS;
    } catch (e) {
      return DEFAULT_CHANNELS;
    }
  });

  const [editingChannel, setEditingChannel] = useState<SocialChannelItem | null>(null);
  const [isAddingChannel, setIsAddingChannel] = useState(false);

  const saveChannels = (updated: SocialChannelItem[]) => {
    setChannels(updated);
    try {
      localStorage.setItem('ritm_custom_social_channels', JSON.stringify(updated));
    } catch (e) {}
  };

  const handleCopy = (handle: string, id: string) => {
    navigator.clipboard.writeText(handle);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleDeleteChannel = (id: string) => {
    const updated = channels.filter((c) => c.id !== id);
    saveChannels(updated);
  };

  const handleSaveChannel = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingChannel) return;

    if (isAddingChannel) {
      const newChan: SocialChannelItem = {
        ...editingChannel,
        id: `social-${Date.now()}`,
      };
      saveChannels([...channels, newChan]);
    } else {
      const updated = channels.map((c) => (c.id === editingChannel.id ? editingChannel : c));
      saveChannels(updated);
    }
    setEditingChannel(null);
    setIsAddingChannel(false);
  };

  const renderIcon = (type: string) => {
    switch (type) {
      case 'telegram':
        return <Send className="w-5 h-5 text-[#229ed9]" />;
      case 'youtube':
        return <Youtube className="w-5 h-5 text-[#ff0000]" />;
      case 'x':
        return <Twitter className="w-5 h-5 text-white" />;
      case 'ble':
        return <MessageSquare className="w-5 h-5 text-[#10b981]" />;
      case 'instagram':
        return <Instagram className="w-5 h-5 text-[#e1306c]" />;
      case 'linkedin':
        return <Linkedin className="w-5 h-5 text-[#0a66c2]" />;
      case 'github':
        return <Github className="w-5 h-5 text-white" />;
      case 'aparat':
        return <Film className="w-5 h-5 text-[#ed145b]" />;
      case 'whatsapp':
        return <MessageCircle className="w-5 h-5 text-[#25d366]" />;
      case 'discord':
        return <MessageSquare className="w-5 h-5 text-[#5865f2]" />;
      case 'eitaa':
        return <Send className="w-5 h-5 text-[#ea580c]" />;
      case 'rubika':
        return <MessageCircle className="w-5 h-5 text-[#9333ea]" />;
      default:
        return <Globe className="w-5 h-5 text-[#d0bcff]" />;
    }
  };

  return (
    <section className="w-full max-w-6xl mx-auto px-4 py-12 space-y-8" dir={lang === 'fa' ? 'rtl' : 'ltr'}>
      {/* Title */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-[#d0bcff]">
          <Sparkles className="w-3.5 h-3.5" />
          <span>{lang === 'fa' ? 'کانال‌ها و شبکه‌های اجتماعی ریتم' : 'Official Social Channels'}</span>
        </div>

        <div className="flex items-center justify-center gap-3">
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
            {lang === 'fa' ? 'ما را در شبکه‌های اجتماعی دنبال کنید' : 'Connect With Us Across Platforms'}
          </h2>
          {/* Admin Add Button (Only visible if admin is logged in) */}
          {isAdminLoggedIn && (
            <button
              onClick={() => {
                setEditingChannel({
                  id: '',
                  nameFa: '',
                  nameEn: '',
                  handle: '@',
                  descFa: '',
                  descEn: '',
                  url: 'https://',
                  badgeFa: 'شبکه رسمی',
                  badgeEn: 'Official',
                  iconType: 'telegram',
                  color: 'from-[#0088cc]/30 to-[#229ed9]/10',
                  borderColor: 'border-[#229ed9]/40 hover:border-[#229ed9]',
                  btnBg: 'bg-gradient-to-r from-[#0088cc] to-[#229ed9] text-white shadow-lg shadow-[#0088cc]/30 font-bold',
                });
                setIsAddingChannel(true);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#a3e635]/15 hover:bg-[#a3e635]/25 border border-[#a3e635]/35 text-[#a3e635] text-xs font-bold transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{lang === 'fa' ? '+ افزودن شبکه اجتماعی' : '+ Add Channel'}</span>
            </button>
          )}
        </div>

        <p className="text-xs sm:text-sm text-[#8c94a4] max-w-xl mx-auto leading-relaxed">
          {lang === 'fa'
            ? 'جدیدترین نمونه‌کارها، ویدیوهای آموزشی پریمیر و اطلاع‌رسانی‌ها را در کانال‌های زیر مشاهده کنید.'
            : 'Explore our latest edits, Premiere tips, and direct communications on our channels.'}
        </p>
      </div>

      {/* Grid of channels */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {channels.map((ch) => (
          <div
            key={ch.id}
            className={`glass-panel rounded-2xl p-6 border ${ch.borderColor} transition-all duration-300 relative overflow-hidden flex flex-col justify-between group hover:shadow-2xl text-right`}
          >
            {/* Background gradient glow */}
            <div
              className={`absolute inset-0 bg-gradient-to-br ${ch.color} opacity-40 group-hover:opacity-70 transition-opacity pointer-events-none`}
            />

            {/* Admin actions (STRICTLY only visible if admin is logged in) */}
            {isAdminLoggedIn && (
              <div className="absolute top-4 left-4 z-10 flex items-center gap-1.5 bg-black/80 backdrop-blur-md p-1 rounded-xl border border-white/20">
                <button
                  type="button"
                  onClick={() => {
                    setEditingChannel(ch);
                    setIsAddingChannel(false);
                  }}
                  className="p-1.5 rounded-lg bg-white/10 hover:bg-[#d0bcff] hover:text-black text-white text-xs transition-colors cursor-pointer"
                  title="ویرایش کانال"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteChannel(ch.id)}
                  className="p-1.5 rounded-lg bg-red-500/20 hover:bg-red-500 text-red-400 hover:text-white text-xs transition-colors cursor-pointer"
                  title="حذف کانال"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Top Row: Badge, Icon & Names */}
            <div className="relative z-10 space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 rounded-full text-[10px] font-mono bg-white/10 border border-white/10 text-white font-semibold shadow-sm">
                  {lang === 'fa' ? ch.badgeFa : ch.badgeEn}
                </span>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <h3 className="text-base font-bold text-white group-hover:text-[#d0bcff] transition-colors">
                      {lang === 'fa' ? ch.nameFa : ch.nameEn}
                    </h3>
                    <span className="text-xs font-mono text-[#8c94a4] dir-ltr text-left block">
                      {ch.handle}
                    </span>
                  </div>
                  <div className="w-11 h-11 rounded-xl bg-black/50 border border-white/15 flex items-center justify-center shrink-0 shadow-inner">
                    {renderIcon(ch.iconType)}
                  </div>
                </div>
              </div>

              {/* Description */}
              <p className="text-xs text-[#c2becc] leading-relaxed">
                {lang === 'fa' ? ch.descFa : ch.descEn}
              </p>
            </div>

            {/* Bottom Action Row: High contrast, optimized buttons */}
            <div className="relative z-10 flex items-center gap-2.5 pt-4 mt-4 border-t border-white/[0.08]">
              {/* Primary Direct Button with high contrast */}
              <a
                href={ch.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-95 ${ch.btnBg}`}
              >
                <span>{lang === 'fa' ? 'عضویت و مشاهده کانال' : 'Join & Follow'}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              {/* Copy handle button */}
              <button
                onClick={() => handleCopy(ch.handle, ch.id)}
                className="py-2.5 px-3 rounded-xl bg-white/5 hover:bg-white/15 border border-white/10 text-[#8c94a4] hover:text-white transition-all text-xs font-mono flex items-center gap-1.5 cursor-pointer"
                title={lang === 'fa' ? 'کپی آیدی' : 'Copy ID'}
              >
                {copiedId === ch.id ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-[#a3e635]" />
                    <span className="text-[#a3e635] text-[11px]">{lang === 'fa' ? 'کپی شد' : 'Copied'}</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span className="text-[11px] hidden sm:inline">{lang === 'fa' ? 'کپی' : 'Copy'}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Admin Add / Edit Channel Modal */}
      {editingChannel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="glass-panel w-full max-w-md rounded-3xl border border-white/20 p-6 sm:p-8 space-y-4 text-right">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="text-base font-bold text-white">
                {isAddingChannel ? (lang === 'fa' ? 'افزودن شبکه اجتماعی جدید' : 'Add Social Channel') : (lang === 'fa' ? 'ویرایش شبکه اجتماعی' : 'Edit Channel')}
              </h3>
              <button
                onClick={() => setEditingChannel(null)}
                className="p-1.5 rounded-full hover:bg-white/10 text-white/60 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveChannel} className="space-y-4 text-xs">
              <div>
                <label className="block text-[#958ea0] mb-1 font-semibold">لوگوی پیش‌فرض پلتفرم:</label>
                <select
                  value={editingChannel.iconType}
                  onChange={(e: any) => {
                    const icon = e.target.value;
                    let color = 'from-[#38bdf8]/20 to-transparent';
                    let borderColor = 'border-[#38bdf8]/40 hover:border-[#38bdf8]';
                    let btnBg = 'bg-[#38bdf8] hover:bg-[#2faad8] text-[#07080c] font-bold shadow-lg shadow-[#38bdf8]/30';

                    if (icon === 'telegram') {
                      color = 'from-[#0088cc]/30 to-[#229ed9]/10';
                      borderColor = 'border-[#229ed9]/40 hover:border-[#229ed9]';
                      btnBg = 'bg-gradient-to-r from-[#0088cc] to-[#229ed9] text-white shadow-lg shadow-[#0088cc]/30 font-bold';
                    } else if (icon === 'youtube') {
                      color = 'from-[#ff0000]/30 to-[#cc0000]/10';
                      borderColor = 'border-[#ff0000]/40 hover:border-[#ff0000]';
                      btnBg = 'bg-[#ff0000] hover:bg-[#d00000] text-white shadow-lg shadow-[#ff0000]/30 font-bold';
                    } else if (icon === 'instagram') {
                      color = 'from-[#f43f5e]/25 to-[#e11d48]/10';
                      borderColor = 'border-[#e1306c]/40 hover:border-[#e1306c]';
                      btnBg = 'bg-gradient-to-r from-[#833ab4] via-[#fd1d1d] to-[#fcb045] text-white font-bold shadow-lg shadow-[#fd1d1d]/30';
                    } else if (icon === 'ble') {
                      color = 'from-[#059669]/30 to-[#10b981]/10';
                      borderColor = 'border-[#10b981]/40 hover:border-[#10b981]';
                      btnBg = 'bg-gradient-to-r from-[#059669] to-[#10b981] text-white shadow-lg shadow-[#059669]/30 font-bold';
                    } else if (icon === 'x') {
                      color = 'from-white/15 to-white/5';
                      borderColor = 'border-white/20 hover:border-white/40';
                      btnBg = 'bg-white hover:bg-zinc-200 text-black font-bold shadow-lg shadow-white/10';
                    } else if (icon === 'github') {
                      color = 'from-[#24292e]/40 to-transparent';
                      borderColor = 'border-white/25 hover:border-white/50';
                      btnBg = 'bg-[#24292e] hover:bg-[#2f363d] text-white font-bold border border-white/20';
                    } else if (icon === 'aparat') {
                      color = 'from-[#ed145b]/30 to-transparent';
                      borderColor = 'border-[#ed145b]/40 hover:border-[#ed145b]';
                      btnBg = 'bg-[#ed145b] hover:bg-[#d1104e] text-white font-bold shadow-lg shadow-[#ed145b]/30';
                    } else if (icon === 'whatsapp') {
                      color = 'from-[#25d366]/30 to-transparent';
                      borderColor = 'border-[#25d366]/40 hover:border-[#25d366]';
                      btnBg = 'bg-[#25d366] hover:bg-[#20b858] text-white font-bold shadow-lg shadow-[#25d366]/30';
                    } else if (icon === 'discord') {
                      color = 'from-[#5865f2]/30 to-transparent';
                      borderColor = 'border-[#5865f2]/40 hover:border-[#5865f2]';
                      btnBg = 'bg-[#5865f2] hover:bg-[#4752c4] text-white font-bold shadow-lg shadow-[#5865f2]/30';
                    } else if (icon === 'linkedin') {
                      color = 'from-[#0a66c2]/30 to-transparent';
                      borderColor = 'border-[#0a66c2]/40 hover:border-[#0a66c2]';
                      btnBg = 'bg-[#0a66c2] hover:bg-[#084e96] text-white font-bold shadow-lg shadow-[#0a66c2]/30';
                    } else if (icon === 'eitaa') {
                      color = 'from-[#ea580c]/30 to-transparent';
                      borderColor = 'border-[#ea580c]/40 hover:border-[#ea580c]';
                      btnBg = 'bg-[#ea580c] hover:bg-[#c2410c] text-white font-bold shadow-lg shadow-[#ea580c]/30';
                    } else if (icon === 'rubika') {
                      color = 'from-[#9333ea]/30 to-transparent';
                      borderColor = 'border-[#9333ea]/40 hover:border-[#9333ea]';
                      btnBg = 'bg-[#9333ea] hover:bg-[#7e22ce] text-white font-bold shadow-lg shadow-[#9333ea]/30';
                    }

                    setEditingChannel({
                      ...editingChannel,
                      iconType: icon,
                      color,
                      borderColor,
                      btnBg,
                    });
                  }}
                  className="w-full bg-black/60 border border-white/20 focus:border-[#d0bcff] rounded-xl p-2.5 text-white outline-none cursor-pointer"
                >
                  <option value="telegram">تلگرام (Telegram)</option>
                  <option value="youtube">یوتیوب (YouTube)</option>
                  <option value="instagram">اینستاگرام (Instagram)</option>
                  <option value="x">ایکس / توییتر (X)</option>
                  <option value="ble">پیام‌رسان بله (Bale)</option>
                  <option value="aparat">آپارات (Aparat)</option>
                  <option value="whatsapp">واتس‌اپ (WhatsApp)</option>
                  <option value="discord">دیسکورد (Discord)</option>
                  <option value="linkedin">لینکدین (LinkedIn)</option>
                  <option value="github">گیت‌هاب (GitHub)</option>
                  <option value="eitaa">ایتا (Eitaa)</option>
                  <option value="rubika">روبیکا (Rubika)</option>
                  <option value="globe">وب‌سایت / پلتفرم (Website)</option>
                </select>
              </div>

              <div>
                <label className="block text-[#958ea0] mb-1 font-semibold">نام فارسی شبکه:</label>
                <input
                  type="text"
                  required
                  value={editingChannel.nameFa || ''}
                  onChange={(e) => setEditingChannel({ ...editingChannel, nameFa: e.target.value })}
                  placeholder="مثال: کانال رسمی تلگرام ریتم"
                  className="w-full bg-black/60 border border-white/15 focus:border-[#d0bcff] rounded-xl p-2.5 text-white outline-none"
                />
              </div>

              <div>
                <label className="block text-[#958ea0] mb-1 font-semibold">نام انگلیسی (English Name):</label>
                <input
                  type="text"
                  value={editingChannel.nameEn || ''}
                  onChange={(e) => setEditingChannel({ ...editingChannel, nameEn: e.target.value })}
                  placeholder="e.g. Official Telegram Channel"
                  className="w-full bg-black/60 border border-white/15 focus:border-[#d0bcff] rounded-xl p-2.5 text-white outline-none dir-ltr text-left"
                />
              </div>

              <div>
                <label className="block text-[#958ea0] mb-1 font-semibold">آیدی یا شناسه (Handle):</label>
                <input
                  type="text"
                  required
                  value={editingChannel.handle || ''}
                  onChange={(e) => setEditingChannel({ ...editingChannel, handle: e.target.value })}
                  placeholder="@RITM_FreeLancer"
                  className="w-full bg-black/60 border border-white/15 focus:border-[#d0bcff] rounded-xl p-2.5 text-white outline-none dir-ltr text-left font-mono"
                />
              </div>

              <div>
                <label className="block text-[#958ea0] mb-1 font-semibold">لینک مستقیم اینترنتی (URL):</label>
                <input
                  type="url"
                  required
                  value={editingChannel.url || ''}
                  onChange={(e) => setEditingChannel({ ...editingChannel, url: e.target.value })}
                  placeholder="https://t.me/RITM_FreeLancer"
                  className="w-full bg-black/60 border border-white/15 focus:border-[#d0bcff] rounded-xl p-2.5 text-white outline-none dir-ltr text-left font-mono"
                />
              </div>

              <div>
                <label className="block text-[#958ea0] mb-1 font-semibold">توضیح کوتاه فارسی:</label>
                <textarea
                  rows={2}
                  required
                  value={editingChannel.descFa || ''}
                  onChange={(e) => setEditingChannel({ ...editingChannel, descFa: e.target.value })}
                  placeholder="توضیح کوتاه درباره محتوا یا خدمات این کانال..."
                  className="w-full bg-black/60 border border-white/15 focus:border-[#d0bcff] rounded-xl p-2.5 text-white outline-none leading-relaxed"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setEditingChannel(null)}
                  className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white cursor-pointer"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-[#d0bcff] text-[#131313] font-bold cursor-pointer hover:bg-[#d0bcff]/90 shadow-md shadow-[#d0bcff]/20"
                >
                  ذخیره کانال
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};
