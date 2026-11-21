import React from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { BookOpen, Sparkles, Star } from 'lucide-react';
import { ScreenId } from '../types/rafiq';
import { toArabicDigits } from '../data/learningData';

interface RafiqDailyQuotaCardProps {
  remaining: number;
  total: number;
  onNavigate?: (screen: ScreenId) => void;
}

interface QuotaTheme {
  stateLabel: string;
  barClass: string;
  ringStroke: string;
  cardBorderClass: string;
  cardGradientClass: string;
  pillClass: string;
  dotActiveClass: string;
}

function getQuotaTheme(remaining: number): QuotaTheme {
  if (remaining >= 6) {
    return {
      stateLabel: 'رصيد وافر اليوم',
      barClass: 'bg-gradient-to-l from-[#4CAF50] to-[#66BB6A]',
      ringStroke: '#4CAF50',
      cardBorderClass: 'border-[#4A90E2]/35',
      cardGradientClass: 'from-[#EFF6FF] via-[#FFFFFF] to-[#F0FDF4]',
      pillClass: 'bg-[#ECFDF5] border-[#86EFAC] text-[#166534]',
      dotActiveClass: 'bg-[#4CAF50] text-white shadow-[0_2px_8px_rgba(76,175,80,0.3)]',
    };
  }

  if (remaining >= 3) {
    return {
      stateLabel: 'اقتربت من نصف الرصيد',
      barClass: 'bg-gradient-to-l from-[#F59E0B] to-[#FBBF24]',
      ringStroke: '#F59E0B',
      cardBorderClass: 'border-[#F59E0B]/45',
      cardGradientClass: 'from-[#EFF6FF] via-[#FFFFFF] to-[#FFFBEB]',
      pillClass: 'bg-[#FFFBEB] border-[#FCD34D] text-[#92400E]',
      dotActiveClass: 'bg-[#F59E0B] text-white shadow-[0_2px_8px_rgba(245,158,11,0.3)]',
    };
  }

  return {
    stateLabel: remaining === 0 ? 'انتهى الرصيد اليومي' : 'أوشك الرصيد على الانتهاء',
    barClass: 'bg-gradient-to-l from-[#E5534B] to-[#F87171]',
    ringStroke: '#E5534B',
    cardBorderClass: 'border-[#E5534B]/45',
    cardGradientClass: 'from-[#EFF6FF] via-[#FFFFFF] to-[#FEF2F2]',
    pillClass: 'bg-[#FEF2F2] border-[#FCA5A5] text-[#991B1B]',
    dotActiveClass: 'bg-[#E5534B] text-white shadow-[0_2px_8px_rgba(229,83,75,0.3)]',
  };
}

