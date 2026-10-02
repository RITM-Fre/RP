import React, { useState, useEffect, useRef } from 'react';
import {
  MessageSquare,
  Send,
  User,
  Shield,
  Clock,
  Sparkles,
  Paperclip,
  CheckCircle2,
  RefreshCw,
  ExternalLink,
  ChevronDown,
  Info,
  Film,
  Code,
  Smartphone,
  Check,
  CheckCheck,
  ArrowRight,
  Phone,
  MessageCircle,
  Reply,
  X,
} from 'lucide-react';
import { AuthUser, Order, ProjectChatMessage, ChatConversation } from '../types';
import {
  getChatMessages,
  sendChatMessage,
  getChatConversations,
  markChatRead,
  getClientOrders,
} from '../services/api';

interface ProjectChatProps {
  lang: 'fa' | 'en';
  currentUser: AuthUser | null;
  isAdmin: boolean;
  initialOrderCode?: string | null;
  onNavigateToOrder?: () => void;
}

// Subtle Web Audio sound for messages (no external audio files needed)
const playChime = () => {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
    osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.12); // A5
    gain.gain.setValueAtTime(0.04, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.16);
  } catch (e) {
    // Ignore audio permission error
  }
};

export const ProjectChat: React.FC<ProjectChatProps> = ({
  lang,
  currentUser,
  isAdmin,
  initialOrderCode = null,
  onNavigateToOrder,
}) => {
  // Messages state
  const [messages, setMessages] = useState<ProjectChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [loading, setLoading] = useState(true);

  // Guest sender details (if not logged in)
  const [guestName, setGuestName] = useState(() => {
    return localStorage.getItem('ritm_chat_guest_name') || '';
  });
  const [guestContact, setGuestContact] = useState(() => {
    return localStorage.getItem('ritm_chat_guest_contact') || '';
  });
  const [showGuestDetails, setShowGuestDetails] = useState(false);

  // Reply State
  const [replyingTo, setReplyingTo] = useState<ProjectChatMessage | null>(null);

  // Mobile layout state: 'list' (conversations) vs 'chat' (active room)
  const [mobileView, setMobileView] = useState<'list' | 'chat'>('chat');

  // Admin conversation list state
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [selectedOrderCode, setSelectedOrderCode] = useState<string>(initialOrderCode || 'RITM-GENERAL');

  // Client user's orders state
  const [userOrders, setUserOrders] = useState<Order[]>([]);
  const [selectedClientOrder, setSelectedClientOrder] = useState<Order | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatScrollContainerRef = useRef<HTMLDivElement>(null);
  const chatInputRef = useRef<HTMLInputElement>(null);
  const pollingIntervalRef = useRef<any>(null);
  const isNearBottomRef = useRef<boolean>(true);

  // Check if user is scrolled near bottom
  const handleScrollChat = () => {
    const el = chatScrollContainerRef.current;
    if (!el) return;
    const distanceToBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    isNearBottomRef.current = distanceToBottom < 120;
  };

  const scrollToBottom = (force = false) => {
    if (force || isNearBottomRef.current) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // 1. Fetch user orders if client
  useEffect(() => {
    if (!isAdmin && currentUser) {
      getClientOrders(currentUser).then((res) => {
        if (res.success && res.orders) {
          setUserOrders(res.orders);
          if (initialOrderCode) {
            const found = res.orders.find((o) => o.order_code === initialOrderCode);
            if (found) {
              setSelectedClientOrder(found);
              setSelectedOrderCode(found.order_code);
            }
          }
        }
      });
    }
  }, [isAdmin, currentUser, initialOrderCode]);

  // 2. Fetch conversations for admin
  const fetchConversations = async () => {
    if (isAdmin) {
      const res = await getChatConversations();
      if (res.success && res.conversations) {
        setConversations(res.conversations);
        if (!selectedOrderCode && res.conversations.length > 0) {
          setSelectedOrderCode(res.conversations[0].orderCode);
        }
      }
    }
  };

  // 3. Fetch messages for active conversation
  const fetchMessages = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await getChatMessages(selectedOrderCode, currentUser?.id);
      if (res.success && Array.isArray(res.messages)) {
        setMessages((prev) => {
          if (prev.length !== res.messages.length) {
            // New message arrived
            setTimeout(() => scrollToBottom(false), 50);
          }
          return res.messages;
        });
      }
    } catch (err) {
      console.error('Failed to load chat messages:', err);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  // Initial load on selected conversation change
  useEffect(() => {
    fetchMessages(false);
    setTimeout(() => scrollToBottom(true), 150);

    if (isAdmin) {
      fetchConversations();
      markChatRead(selectedOrderCode, 'admin');
    } else {
      markChatRead(selectedOrderCode, 'client');
    }
  }, [selectedOrderCode, isAdmin]);

  // Polling every 3.5 seconds
  useEffect(() => {
    pollingIntervalRef.current = setInterval(() => {
      fetchMessages(true);
      if (isAdmin) fetchConversations();
    }, 3500);

    return () => {
      if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
    };
  }, [selectedOrderCode, isAdmin]);

  // Cross-tab sync with localStorage events
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'ritm_live_chat_messages') {
        fetchMessages(true);
        if (isAdmin) fetchConversations();
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [selectedOrderCode, isAdmin]);

  // Handle Send Message
  const handleSendMessage = async (customText?: string) => {
    const textToSend = (customText || inputText).trim();
    if (!textToSend || isSending) return;

    setIsSending(true);
    try {
      const senderRole = isAdmin ? 'admin' : 'client';
      let clientName = '';

      if (isAdmin) {
        clientName = lang === 'fa' ? 'مدیریت استودیو ریتم' : 'RITM Studio Admin';
      } else if (currentUser?.first_name || currentUser?.username) {
        clientName = currentUser.first_name || currentUser.username;
      } else if (guestName.trim()) {
        clientName = guestName.trim() + (guestContact.trim() ? ` (${guestContact.trim()})` : '');
      } else {
        clientName = lang === 'fa' ? 'کاربر مهمان' : 'Guest Client';
      }

      // Save guest info
      if (guestName.trim()) localStorage.setItem('ritm_chat_guest_name', guestName.trim());
      if (guestContact.trim()) localStorage.setItem('ritm_chat_guest_contact', guestContact.trim());

      const res = await sendChatMessage({
        orderCode: selectedOrderCode,
        userId: currentUser?.id || null,
        clientName,
        senderRole,
        text: textToSend,
        replyTo: replyingTo
          ? {
              id: replyingTo.id,
              clientName: replyingTo.senderRole === 'admin' ? 'استودیو ریتم' : replyingTo.clientName,
              text: replyingTo.text,
              senderRole: replyingTo.senderRole,
            }
          : null,
      });

      if (res.success && res.message) {
        setMessages((prev) => [...prev, res.message]);
        if (!customText) setInputText('');
        setReplyingTo(null);
        playChime();
        setTimeout(() => scrollToBottom(true), 50);
        if (isAdmin) fetchConversations();
      }
    } catch (e) {
      console.error('Failed to send chat message:', e);
    } finally {
      setIsSending(false);
    }
  };

  // Quick Prompt Chips
  const quickPrompts = [
    { label: 'استعلام وضعیت پروژه', text: 'سلام، لطفاً آخرین وضعیت اجرایی و پیشرفت پروژه من را بررسی و اعلام فرمایید.' },
    { label: 'هماهنگی اصلاحات و ادیت', text: 'سلام، چند اصلاحیه در فایل یا سناریو دارم، چطور می‌توانم هماهنگ کنم؟' },
    { label: 'ارسال راش و فوتیج سنگین', text: 'سلام، راش‌ها و فوتیج‌های سنگین پروژه را به کدام آیدی تلگرام یا بله ارسال کنم؟' },
    { label: 'استعلام زمان تحویل نهایی', text: 'سلام، زمان تحویل نسخه نهایی پروژه حدوداً چه تاریخی خواهد بود؟' },
  ];

  return (
    <div className="max-w-6xl mx-auto py-3 sm:py-6 px-3 sm:px-6 pb-28 sm:pb-12">
      {/* Top Banner & Quick Links */}
      <div className="glass-panel rounded-2xl p-4 sm:p-5 border border-white/10 mb-4 sm:mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#d0bcff]/15 text-[#d0bcff] flex items-center justify-center border border-[#d0bcff]/30 shrink-0">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
              <span>{lang === 'fa' ? 'گفتگوی آنلاین و پشتیبانی ریتم' : 'Online Project Discussion'}</span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono bg-[#a3e635]/15 text-[#a3e635] border border-[#a3e635]/30">
                <span className="w-1.5 h-1.5 rounded-full bg-[#a3e635] animate-pulse" />
                Live Sync
              </span>
            </h1>
            <p className="text-[11px] sm:text-xs text-[#958ea0] mt-0.5">
              {lang === 'fa'
                ? 'ارتباط بی‌واسطه و هماهنگی راش‌ها، اصلاحات و مراحل تولید پروژه با تیم فنی استودیو'
                : 'Direct channel with RITM creative production team'}
            </p>
          </div>
        </div>

        {/* Telegram / Bale Direct Callout */}
        <div className="flex items-center gap-2 text-xs w-full sm:w-auto justify-end">
          <a
            href="https://t.me/AdvRFL"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#38bdf8]/10 hover:bg-[#38bdf8]/20 text-[#38bdf8] border border-[#38bdf8]/30 transition-all font-mono text-[11px]"
            title="پی‌وی تلگرام مدیریت جهت ارسال راش و فوتیج‌های سنگین"
          >
            <Send className="w-3 h-3" />
            <span>تلگرام: @AdvRFL</span>
          </a>

          <a
            href="https://ble.ir/AdvRFL"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#a3e635]/10 hover:bg-[#a3e635]/20 text-[#a3e635] border border-[#a3e635]/30 transition-all font-mono text-[11px]"
            title="پی‌وی پیام‌رسان بله مدیریت"
          >
            <span>بله: @AdvRFL</span>
          </a>
        </div>
      </div>

      {/* Mobile Tab Switcher (Visible on small screens) */}
      <div className="lg:hidden flex mb-3 p-1 rounded-xl bg-black/40 border border-white/10 text-xs">
        <button
          type="button"
          onClick={() => setMobileView('chat')}
          className={`flex-1 py-2 rounded-lg font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            mobileView === 'chat'
              ? 'bg-[#d0bcff] text-[#131313] shadow-md'
              : 'text-[#958ea0] hover:text-white'
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>{lang === 'fa' ? 'صفحه پیام‌ها' : 'Chat Window'}</span>
        </button>
        <button
          type="button"
          onClick={() => setMobileView('list')}
          className={`flex-1 py-2 rounded-lg font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            mobileView === 'list'
              ? 'bg-[#d0bcff] text-[#131313] shadow-md'
              : 'text-[#958ea0] hover:text-white'
          }`}
        >
          <Film className="w-3.5 h-3.5" />
          <span>{isAdmin ? (lang === 'fa' ? 'لیست چت‌ها' : 'Conversations') : (lang === 'fa' ? 'انتخاب پروژه' : 'Projects')}</span>
          {isAdmin && conversations.some((c) => c.unreadCount > 0) && (
            <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
          )}
        </button>
      </div>

      {/* Main Chat Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 h-[620px] max-h-[calc(100vh-210px)] min-h-[500px]">
        {/* SIDEBAR: Admin conversations list OR Client project selector */}
        <div
          className={`lg:col-span-4 glass-panel rounded-2xl border border-white/10 p-3.5 sm:p-4 flex flex-col h-full overflow-hidden ${
            mobileView === 'list' ? 'flex' : 'hidden lg:flex'
          }`}
        >
          {isAdmin ? (
            <>
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/10">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Shield className="w-4 h-4 text-[#d0bcff]" />
                  <span>گفتگوهای فعال کارفرمایان</span>
                </span>
                <button
                  onClick={fetchConversations}
                  className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-[#958ea0] hover:text-white transition-colors cursor-pointer"
                  title="بروزرسانی گفتگوها"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                {/* General Inquiry Room */}
                <button
                  onClick={() => {
                    setSelectedOrderCode('RITM-GENERAL');
                    setMobileView('chat');
                  }}
                  className={`w-full text-right p-3 rounded-xl transition-all border cursor-pointer ${
                    selectedOrderCode === 'RITM-GENERAL'
                      ? 'bg-[#d0bcff]/15 border-[#d0bcff]/40 shadow-sm'
                      : 'bg-white/[0.03] hover:bg-white/[0.06] border-white/5'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="text-xs font-bold text-[#d0bcff] flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>مشاوره و پشتیبانی عمومی</span>
                    </span>
                    <span className="text-[10px] text-[#958ea0] font-mono">همگانی</span>
                  </div>
                  <p className="text-[11px] text-[#958ea0] truncate">
                    پیام‌ها و مشاوره‌های قبل از ثبت سفارش کاربران و بازدیدکنندگان
                  </p>
                </button>

                {conversations.length === 0 ? (
                  <div className="py-12 text-center text-xs text-[#958ea0]">
                    هنوز گفتگوی اختصاصی ثبت نشده است.
                  </div>
                ) : (
                  conversations.map((conv) => (
                    <button
                      key={conv.orderCode}
                      onClick={() => {
                        setSelectedOrderCode(conv.orderCode);
                        setMobileView('chat');
                      }}
                      className={`w-full text-right p-3 rounded-xl transition-all border cursor-pointer ${
                        selectedOrderCode === conv.orderCode
                          ? 'bg-[#d0bcff]/15 border-[#d0bcff]/40 shadow-sm'
                          : 'bg-white/[0.03] hover:bg-white/[0.06] border-white/5'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className="text-xs font-bold text-white truncate">
                          {conv.clientName}
                        </span>
                        {conv.unreadCount > 0 && (
                          <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-[#d0bcff] text-[#131313]">
                            {conv.unreadCount} جدید
                          </span>
                        )}
                      </div>
                      <div className="flex items-center justify-between text-[10.5px] text-[#958ea0] font-mono mb-1">
                        <span>{conv.orderCode}</span>
                        <span>{new Date(conv.lastMessageTime).toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <p className="text-[11px] text-[#b8b3c4] truncate leading-tight">
                        {conv.lastMessage}
                      </p>
                    </button>
                  ))
                )}
              </div>
            </>
          ) : (
            <>
              {/* Client Sidebar: Project Selection */}
              <div className="pb-3 mb-3 border-b border-white/10">
                <span className="text-xs font-bold text-white flex items-center gap-1.5 mb-1">
                  <Film className="w-4 h-4 text-[#d0bcff]" />
                  <span>انتخاب موضوع گفتگو</span>
                </span>
                <p className="text-[11px] text-[#958ea0] leading-relaxed">
                  می‌توانید پیام خود را به یک پروژه خاص اختصاص دهید یا با پشتیبانی عمومی صحبت کنید.
                </p>
              </div>

              {/* Selector */}
              <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                <button
                  onClick={() => {
                    setSelectedOrderCode('RITM-GENERAL');
                    setSelectedClientOrder(null);
                    setMobileView('chat');
                  }}
                  className={`w-full text-right p-3 rounded-xl border transition-all cursor-pointer ${
                    selectedOrderCode === 'RITM-GENERAL'
                      ? 'bg-[#d0bcff]/15 border-[#d0bcff]/40 text-white shadow-sm'
                      : 'bg-white/[0.03] hover:bg-white/[0.06] border-white/5 text-[#958ea0]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold">مشاوره عمومی و هماهنگی سفارش</span>
                    {selectedOrderCode === 'RITM-GENERAL' && <Check className="w-3.5 h-3.5 text-[#d0bcff]" />}
                  </div>
                  <span className="text-[10px] text-[#958ea0] block mt-0.5">پاسخگویی آنلاین و آنی کارشناسان</span>
                </button>

                {userOrders.map((ord) => (
                  <button
                    key={ord.id}
                    onClick={() => {
                      setSelectedOrderCode(ord.order_code);
                      setSelectedClientOrder(ord);
                      setMobileView('chat');
                    }}
                    className={`w-full text-right p-3 rounded-xl border transition-all cursor-pointer ${
                      selectedOrderCode === ord.order_code
                        ? 'bg-[#d0bcff]/15 border-[#d0bcff]/40 text-white shadow-sm'
                        : 'bg-white/[0.03] hover:bg-white/[0.06] border-white/5 text-[#958ea0]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold font-mono text-[#d0bcff]">{ord.order_code}</span>
                      {selectedOrderCode === ord.order_code && <Check className="w-3.5 h-3.5 text-[#d0bcff]" />}
                    </div>
                    <span className="text-[11px] text-white block mt-0.5 truncate">
                      {ord.project_type === 'video' ? 'تدوین تیزر ویدیویی 🎬' : ord.project_type === 'web' ? 'طراحی وب‌سایت 💻' : 'اپلیکیشن 📱'}
                    </span>
                    <div className="flex items-center justify-between text-[10px] text-[#958ea0] mt-1 font-mono">
                      <span>بودجه: {ord.budget || 'توافقی'}</span>
                      <span>{new Date(ord.created_at).toLocaleDateString('fa-IR')}</span>
                    </div>
                  </button>
                ))}
              </div>

              {/* Guest Profile Details Accordion */}
              {!currentUser && (
                <div className="mt-3 p-3 rounded-xl bg-white/[0.03] border border-white/10 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-white flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-[#d0bcff]" />
                      <span>مشخصات فرستنده پیام</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowGuestDetails(!showGuestDetails)}
                      className="text-[10px] text-[#d0bcff] hover:underline cursor-pointer"
                    >
                      {showGuestDetails ? 'بستن' : 'تغییر نام'}
                    </button>
                  </div>

                  {showGuestDetails ? (
                    <div className="space-y-1.5 pt-1 text-xs">
                      <input
                        type="text"
                        value={guestName}
                        onChange={(e) => setGuestName(e.target.value)}
                        placeholder="نام شما / برند..."
                        className="w-full bg-black/40 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white outline-none"
                      />
                      <input
                        type="text"
                        value={guestContact}
                        onChange={(e) => setGuestContact(e.target.value)}
                        placeholder="شماره تماس یا آیدی تلگرام..."
                        className="w-full bg-black/40 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white outline-none font-mono dir-ltr text-left"
                      />
                    </div>
                  ) : (
                    <p className="text-[10px] text-[#958ea0]">
                      {guestName ? `ارسال با نام: ${guestName}` : 'شما در حال ارسال پیام به عنوان مهمان هستید.'}
                    </p>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* CHAT WINDOW: Header, Messages & Input */}
        <div
          className={`lg:col-span-8 glass-panel rounded-2xl border border-white/10 flex flex-col h-full overflow-hidden ${
            mobileView === 'chat' ? 'flex' : 'hidden lg:flex'
          }`}
        >
          {/* Active Conversation Header */}
          <div className="p-3 sm:p-4 border-b border-white/10 bg-white/[0.02] flex items-center justify-between">
            <div className="flex items-center gap-2.5 sm:gap-3">
              {/* Back to list button on mobile */}
              <button
                type="button"
                onClick={() => setMobileView('list')}
                className="lg:hidden p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white cursor-pointer"
                title="بازگشت به لیست گفتگوها"
              >
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[#d0bcff]/20 text-[#d0bcff] flex items-center justify-center font-bold text-xs border border-[#d0bcff]/30 shrink-0">
                {isAdmin ? <User className="w-4 h-4" /> : <Shield className="w-4 h-4" />}
              </div>

              <div>
                <h3 className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
                  <span>
                    {isAdmin
                      ? selectedOrderCode === 'RITM-GENERAL'
                        ? 'گفتگوی عمومی و مشاوره با کاربران'
                        : `پروژه کارفرما: ${selectedOrderCode}`
                      : selectedOrderCode === 'RITM-GENERAL'
                      ? 'پشتیبانی آنلاین استودیو ریتم'
                      : `گفتگو درباره پروژه ${selectedOrderCode}`}
                  </span>
                  <span className="w-2 h-2 rounded-full bg-[#a3e635] shadow-[0_0_8px_#a3e635]" />
                </h3>
                <span className="text-[10px] sm:text-[11px] text-[#958ea0] block">
                  {isAdmin
                    ? 'پاسخ شما مستقیماً در پنل کاربر ثبت خواهد شد'
                    : 'پاسخگویی سریع کارشناسان تدوین و طراحی ریتم'}
                </span>
              </div>
            </div>

            <button
              onClick={() => fetchMessages(false)}
              className="p-1.5 sm:p-2 rounded-xl bg-white/5 hover:bg-white/10 text-[#958ea0] hover:text-white transition-colors cursor-pointer"
              title="بارگذاری مجدد پیام‌ها"
            >
              <RefreshCw className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
          </div>

          {/* Quick Prompt Chips (For Clients) */}
          {!isAdmin && (
            <div className="px-3 py-2 bg-black/30 border-b border-white/5 flex items-center gap-2 overflow-x-auto no-scrollbar">
              <span className="text-[10px] text-[#958ea0] shrink-0 font-medium">سوالات متداول:</span>
              {quickPrompts.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(q.text)}
                  className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-[#d0bcff]/15 hover:text-[#d0bcff] text-[11px] text-[#e5e2e1] border border-white/10 transition-colors shrink-0 cursor-pointer"
                >
                  {q.label}
                </button>
              ))}
            </div>
          )}

          {/* Messages Scroll Area */}
          <div
            ref={chatScrollContainerRef}
            onScroll={handleScrollChat}
            className="flex-1 p-3.5 sm:p-5 overflow-y-auto space-y-3.5 custom-scrollbar bg-black/25"
          >
            {loading ? (
              <div className="h-full flex items-center justify-center text-xs text-[#958ea0]">
                <span className="w-5 h-5 border-2 border-[#d0bcff] border-t-transparent rounded-full animate-spin inline-block ml-2" />
                <span>در حال بارگذاری پیام‌ها...</span>
              </div>
            ) : messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-[#958ea0]">
                <MessageSquare className="w-10 h-10 text-white/20 mb-2" />
                <p className="text-xs">پیامی در این گفتگو ثبت نشده است. اولین پیام را ارسال کنید!</p>
              </div>
            ) : (
              messages.map((msg) => {
                const isMe = isAdmin ? msg.senderRole === 'admin' : msg.senderRole === 'client';
                const isStudio = msg.senderRole === 'admin';

                return (
                  <div
                    key={msg.id}
                    id={msg.id}
                    className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} transition-all duration-200 group/msg`}
                  >
                    <div className="flex items-center gap-1.5 mb-1 px-1">
                      <span className="text-[10.5px] font-bold text-[#b8b3c4]">
                        {isStudio ? 'استودیو ریتم' : msg.clientName}
                      </span>
                      {isStudio && (
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-[#d0bcff]/20 text-[#d0bcff] border border-[#d0bcff]/30">
                          تیم ریتم
                        </span>
                      )}
                      <span className="text-[9.5px] text-[#71717a] font-mono dir-ltr">
                        {new Date(msg.createdAt).toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <div
                      onDoubleClick={() => {
                        setReplyingTo(msg);
                        chatInputRef.current?.focus();
                      }}
                      className={`max-w-[85%] sm:max-w-[75%] p-3 sm:p-3.5 rounded-2xl text-xs leading-relaxed text-right relative shadow-md group ${
                        isMe
                          ? 'bg-gradient-to-br from-[#d0bcff]/20 to-[#3c0091]/30 text-white border border-[#d0bcff]/30 rounded-tr-none'
                          : 'bg-white/[0.06] text-[#e5e2e1] border border-white/10 rounded-tl-none'
                      }`}
                    >
                      {/* Quoted Reply Block */}
                      {msg.replyTo && (
                        <div
                          onClick={() => {
                            const targetEl = document.getElementById(msg.replyTo!.id);
                            if (targetEl) {
                              targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
                              targetEl.classList.add('ring-2', 'ring-[#d0bcff]', 'rounded-2xl', 'p-1', 'transition-all');
                              setTimeout(() => {
                                targetEl.classList.remove('ring-2', 'ring-[#d0bcff]', 'p-1');
                              }, 1800);
                            }
                          }}
                          className="mb-2 p-2 rounded-xl bg-black/50 border-r-4 border-[#d0bcff] text-[10.5px] text-[#b8b3c4] text-right cursor-pointer hover:bg-black/70 transition-all select-none"
                          title="کلیک برای پرش به پیام اصلی ریپلای شده"
                        >
                          <div className="flex items-center gap-1 font-bold text-[#d0bcff] text-[10px] mb-0.5">
                            <Reply className="w-3 h-3 text-[#d0bcff]" />
                            <span>{msg.replyTo.senderRole === 'admin' ? 'استودیو ریتم' : msg.replyTo.clientName}</span>
                          </div>
                          <p className="truncate line-clamp-1 opacity-90 text-[10.5px]">{msg.replyTo.text}</p>
                        </div>
                      )}

                      <p className="whitespace-pre-wrap select-text">{msg.text}</p>

                      <div className="flex items-center justify-between gap-2 mt-1.5 pt-1 border-t border-white/5 text-[9px] text-white/40">
                        {/* Reply Action Button */}
                        <button
                          type="button"
                          onClick={() => {
                            setReplyingTo(msg);
                            chatInputRef.current?.focus();
                          }}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10.5px] text-[#adc6ff] hover:text-white bg-white/[0.06] hover:bg-[#d0bcff]/20 transition-all cursor-pointer font-medium active:scale-95"
                          title="پاسخ به این پیام (ریپلای)"
                        >
                          <Reply className="w-3 h-3 text-[#d0bcff]" />
                          <span>پاسخ</span>
                        </button>

                        <div className="flex items-center gap-1">
                          {isMe && (
                            <CheckCheck className="w-3 h-3 text-[#a3e635]" />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quoted Replying Banner */}
          {replyingTo && (
            <div className="px-3.5 py-2 bg-[#d0bcff]/10 border-t border-[#d0bcff]/20 flex items-center justify-between gap-2 text-xs animate-slide-up">
              <div className="flex items-center gap-2 truncate">
                <Reply className="w-3.5 h-3.5 text-[#d0bcff] shrink-0" />
                <span className="text-[#d0bcff] font-bold text-[11px] shrink-0">
                  پاسخ به {replyingTo.senderRole === 'admin' ? 'استودیو ریتم' : replyingTo.clientName}:
                </span>
                <span className="text-[#b8b3c4] text-[11px] truncate">
                  {replyingTo.text}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setReplyingTo(null)}
                className="p-1 rounded-lg hover:bg-white/10 text-[#958ea0] hover:text-white transition-colors cursor-pointer shrink-0"
                title="لغو پاسخ"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Chat Input Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-2.5 sm:p-3 bg-white/[0.02] border-t border-white/10 flex items-center gap-2"
          >
            <input
              ref={chatInputRef}
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={
                replyingTo
                  ? `پاسخ شما به ${replyingTo.senderRole === 'admin' ? 'استودیو ریتم' : replyingTo.clientName}...`
                  : lang === 'fa'
                  ? 'پیام خود را بنویسید (Enter جهت ارسال)...'
                  : 'Type your message about the project...'
              }
              className="flex-1 bg-black/40 border border-white/10 focus:border-[#d0bcff] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-[#71717a] focus:outline-none transition-colors"
            />

            <button
              type="submit"
              disabled={isSending || !inputText.trim()}
              className="px-4 py-2.5 rounded-xl bg-[#d0bcff] hover:bg-[#d0bcff]/90 text-[#131313] font-bold text-xs flex items-center gap-1.5 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-md cursor-pointer shrink-0"
            >
              {isSending ? (
                <span className="w-3.5 h-3.5 border-2 border-[#131313] border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>{lang === 'fa' ? 'ارسال' : 'Send'}</span>
                  <Send className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
