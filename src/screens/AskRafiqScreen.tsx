import React, { useEffect, useRef, useState } from 'react';
import {
  AlertCircle,
  ArrowLeft,
  Award,
  BookOpen,
  Mic,
  MicOff,
  RotateCcw,
  Send,
  Sparkles,
  Volume2,
  Wifi,
  WifiOff,
} from 'lucide-react';
import { ChatMessage, ModuleKey, ScreenId } from '../types/rafiq';
import { SUGGESTED_RAFIQ_QUESTIONS } from '../data/rafiqExtensionsData';
import { toArabicDigits } from '../data/learningData';
import { askRafiqAssistant } from '../services/rafiqAiService';
import { RafiqCompanionAvatar } from '../components/Illustrations';
import { RafiqDailyQuotaCard } from '../components/RafiqDailyQuotaCard';
import { playGentleTap, playSuccessChime, playTryAgainNote, speakArabic } from '../utils/audio';

interface AskRafiqScreenProps {
  soundEnabled: boolean;
  aiQuestionsAsked: number;
  onAwardAskStars: (amount: number) => void;
  onNavigate?: (screen: ScreenId) => void;
  isOnline?: boolean;
}

const MODULE_SCREEN_META: Record<ModuleKey, { label: string; screen: ScreenId }> = {
  colors: { label: 'درس الألوان', screen: 'colors-learn' },
  shapes: { label: 'درس الأشكال', screen: 'shapes-learn' },
  numbers: { label: 'درس الأرقام', screen: 'numbers-learn' },
  emotions: { label: 'درس المشاعر', screen: 'emotions-learn' },
};

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: 'welcome-greeting',
    sender: 'rafiq',
    text: 'أهلاً بك يا بطل! 💙 أنا رفيق، صديقك الذكي. يمكنك أن تسألني أي سؤال يخطر في بالك مثل: "كم عدد أيام الأسبوع؟" أو أي شيء تحب معرفته!',
    timestamp: 'الآن',
  },
];

const DAILY_AI_LIMIT = 10;
const DAILY_LIMIT_STORAGE_KEY = 'rafiq_ai_daily_limit_v1';

function getLocalDateKey(date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getMsUntilNextMidnight(): number {
  const now = new Date();
  const nextMidnight = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() + 1,
    0,
    0,
    1,
    0
  );
  return Math.max(1000, nextMidnight.getTime() - now.getTime());
}

function loadRemainingQuestions(): number {
  const todayKey = getLocalDateKey();
  if (typeof window === 'undefined') return DAILY_AI_LIMIT;

  try {
    const raw = localStorage.getItem(DAILY_LIMIT_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as { dateKey?: string; remaining?: number };
      if (parsed.dateKey === todayKey && typeof parsed.remaining === 'number') {
        return Math.max(0, Math.min(DAILY_AI_LIMIT, Math.floor(parsed.remaining)));
      }
    }
    localStorage.setItem(
      DAILY_LIMIT_STORAGE_KEY,
      JSON.stringify({ dateKey: todayKey, remaining: DAILY_AI_LIMIT })
    );
  } catch {
    // Ignore localStorage errors
  }
  return DAILY_AI_LIMIT;
}

function saveRemainingQuestions(remaining: number): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(
      DAILY_LIMIT_STORAGE_KEY,
      JSON.stringify({
        dateKey: getLocalDateKey(),
        remaining: Math.max(0, Math.min(DAILY_AI_LIMIT, remaining)),
      })
    );
  } catch {
    // Ignore localStorage errors
  }
}

interface SpeechRecognitionResultEventLike {
  results: {
    [index: number]: {
      [index: number]: {
        transcript: string;
      };
    };
  };
}

interface SpeechRecognitionLike {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  start: () => void;
  stop: () => void;
  onresult: ((event: SpeechRecognitionResultEventLike) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
}

export const AskRafiqScreen: React.FC<AskRafiqScreenProps> = ({
  soundEnabled,
  aiQuestionsAsked,
  onAwardAskStars,
  onNavigate,
  isOnline = true,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceHint, setVoiceHint] = useState<string | null>(null);
  const [lastFailedQuestion, setLastFailedQuestion] = useState<string | null>(null);
  const [remainingQuestions, setRemainingQuestions] = useState<number>(() =>
    loadRemainingQuestions()
  );
  const chatEndRef = useRef<HTMLDivElement | null>(null);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const lastSentAtRef = useRef<number>(0);

  const isLimitReached = remainingQuestions <= 0;

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [messages, isThinking]);