export const RafiqDailyQuotaCard: React.FC<RafiqDailyQuotaCardProps> = ({
  remaining,
  total,
  onNavigate,
}) => {
  const safeRemaining = Math.max(0, Math.min(total, remaining));
  const progressPercent = Math.round((safeRemaining / total) * 100);
  const theme = getQuotaTheme(safeRemaining);

  const ringRadius = 30;
  const ringCircumference = 2 * Math.PI * ringRadius;
  const ringDashOffset = ringCircumference * (1 - safeRemaining / total);

  const warningBanner =
    safeRemaining === 0
      ? {
          toneClass: 'bg-[#FEF2F2] border-[#FCA5A5] text-[#991B1B]',
          title: '🚫 لقد وصلت إلى الحد اليومي للمساعد الذكي',
          subtitle: 'يمكنك المتابعة في الدروس والاختبارات والعودة غداً.',
          showLessonsAction: true,
        }
      : safeRemaining === 1
      ? {
          toneClass: 'bg-[#FEF2F2] border-[#FCA5A5] text-[#991B1B]',
          title: '🚨 لديك آخر سؤال متبقٍ اليوم',
          subtitle: 'اختر سؤالك المفضل بعناية يا بطل!',
          showLessonsAction: false,
        }
      : safeRemaining === 3
      ? {
          toneClass: 'bg-[#FFFBEB] border-[#FCD34D] text-[#92400E]',
          title: '⚠️ لديك 3 أسئلة متبقية اليوم',
          subtitle: 'استمتع بأسئلتك القادمة مع رفيق الذكي.',
          showLessonsAction: false,
        }
      : null;

  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      aria-label="عداد الأسئلة اليومية للمساعد الذكي"
      className={`rounded-[28px] border-2 bg-gradient-to-l ${theme.cardGradientClass} ${theme.cardBorderClass} p-5 md:p-6 shadow-[0_12px_32px_rgba(74,144,226,0.12)] space-y-4`}
      dir="rtl"
    >
      {/* Top Row: Robot Emblem, Title & Radial Visual Counter */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3.5 min-w-0">
          <motion.div
            animate={{ y: [0, -3, 0] }}
            transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
            className="relative w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-[#4A90E2] text-white flex items-center justify-center shadow-[0_8px_18px_rgba(74,144,226,0.28)] shrink-0"
          >
            <span className="text-3xl md:text-[34px]" aria-hidden="true">
              🤖
            </span>
            <span className="absolute -top-1.5 -left-1.5 w-6 h-6 rounded-full bg-[#FFC107] border-2 border-white flex items-center justify-center text-[#713F12] shadow-sm">
              <Sparkles className="w-3.5 h-3.5" />
            </span>
          </motion.div>

          <div className="space-y-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-lg md:text-xl font-extrabold text-[#1E293B]">
                المساعد الذكي رفيق
              </h2>
              <span
                className={`px-2.5 py-0.5 rounded-full border text-[11px] font-extrabold ${theme.pillClass}`}
              >
                {theme.stateLabel}
              </span>
            </div>
            <p className="text-sm md:text-base font-bold text-[#4A90E2]">
              الأسئلة المتبقية اليوم
            </p>
          </div>
        </div>

        {/* Circular SVG Ring + Visual Counter */}
        <div className="relative w-[78px] h-[78px] md:w-[86px] md:h-[86px] flex items-center justify-center shrink-0">
          <svg
            className="w-full h-full -rotate-90"
            viewBox="0 0 76 76"
            aria-hidden="true"
          >
            <circle
              cx="38"
              cy="38"
              r={ringRadius}
              fill="#FFFFFF"
              stroke="#E2E8F0"
              strokeWidth="7"
            />
            <motion.circle
              cx="38"
              cy="38"
              r={ringRadius}
              fill="none"
              stroke={theme.ringStroke}
              strokeWidth="7"
              strokeLinecap="round"
              strokeDasharray={ringCircumference}
              initial={false}
              animate={{ strokeDashoffset: ringDashOffset }}
              transition={{ duration: 0.45, ease: 'easeOut' }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center leading-tight">
            <span
              dir="ltr"
              className="text-base md:text-lg font-extrabold text-[#1E293B] tabular-nums"
            >
              {safeRemaining} / {total}
            </span>
          </div>
        </div>
      </div>

      {/* Tactile Star Energy Tokens (10 visual units) */}
      <div
        className="grid grid-cols-10 gap-1.5 bg-white/85 border border-[#E2E8F0] rounded-2xl p-2.5"
        aria-hidden="true"
      >
        {Array.from({ length: total }).map((_, idx) => {
          const active = idx < safeRemaining;
          return (
            <motion.div
              key={idx}
              initial={false}
              animate={{ scale: active ? 1 : 0.9, opacity: active ? 1 : 0.45 }}
              transition={{ duration: 0.25 }}
              className={`h-7 md:h-8 rounded-xl flex items-center justify-center transition-colors ${
                active ? theme.dotActiveClass : 'bg-[#F1F5F9] text-[#94A3B8]'
              }`}
            >
              <Star className={`w-3.5 h-3.5 md:w-4 md:h-4 ${active ? 'fill-current' : ''}`} />
            </motion.div>
          );
        })}
      </div>

      {/* Smooth Animated Progress Bar */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs font-bold text-[#64748B]">
          <span>الرصيد اليومي</span>
          <span className="tabular-nums text-[#1E293B]">
            متبقي {toArabicDigits(safeRemaining)} من {toArabicDigits(total)} أسئلة
          </span>
        </div>
        <div className="w-full h-4 rounded-full bg-[#E2E8F0] p-0.5 overflow-hidden">
          <motion.div
            initial={false}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.45, ease: 'easeOut' }}
            className={`h-full rounded-full ${theme.barClass}`}
          />
        </div>
      </div>

      {/* Threshold Warnings (3 left, 1 left, or Limit Reached) */}
      <AnimatePresence mode="wait">
        {warningBanner && (
          <motion.div
            key={warningBanner.title}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.25 }}
            role="status"
            className={`rounded-2xl border-[1.5px] p-4 space-y-2 text-right ${warningBanner.toneClass}`}
          >
            <p className="text-sm md:text-base font-extrabold">{warningBanner.title}</p>
            <p className="text-xs md:text-sm font-semibold opacity-90">{warningBanner.subtitle}</p>
            {warningBanner.showLessonsAction && onNavigate && (
              <button
                type="button"
                onClick={() => onNavigate('lessons')}
                className="min-h-[42px] px-5 py-2 rounded-full bg-[#4A90E2] hover:bg-[#3B7FD0] text-white text-xs md:text-sm font-bold inline-flex items-center gap-2 transition-colors rafiq-button-shadow"
              >
                <BookOpen className="w-4 h-4" />
                <span>الذهاب إلى الدروس والاختبارات</span>
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  );
};
