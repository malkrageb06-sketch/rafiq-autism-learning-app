import React, { useState } from 'react';
import {
  Award,
  CheckCircle2,
  Gift,
  Hash,
  Lock,
  Palette,
  Play,
  Shapes,
  Smile,
  Sparkles,
  Star,
  Trophy,
  Volume2,
} from 'lucide-react';
import { ProgressState, ScreenId } from '../types/rafiq';
import {
  computeExtendedBadges,
  computeUserXpAndLevel,
  LEVEL_STAGES,
} from '../data/rafiqExtensionsData';
import { toArabicDigits } from '../data/learningData';
import { LevelHeroEmblem } from '../components/Illustrations';
import { playGentleTap, playSuccessChime, speakArabic } from '../utils/audio';

interface AchievementsScreenProps {
  progress: ProgressState;
  onClaimDailyReward: (amount: number, dateKey: string) => void;
  onNavigate: (screen: ScreenId) => void;
}

function getTodayDateKey(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(
    now.getDate()
  ).padStart(2, '0')}`;
}

export const AchievementsScreen: React.FC<AchievementsScreenProps> = ({
  progress,
  onClaimDailyReward,
  onNavigate,
}) => {
  const [celebrating, setCelebrating] = useState(false);

  const todayKey = getTodayDateKey();
  const alreadyClaimedToday = progress.dailyRewardClaimedDate === todayKey;

  const { xp, currentStage, stagePercent, remainingToNext } = computeUserXpAndLevel(progress);
  const badges = computeExtendedBadges(progress);
  const unlockedCount = badges.filter((b) => b.unlocked).length;

  const handleCelebrateAndClaim = () => {
    playSuccessChime(progress.soundEnabled);
    setCelebrating(true);
    if (!alreadyClaimedToday) {
      onClaimDailyReward(10, todayKey);
    }
    setTimeout(() => setCelebrating(false), 3200);
  };

  const renderBadgeIcon = (
    type: 'learner' | 'colors' | 'shapes' | 'numbers' | 'emotions' | 'star',
    unlocked: boolean,
    accentColor: string
  ) => {
    const colorClass = unlocked ? 'text-white' : 'text-[#94A3B8]';
    const bg = unlocked ? accentColor : '#E2E8F0';
    return (
      <div
        className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0"
        style={{ backgroundColor: bg }}
      >
        {type === 'colors' && <Palette className={`w-7 h-7 ${colorClass}`} />}
        {type === 'shapes' && <Shapes className={`w-7 h-7 ${colorClass}`} />}
        {type === 'numbers' && <Hash className={`w-7 h-7 ${colorClass}`} />}
        {type === 'emotions' && <Smile className={`w-7 h-7 ${colorClass}`} />}
        {type === 'learner' && <Trophy className={`w-7 h-7 ${colorClass}`} />}
        {type === 'star' && <Sparkles className={`w-7 h-7 ${colorClass}`} />}
      </div>
    );
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Hero Level Card */}
      <section className="rafiq-card p-6 text-center space-y-4">
        <div className="relative inline-flex items-center justify-center">
          <LevelHeroEmblem size={108} />
          <button
            type="button"
            onClick={() => {
              playGentleTap(progress.soundEnabled);
              speakArabic(
                `أنت الآن في ${currentStage.badgeLabel}، ${currentStage.title}. ${currentStage.subtitle}`,
                progress.soundEnabled
              );
            }}
            aria-label="استمع لمستواك الحالي"
            className="absolute -bottom-1 -left-2 w-10 h-10 rounded-full bg-white border border-[#E2E8F0] shadow-sm text-[#475569] flex items-center justify-center hover:bg-[#F8FAFC]"
          >
            <Volume2 className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-1.5">
          <span className="inline-block px-4 py-1 rounded-full bg-[#EFF6FF] border border-[#BFDBFE] text-[#1D4ED8] text-xs font-extrabold">
            {currentStage.badgeLabel}
          </span>
          <h2 className="text-[24px] md:text-[28px] font-extrabold text-[#1E293B]">
            ⭐ {currentStage.title}
          </h2>
          <p className="text-sm md:text-base font-medium text-[#64748B]">{currentStage.subtitle}</p>
        </div>

        {/* XP Progress Bar */}
        <div className="rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] p-4 space-y-2.5 text-right">
          <div className="flex items-center justify-between text-sm font-extrabold tabular-nums">
            <span className="text-[#1E293B]">
              {toArabicDigits(xp)} / {toArabicDigits(currentStage.nextXp)} نقطة
            </span>
            <span className="text-[#166534]">التقدم: {toArabicDigits(stagePercent)}٪</span>
          </div>

          <div className="w-full h-3.5 bg-[#E2E8F0] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#4CAF50] rounded-full transition-all duration-300"
              style={{ width: `${stagePercent}%` }}
            />
          </div>

          <p className="text-xs font-semibold text-[#64748B] text-center tabular-nums">
            {remainingToNext > 0
              ? `متبقي ${toArabicDigits(remainingToNext)} نقطة للوصول إلى المستوى التالي ✨`
              : 'مذهل! وصلت إلى أعلى مستوى في مسار الأبطال 🌟'}
          </p>
        </div>
      </section>

      {/* Learning Journey Level Path */}
      <section className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-lg md:text-xl font-extrabold text-[#1E293B]">مسار الأبطال التعليمي</h3>
          <span className="text-xs font-bold text-[#166534] bg-[#DCFCE7] px-3 py-1 rounded-full tabular-nums">
            {toArabicDigits(LEVEL_STAGES.length)} مراحل
          </span>
        </div>

        <div className="space-y-2.5">
          {LEVEL_STAGES.map((stage) => {
            const isPassed = xp >= stage.nextXp;
            const isCurrent = stage.level === currentStage.level;
            const isLocked = !isPassed && !isCurrent;

            return (
              <div
                key={stage.level}
                className={`rounded-2xl border-[1.5px] p-4 flex items-center justify-between gap-3 transition-colors ${
                  isCurrent
                    ? 'bg-[#EFF6FF] border-[#93C5FD]'
                    : isPassed
                    ? 'bg-white border-[#BBF7D0]'
                    : 'bg-[#F8FAFC] border-[#E2E8F0]'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                      isPassed
                        ? 'bg-[#4CAF50] text-white'
                        : isCurrent
                        ? 'bg-[#1D70B8] text-white'
                        : 'bg-[#E2E8F0] text-[#94A3B8]'
                    }`}
                  >
                    {isPassed ? (
                      <CheckCircle2 className="w-5 h-5" />
                    ) : isCurrent ? (
                      <Play className="w-4 h-4 fill-white" />
                    ) : (
                      <Lock className="w-4 h-4" />
                    )}
                  </div>

                  <div className="min-w-0">
                    <div className="text-sm md:text-base font-extrabold text-[#1E293B] truncate">
                      {toArabicDigits(stage.level)}. {stage.title}{' '}
                      {isCurrent && <span className="text-[#1D70B8]">(أنت هنا)</span>}
                    </div>
                    <div className="text-xs text-[#64748B] font-medium truncate">
                      {stage.subtitle}
                    </div>
                  </div>
                </div>

                <div className="text-left shrink-0 tabular-nums">
                  {isPassed ? (
                    <span className="text-xs font-extrabold text-[#166534]">١٠٠٪ مكتمل</span>
                  ) : isCurrent ? (
                    <span className="text-xs font-extrabold text-[#1D70B8]">
                      {toArabicDigits(stagePercent)}٪ نشط
                    </span>
                  ) : (
                    <span className="text-xs font-bold text-[#94A3B8]">
                      {toArabicDigits(stage.minXp)} نقطة
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Badges & Achievements Grid */}
      <section className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-lg md:text-xl font-extrabold text-[#1E293B]">
            لوحة الأوسمة والإنجازات
          </h3>
          <span className="text-xs font-bold text-[#854D0E] bg-[#FEF9C3] px-3 py-1 rounded-full tabular-nums">
            {toArabicDigits(unlockedCount)} أوسمة مفتوحة
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {badges.map((badge) => {
            const isFullWidth = badge.id === 'star-of-week';
            return (
              <div
                key={badge.id}
                className={`rafiq-card p-5 flex ${
                  isFullWidth ? 'sm:col-span-2 flex-row items-center' : 'flex-col items-center text-center'
                } gap-3.5 ${badge.unlocked ? 'border-[#FDE68A]' : 'opacity-90 bg-[#F8FAFC]'}`}
              >
                {renderBadgeIcon(badge.iconType, badge.unlocked, badge.accentColor)}

                <div className={`space-y-1 flex-1 ${isFullWidth ? 'text-right' : ''}`}>
                  <h4 className="text-base md:text-lg font-extrabold text-[#1E293B]">
                    {badge.title}
                  </h4>
                  <p className="text-xs md:text-sm text-[#64748B] font-medium">
                    {badge.description}
                  </p>
                  <div className="pt-1">
                    <span
                      className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${
                        badge.unlocked
                          ? 'bg-[#FEF9C3] text-[#854D0E]'
                          : 'bg-[#F1F5F9] text-[#64748B]'
                      }`}
                    >
                      {badge.unlocked ? <Award className="w-3.5 h-3.5" /> : <Lock className="w-3 h-3" />}
                      <span>{badge.requirementText}</span>
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Unlockable Learning Challenges Overview */}
      <section className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-lg md:text-xl font-extrabold text-[#1E293B]">
            تحديات المستويات المتدرجة
          </h3>
          <span className="text-xs font-bold text-[#1D4ED8] bg-[#EFF6FF] px-3 py-1 rounded-full">
            افتح المستويات خطوة بخطوة
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {[
            { key: 'colors' as const, label: 'الألوان', quizScreen: 'colors-quiz' as ScreenId, color: '#E5534B' },
            { key: 'shapes' as const, label: 'الأشكال', quizScreen: 'shapes-quiz' as ScreenId, color: '#4A90E2' },
            { key: 'numbers' as const, label: 'الأرقام', quizScreen: 'numbers-quiz' as ScreenId, color: '#4CAF50' },
            { key: 'emotions' as const, label: 'المشاعر', quizScreen: 'emotions-quiz' as ScreenId, color: '#D97706' },
          ].map((cat) => {
            const tierData = progress.moduleTiers?.[cat.key];
            const lessonOpen = progress.completedLessons[cat.key];
            const lvl1Done = tierData?.beginnerCompleted || progress.completedQuizzes[cat.key];
            const lvl2Done = tierData?.intermediateCompleted;
            const lvl3Done = tierData?.advancedCompleted;

            return (
              <button
                key={cat.key}
                type="button"
                onClick={() => onNavigate(cat.quizScreen)}
                className="rafiq-card p-4 text-right space-y-3 hover:border-[#93C5FD] transition-colors"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-base font-extrabold text-[#1E293B]">تحديات {cat.label}</span>
                  <span className="text-xs font-bold text-[#4A90E2]">فتح المسار ←</span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center text-xs font-bold">
                  <div
                    className={`rounded-xl py-2 px-1 flex flex-col items-center gap-1 ${
                      lvl1Done
                        ? 'bg-[#DCFCE7] text-[#166534]'
                        : lessonOpen
                        ? 'bg-[#EFF6FF] text-[#1D4ED8]'
                        : 'bg-[#F1F5F9] text-[#64748B]'
                    }`}
                  >
                    {lvl1Done ? (
                      <CheckCircle2 className="w-4 h-4" />
                    ) : lessonOpen ? (
                      <Play className="w-4 h-4" />
                    ) : (
                      <Lock className="w-4 h-4" />
                    )}
                    <span>مستوى ١</span>
                  </div>

                  <div
                    className={`rounded-xl py-2 px-1 flex flex-col items-center gap-1 ${
                      lvl2Done
                        ? 'bg-[#DCFCE7] text-[#166534]'
                        : lvl1Done
                        ? 'bg-[#EFF6FF] text-[#1D4ED8]'
                        : 'bg-[#F1F5F9] text-[#64748B]'
                    }`}
                  >
                    {lvl2Done ? (
                      <CheckCircle2 className="w-4 h-4" />
                    ) : lvl1Done ? (
                      <Play className="w-4 h-4" />
                    ) : (
                      <Lock className="w-4 h-4" />
                    )}
                    <span>مستوى ٢</span>
                  </div>

                  <div
                    className={`rounded-xl py-2 px-1 flex flex-col items-center gap-1 ${
                      lvl3Done
                        ? 'bg-[#FEF9C3] text-[#854D0E]'
                        : lvl2Done
                        ? 'bg-[#EFF6FF] text-[#1D4ED8]'
                        : 'bg-[#F1F5F9] text-[#64748B]'
                    }`}
                  >
                    {lvl3Done ? (
                      <Star className="w-4 h-4 fill-[#FFC107] text-[#D97706]" />
                    ) : lvl2Done ? (
                      <Play className="w-4 h-4" />
                    ) : (
                      <Lock className="w-4 h-4" />
                    )}
                    <span>متقدم</span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Joyful Daily Celebration Card */}
      <section className="rafiq-card p-6 text-center space-y-4">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-[#DCFCE7] text-[#16A34A] flex items-center justify-center">
          <Gift className="w-8 h-8" />
        </div>

        <div className="space-y-1.5">
          <h3 className="text-xl font-extrabold text-[#1E293B]">احتفال رفيق المبهج 🎉</h3>
          <p className="text-sm text-[#64748B] font-medium max-w-md mx-auto">
            {alreadyClaimedToday
              ? 'لقد حصلت على مكافأة اليوم! اضغط لمشاهدة احتفال النجوم الهادئ متى شئت.'
              : 'اضغط بالأسفل لمشاهدة رقصة النجوم الهادئة وجمع مكافأتك اليومية (+١٠ نجوم)!'}
          </p>
        </div>

        {celebrating && (
          <div className="rounded-2xl bg-[#FEF9C3] border border-[#FDE047] p-4 flex items-center justify-center gap-3 transition-opacity duration-200">
            <Star className="w-6 h-6 fill-[#FFC107] text-[#D97706]" />
            <span className="text-base font-extrabold text-[#713F12]">
              أحسنت يا بطل! 🌟 استمر في التألق والتعلم الهادئ!
            </span>
            <Star className="w-6 h-6 fill-[#FFC107] text-[#D97706]" />
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            type="button"
            onClick={handleCelebrateAndClaim}
            className="w-full sm:w-auto min-h-[54px] px-8 py-3 rounded-full bg-[#15803D] hover:bg-[#166534] text-white text-base font-extrabold inline-flex items-center justify-center gap-2 rafiq-green-shadow transition-colors active:scale-[0.98]"
          >
            <Gift className="w-5 h-5" />
            <span>{alreadyClaimedToday ? 'احتفل بنجومك ✨' : 'جمع مكافأة اليوم 🎁'}</span>
          </button>

          <button
            type="button"
            onClick={() => onNavigate('lessons')}
            className="w-full sm:w-auto min-h-[54px] px-7 py-3 rounded-full bg-[#EFF6FF] hover:bg-[#DBEAFE] text-[#1D4ED8] text-base font-bold transition-colors"
          >
            متابعة الدروس
          </button>
        </div>
      </section>
    </div>
  );
};