  // Automatically reset counter at midnight and re-sync when returning to tab
  useEffect(() => {
    let midnightTimer: number | undefined;

    const scheduleMidnightReset = () => {
      const refreshed = loadRemainingQuestions();
      setRemainingQuestions(refreshed);
      midnightTimer = window.setTimeout(() => {
        saveRemainingQuestions(DAILY_AI_LIMIT);
        setRemainingQuestions(DAILY_AI_LIMIT);
        scheduleMidnightReset();
      }, getMsUntilNextMidnight());
    };

    const handleVisibilityOrFocus = () => {
      setRemainingQuestions(loadRemainingQuestions());
    };

    scheduleMidnightReset();
    window.addEventListener('focus', handleVisibilityOrFocus);
    document.addEventListener('visibilitychange', handleVisibilityOrFocus);

    return () => {
      if (midnightTimer) window.clearTimeout(midnightTimer);
      window.removeEventListener('focus', handleVisibilityOrFocus);
      document.removeEventListener('visibilitychange', handleVisibilityOrFocus);
    };
  }, []);

  const handleSend = async (rawText?: string, isRetry = false) => {
    const questionText = (rawText ?? input).trim();
    if (!questionText || isThinking || remainingQuestions <= 0) return;

    const now = Date.now();
    if (!isRetry && now - lastSentAtRef.current < 700) {
      return;
    }
    lastSentAtRef.current = now;

    playGentleTap(soundEnabled);
    if (!rawText) {
      setInput('');
    }
    setVoiceHint(null);
    setLastFailedQuestion(null);

    const baseMessages = isRetry
      ? messages.filter((m) => !m.isError)
      : [
          ...messages,
          {
            id: `child-${Date.now()}`,
            sender: 'child' as const,
            text: questionText,
            timestamp: 'الآن',
          },
        ];

    setMessages(baseMessages);
    setIsThinking(true);

    try {
      const reply = await askRafiqAssistant(questionText, isOnline);
      const rafiqMsg: ChatMessage = {
        id: `rafiq-${Date.now()}`,
        sender: 'rafiq',
        text: reply.text,
        timestamp: 'الآن',
        visualCards: reply.visualCards,
        recommendedModule: reply.recommendedModule,
        isOfflineNotice: reply.isOfflineNotice,
      };
      setMessages((prev) => [...prev, rafiqMsg]);
      if (reply.usedGemini) {
        setRemainingQuestions((prev) => {
          const next = Math.max(0, prev - 1);
          saveRemainingQuestions(next);
          return next;
        });
      }
      if (!reply.isOfflineNotice) {
        onAwardAskStars(3);
        playSuccessChime(soundEnabled);
      } else {
        playGentleTap(soundEnabled);
      }
    } catch (err: unknown) {
      const errorText =
        err instanceof Error
          ? err.message
          : 'تعذر الحصول على إجابة الآن، يرجى المحاولة مرة أخرى.';
      setLastFailedQuestion(questionText);
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          sender: 'rafiq',
          text: errorText,
          timestamp: 'الآن',
          isError: true,
        },
      ]);
      playTryAgainNote(soundEnabled);
    } finally {
      setIsThinking(false);
    }
  };

  const handleVoiceToggle = () => {
    playGentleTap(soundEnabled);
    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
      return;
    }

    const win = window as unknown as {
      SpeechRecognition?: new () => SpeechRecognitionLike;
      webkitSpeechRecognition?: new () => SpeechRecognitionLike;
    };
    const SpeechRec = win.SpeechRecognition || win.webkitSpeechRecognition;

    if (!SpeechRec) {
      setVoiceHint('التعرف الصوتي غير مدعوم في هذا المتصفح، يمكنك كتابة سؤالك أو اختيار سؤال مقترح.');
      return;
    }

    try {
      const recognition = new SpeechRec();
      recognition.lang = 'ar-SA';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onresult = (event) => {
        const transcript = event.results?.[0]?.[0]?.transcript?.trim();
        if (transcript) {
          setInput(transcript);
          setVoiceHint('تم التقاط صوتك بنجاح! اضغط على "اسأل رفيق" للإرسال.');
        }
      };

      recognition.onerror = () => {
        setIsListening(false);
        setVoiceHint('تعذر سماع الصوت بوضوح، يمكنك كتابة سؤالك هنا.');
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      setIsListening(true);
      setVoiceHint('أستمع إليك الآن... تحدث بهدوء.');
      recognition.start();
    } catch {
      setIsListening(false);
      setVoiceHint('يمكنك كتابة سؤالك في الصندوق بالأسفل.');
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-5" dir="rtl">
      <RafiqDailyQuotaCard
        remaining={remainingQuestions}
        total={DAILY_AI_LIMIT}
        onNavigate={onNavigate}
      />

      {/* Intro Companion Hero Card */}
      <section className="rafiq-card p-6 text-center space-y-4">
        <div className="flex justify-center">
          <RafiqCompanionAvatar size={104} />
        </div>

        <div className="space-y-1.5">
          <h2 className="text-[24px] md:text-[26px] font-extrabold text-[#1E293B]">
            أنا رفيق، صديقك الذكي!
          </h2>
          <p className="text-base text-[#64748B] font-medium max-w-md mx-auto">
            اسألني أي سؤال يخطر في بالك وسأجيبك بكل حب وبساطة 💙
          </p>
        </div>

        <div className="flex flex-wrap justify-center items-center gap-2.5">
          <button
            type="button"
            onClick={() => {
              playGentleTap(soundEnabled);
              speakArabic(
                'أهلاً يا بطل! أنا رفيق صديقك الذكي. اسألني أي سؤال تحبه وسأجيبك بكل حب وبساطة.',
                true
              );
            }}
            className="min-h-[46px] px-6 py-2.5 rounded-full bg-[#EFF6FF] hover:bg-[#DBEAFE] border border-[#BFDBFE] text-[#1D4ED8] text-sm font-bold inline-flex items-center gap-2 transition-colors active:scale-[0.98]"
          >
            <Volume2 className="w-4 h-4" />
            <span>استمع للمقدمة</span>
          </button>

          <div
            className={`min-h-[40px] px-4 py-1.5 rounded-full border text-xs font-bold inline-flex items-center gap-1.5 ${
              isOnline
                ? 'bg-[#F0FDF4] border-[#BBF7D0] text-[#166534]'
                : 'bg-[#FFFBEB] border-[#FDE68A] text-[#92400E]'
            }`}
          >
            {isOnline ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
            <span>
              {isOnline
                ? 'متصل بالإنترنت · ذكاء Gemini'
                : 'المساعد الذكي يحتاج إلى اتصال بالإنترنت.'}
            </span>
          </div>
        </div>
      </section>

      {/* Explorer Star Reward Banner */}
      <section className="rounded-3xl bg-[#FEF9C3] border-[1.5px] border-[#FDE047] px-5 py-4 flex items-center justify-between gap-4 shadow-sm">
        <div className="space-y-0.5">
          <div className="text-base md:text-lg font-extrabold text-[#713F12]">
            بطل مستكشف! ⭐ +{toArabicDigits(3)} نجوم لكل سؤال
          </div>
          <div className="text-sm font-semibold text-[#854D0E]">
            {aiQuestionsAsked > 0
              ? `رائع! سألت ${toArabicDigits(aiQuestionsAsked)} ${
                  aiQuestionsAsked === 1 ? 'سؤال' : 'أسئلة'
                } ذكية حتى الآن`
              : 'اسأل رفيق سؤالاً رائعاً لتحصل على نجوم إضافية اليوم!'}
          </div>
        </div>
        <div className="w-12 h-12 rounded-2xl bg-[#FFFBEB] border border-[#FDE68A] flex items-center justify-center text-[#D97706] shrink-0">
          <Award className="w-6 h-6" />
        </div>
      </section>

      {/* Chat Conversation Area */}
      <section className="space-y-4" dir="rtl" aria-label="محادثة رفيق">
        {messages.map((msg) =>
          msg.sender === 'child' ? (
            <div key={msg.id} className="flex flex-col items-start gap-1">
              <div className="max-w-[85%] rounded-3xl rounded-tr-lg bg-[#1D70B8] text-white px-5 py-3.5 shadow-sm text-right">
                <p dir="rtl" className="text-base md:text-lg font-bold leading-relaxed">
                  {msg.text}
                </p>
              </div>
              <span className="text-xs font-semibold text-[#64748B] px-2">{msg.timestamp}</span>
            </div>
          ) : msg.isOfflineNotice ? (
            <div key={msg.id} className="flex flex-col items-end gap-1">
              <div className="w-full max-w-[92%] rounded-3xl border-[1.5px] border-[#FDE68A] bg-[#FFFBEB] p-5 space-y-3 text-right">
                <div className="flex items-start gap-3">
                  <WifiOff className="w-6 h-6 text-[#D97706] shrink-0 mt-0.5" />
                  <p dir="rtl" className="text-base font-bold text-[#92400E] leading-relaxed">
                    {msg.text}
                  </p>
                </div>
                {onNavigate && (
                  <button
                    type="button"
                    onClick={() => onNavigate('lessons')}
                    className="min-h-[44px] px-5 py-2 rounded-full bg-[#4A90E2] hover:bg-[#3B7FD0] text-white text-sm font-bold inline-flex items-center gap-2 transition-colors"
                  >
                    <BookOpen className="w-4 h-4" />
                    <span>الذهاب إلى الدروس والاختبارات</span>
                  </button>
                )}
              </div>
            </div>
          ) : msg.isError ? (
            <div key={msg.id} className="flex flex-col items-end gap-1">
              <div className="w-full max-w-[92%] rounded-3xl border-[1.5px] border-[#FDBA74] bg-[#FFF7ED] p-5 space-y-3 text-right">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-6 h-6 text-[#EA580C] shrink-0 mt-0.5" />
                  <p dir="rtl" className="text-base font-bold text-[#9A3412] leading-relaxed">
                    {msg.text}
                  </p>
                </div>
                {lastFailedQuestion && (
                  <button
                    type="button"
                    onClick={() => handleSend(lastFailedQuestion, true)}
                    disabled={isThinking}
                    className="min-h-[44px] px-5 py-2 rounded-full bg-[#EA580C] hover:bg-[#C2410C] text-white text-sm font-bold inline-flex items-center gap-2 transition-colors"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>إعادة المحاولة</span>
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div key={msg.id} className="flex flex-col items-end gap-1">
              <div className="w-full max-w-[92%] rafiq-card p-5 space-y-4 text-right">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#EFF6FF] border border-[#BFDBFE] flex items-center justify-center text-[#4A90E2] shrink-0">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <p
                    dir="rtl"
                    className="text-base md:text-lg font-semibold text-[#1E293B] leading-relaxed whitespace-pre-line flex-1 text-right"
                  >
                    {msg.text}
                  </p>
                </div>

                {msg.visualCards && msg.visualCards.length > 0 && (
                  <div className="grid grid-cols-2 gap-3">
                    {msg.visualCards.map((card, idx) => (
                      <div
                        key={`${msg.id}-card-${idx}`}
                        style={{ backgroundColor: card.bg }}
                        className="rounded-2xl border border-[#E2E8F0] p-3.5 flex flex-col items-center justify-center gap-1.5 text-center"
                      >
                        <span className="text-3xl" aria-hidden="true">
                          {card.emoji}
                        </span>
                        <span className="text-sm font-bold text-[#1E293B]">{card.label}</span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-2.5">
                  <button
                    type="button"
                    onClick={() => {
                      playGentleTap(soundEnabled);
                      speakArabic(msg.text, true);
                    }}
                    className="flex-1 min-h-[46px] px-4 py-2.5 rounded-full bg-[#EFF6FF] hover:bg-[#DBEAFE] border border-[#BFDBFE] text-[#1D4ED8] text-sm md:text-base font-bold inline-flex items-center justify-center gap-2 transition-colors active:scale-[0.98]"
                  >
                    <Volume2 className="w-4 h-4" />
                    <span>استمع للإجابة بصوت رفيق</span>
                  </button>

                  {msg.recommendedModule && onNavigate && (
                    <button
                      type="button"
                      onClick={() =>
                        onNavigate(MODULE_SCREEN_META[msg.recommendedModule!].screen)
                      }
                      className="min-h-[46px] px-5 py-2.5 rounded-full bg-[#F0FDF4] hover:bg-[#DCFCE7] border border-[#BBF7D0] text-[#166534] text-sm font-bold inline-flex items-center justify-center gap-2 transition-colors active:scale-[0.98]"
                    >
                      <BookOpen className="w-4 h-4" />
                      <span>افتح {MODULE_SCREEN_META[msg.recommendedModule].label}</span>
                    </button>
                  )}
                </div>
              </div>
              <span className="text-xs font-semibold text-[#64748B] px-2">
                رفيق · المساعد الذكي
              </span>
            </div>
          )
        )}

        {isThinking && (
          <div className="flex justify-end">
            <div className="rafiq-card px-5 py-4 text-sm font-bold text-[#4A90E2]">
              رفيق يفكر في إجابة لطيفة لك...
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </section>

      {/* Suggested Questions */}
      <section className="space-y-3 pt-1">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-extrabold text-[#1E293B]">أسئلة مقترحة يحبها الأبطال:</h3>
          <span className="text-xs font-semibold text-[#64748B]">المس للسؤال</span>
        </div>

        <div className="space-y-2.5">
          {SUGGESTED_RAFIQ_QUESTIONS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => handleSend(item.question)}
              disabled={isThinking || isLimitReached}
              className="w-full min-h-[56px] px-4 py-3 rounded-2xl bg-white hover:bg-[#F8FAFC] border-[1.5px] border-[#E2E8F0] flex items-center justify-between gap-3 text-right transition-colors active:scale-[0.99] disabled:opacity-60"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl" aria-hidden="true">
                  {item.emoji}
                </span>
                <span className="text-base font-bold text-[#1E293B]">{item.question}</span>
              </div>
              <ArrowLeft className="w-5 h-5 text-[#64748B] shrink-0" />
            </button>
          ))}
        </div>
      </section>

      {/* Message Input & Send Controls */}
      <section className="rafiq-card p-4 space-y-3">
        {isLimitReached && (
          <div className="rounded-2xl bg-[#FEF2F2] border border-[#FCA5A5] px-4 py-3 text-right space-y-1">
            <p className="text-sm font-extrabold text-[#991B1B]">
              🚫 لقد وصلت إلى الحد اليومي للمساعد الذكي.
            </p>
            <p className="text-xs font-semibold text-[#7F1D1D]">
              يمكنك المتابعة في الدروس والاختبارات والعودة غداً.
            </p>
          </div>
        )}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="space-y-3"
        >
          <div className="relative flex items-center">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isLimitReached}
              placeholder={
                isLimitReached
                  ? 'تم الوصول إلى الحد اليومي، نلتقي غداً يا بطل!'
                  : 'اكتب سؤالك هنا يا بطل...'
              }
              className="w-full min-h-[54px] pr-4 pl-12 rounded-2xl border-[1.5px] border-[#CBD5E1] bg-[#F8FAFC] focus:bg-white disabled:opacity-60 text-base font-semibold text-[#1E293B] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#4A90E2]"
            />
            <button
              type="button"
              onClick={handleVoiceToggle}
              disabled={isLimitReached}
              aria-label="إدخال صوتي"
              className="absolute left-2 w-10 h-10 rounded-xl flex items-center justify-center text-[#64748B] hover:bg-[#E2E8F0]/60 disabled:opacity-50 transition-colors"
            >
              {isListening ? <MicOff className="w-5 h-5 text-[#E5534B]" /> : <Mic className="w-5 h-5" />}
            </button>
          </div>

          {voiceHint && <p className="text-xs font-semibold text-[#475569] px-1">{voiceHint}</p>}

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleVoiceToggle}
              disabled={isLimitReached}
              className={`min-h-[52px] px-5 rounded-full text-base font-bold inline-flex items-center justify-center gap-2 transition-colors active:scale-[0.97] disabled:opacity-50 shrink-0 ${
                isListening
                  ? 'bg-[#E5534B] text-white'
                  : 'bg-[#4CAF50] hover:bg-[#43A047] text-white rafiq-green-shadow'
              }`}
            >
              <Mic className="w-5 h-5" />
              <span>{isListening ? 'إيقاف' : 'تحدث'}</span>
            </button>

            <button
              type="submit"
              disabled={!input.trim() || isThinking || isLimitReached}
              className="flex-1 min-h-[52px] px-6 rounded-full bg-[#1D70B8] hover:bg-[#175B96] disabled:bg-[#94A3B8] text-white text-base md:text-lg font-bold inline-flex items-center justify-center gap-2 rafiq-button-shadow transition-colors active:scale-[0.98]"
            >
              <Send className="w-5 h-5" />
              <span>اسأل رفيق</span>
            </button>
          </div>
        </form>
      </section>
    </div>
  );
};
