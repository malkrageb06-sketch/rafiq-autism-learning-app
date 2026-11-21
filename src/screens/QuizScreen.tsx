import React, { useState } from 'react';
import {
  Award,
  BookOpen,
  CheckCircle2,
  Lock,
  Play,
  Plus,
  RotateCcw,
  Sparkles,
  Star,
  Trophy,
  Volume2,
} from 'lucide-react';
import { COLORS_DATA, toArabicDigits } from '../data/learningData';
import {
  getQuestionsForModuleAndTier,
  PROGRESSIVE_QUIZZES,
  QUIZ_TIER_CONFIGS,
} from '../data/progressiveQuizzesData';
import {
  ModuleKey,
  ModuleTierProgress,
  ProgressState,
  QuizTier,
  ScreenId,
} from '../types/rafiq';
import {
  CountingObjectSvg,
  EmotionIllustration,
  ShapeIllustration,
} from '../components/Illustrations';
import { playGentleTap, playSuccessChime, playTryAgainNote, speakArabic } from '../utils/audio';

interface QuizScreenProps {
  moduleKey: ModuleKey;
  progress: ProgressState;
  onAwardStars: (amount: number) => void;
  onCompleteTier: (
    moduleKey: ModuleKey,
    tier: QuizTier,
    score: number,
    bonusStars: number
  ) => void;
  onNavigate: (screen: ScreenId) => void;
}

const MODULE_INFO: Record<
  ModuleKey,
  { title: string; badgeTitle: string; learnScreen: ScreenId }
> = {
  colors: {
    title: 'مسار الألوان التدريجي',
    badgeTitle: 'بطل الألوان',
    learnScreen: 'colors-learn',
  },
  shapes: {
    title: 'مسار الأشكال التدريجي',
    badgeTitle: 'بطل الأشكال',
    learnScreen: 'shapes-learn',
  },
  numbers: {
    title: 'مسار الأرقام التدريجي',
    badgeTitle: 'بطل الأرقام',
    learnScreen: 'numbers-learn',
  },
  emotions: {
    title: 'مسار المشاعر التدريجي',
    badgeTitle: 'بطل المشاعر',
    learnScreen: 'emotions-learn',
  },
};

export const QuizScreen: React.FC<QuizScreenProps> = ({
  moduleKey,
  progress,
  onAwardStars,
  onCompleteTier,
  onNavigate,
}) => {
  const { title, badgeTitle, learnScreen } = MODULE_INFO[moduleKey];
  const soundEnabled = progress.soundEnabled;
  const lessonCompleted = progress.completedLessons[moduleKey];
  const tierProgress: ModuleTierProgress = progress.moduleTiers?.[moduleKey] ?? {
    beginnerCompleted: progress.completedQuizzes[moduleKey],
    intermediateCompleted: false,
    advancedCompleted: false,
    bestScores: { beginner: 0, intermediate: 0, advanced: 0 },
  };

  const [activeTier, setActiveTier] = useState<QuizTier | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [status, setStatus] = useState<'idle' | 'correct' | 'wrong'>('idle');
  const [earnedInQuiz, setEarnedInQuiz] = useState(0);
  const [awardedThisQuestion, setAwardedThisQuestion] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [unlockedNextLevelTitle, setUnlockedNextLevelTitle] = useState<string | null>(null);

  const isTierUnlocked = (tier: QuizTier): boolean => {
    if (tier === 'beginner') return lessonCompleted;
    if (tier === 'intermediate') return tierProgress.beginnerCompleted;
    return tierProgress.intermediateCompleted;
  };

  const isTierCompleted = (tier: QuizTier): boolean => {
    if (tier === 'beginner') return tierProgress.beginnerCompleted;
    if (tier === 'intermediate') return tierProgress.intermediateCompleted;
    return tierProgress.advancedCompleted;
  };

  const startTier = (tier: QuizTier) => {
    if (!isTierUnlocked(tier)) {
      playTryAgainNote(soundEnabled);
      return;
    }
    playGentleTap(soundEnabled);
    setActiveTier(tier);
    setCurrentIndex(0);
    setSelectedOption(null);
    setStatus('idle');
    setEarnedInQuiz(0);
    setAwardedThisQuestion(false);
    setIsFinished(false);
    setUnlockedNextLevelTitle(null);
  };

  const totalCategoryQuestions = PROGRESSIVE_QUIZZES[moduleKey].length;
  const completedTiersCount = (['beginner', 'intermediate', 'advanced'] as QuizTier[]).filter(
    isTierCompleted
  ).length;

  // Progressive Level Hub View (prevents showing all questions at once)
  if (!activeTier) {
    const nextRecommendedTier: QuizTier | null = !lessonCompleted
      ? null
      : !tierProgress.beginnerCompleted
      ? 'beginner'
      : !tierProgress.intermediateCompleted
      ? 'intermediate'
      : !tierProgress.advancedCompleted
      ? 'advanced'
      : 'advanced';

    return (
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Category Header Summary */}
        <section className="rafiq-card p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="space-y-1">
              <h2 className="text-[24px] md:text-[28px] font-extrabold text-[#1E293B]">
                {title}
              </h2>
              <p className="text-sm md:text-base text-[#64748B] font-medium">
                تعلّم خطوة بخطوة: افتح المستويات واجمع النجوم والأوسمة ({toArabicDigits(totalCategoryQuestions)} سؤالاً متدرجاً)
              </p>
            </div>

            <div className="px-4 py-2.5 rounded-2xl bg-[#F0FDF4] border border-[#BBF7D0] text-center shrink-0">
              <div className="text-xs font-bold text-[#166534]">المستويات المنجزة</div>
              <div className="text-xl font-extrabold text-[#166534] tabular-nums">
                {toArabicDigits(completedTiersCount)} / {toArabicDigits(3)}
              </div>
            </div>
          </div>

          {nextRecommendedTier ? (
            <button
              type="button"
              onClick={() => startTier(nextRecommendedTier)}
              className="w-full min-h-[56px] px-6 py-3 rounded-full bg-[#4A90E2] hover:bg-[#3B7FD0] text-white text-base md:text-lg font-extrabold inline-flex items-center justify-center gap-2 rafiq-button-shadow transition-colors active:scale-[0.98]"
            >
              <Play className="w-5 h-5 fill-white" />
              <span>
                {completedTiersCount === 3
                  ? 'مراجعة التحدي المتقدم'
                  : `متابعة: ${
                      QUIZ_TIER_CONFIGS.find((c) => c.tier === nextRecommendedTier)?.title
                    }`}
              </span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => onNavigate(learnScreen)}
              className="w-full min-h-[56px] px-6 py-3 rounded-full bg-[#4CAF50] hover:bg-[#43A047] text-white text-base md:text-lg font-extrabold inline-flex items-center justify-center gap-2 rafiq-green-shadow transition-colors active:scale-[0.98]"
            >
              <BookOpen className="w-5 h-5" />
              <span>تعلّم الدرس المصور أولاً لفتح المستوى ١</span>
            </button>
          )}
        </section>

        {/* Step 0: Learn Lesson Card */}
        <section className="space-y-4" aria-label="مستويات التعلم التدريجية">
          <div
            className={`rafiq-card p-5 flex items-center justify-between gap-4 ${
              lessonCompleted ? 'border-[#BBF7D0] bg-[#F0FDF4]/60' : 'border-[#93C5FD] bg-[#EFF6FF]'
            }`}
          >
            <div className="flex items-center gap-3.5">
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                  lessonCompleted ? 'bg-[#4CAF50] text-white' : 'bg-[#4A90E2] text-white'
                }`}
              >
                {lessonCompleted ? (
                  <CheckCircle2 className="w-6 h-6" />
                ) : (
                  <BookOpen className="w-6 h-6" />
                )}
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-[#1E293B]">الخطوة الأساسية: الدرس المصور</h3>
                <p className="text-sm font-medium text-[#475569]">
                  {lessonCompleted
                    ? 'تم استكشاف الدرس وفتح المستوى الأول بنجاح'
                    : 'تعرّف على البطاقات المصورة أولاً لفتح الاختبار الأول'}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onNavigate(learnScreen)}
              className="min-h-[44px] px-5 rounded-full bg-white border border-[#CBD5E1] hover:bg-[#F8FAFC] text-[#1E293B] text-sm font-bold shrink-0"
            >
              {lessonCompleted ? 'مراجعة الدرس' : 'افتح الدرس'}
            </button>
          </div>

          {/* Progressive Tier Cards (Level 1 -> Level 2 -> Advanced Challenge) */}
          {QUIZ_TIER_CONFIGS.map((config) => {
            const unlocked = isTierUnlocked(config.tier);
            const completed = isTierCompleted(config.tier);
            const tierQuestionsCount = getQuestionsForModuleAndTier(moduleKey, config.tier).length;

            return (
              <div
                key={config.tier}
                style={{
                  backgroundColor: unlocked ? '#FFFFFF' : '#F8FAFC',
                  borderColor: completed ? '#86EFAC' : unlocked ? config.borderColor : '#E2E8F0',
                }}
                className={`rounded-3xl border-2 p-5 md:p-6 shadow-[0_8px_24px_rgba(30,41,59,0.05)] space-y-4 ${
                  !unlocked ? 'opacity-90' : ''
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3.5">
                    <div
                      className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0"
                      style={{
                        backgroundColor: unlocked ? config.softBg : '#E2E8F0',
                        color: unlocked ? config.accentColor : '#64748B',
                      }}
                    >
                      {!unlocked ? (
                        <Lock className="w-7 h-7" />
                      ) : completed ? (
                        <Trophy className="w-7 h-7" />
                      ) : (
                        <Sparkles className="w-7 h-7" />
                      )}
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-lg md:text-xl font-extrabold text-[#1E293B]">
                          {config.title}
                        </h3>
                        {completed && (
                          <span className="inline-flex items-center gap-1 text-xs font-extrabold text-[#166534] bg-[#DCFCE7] px-2.5 py-1 rounded-full">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>مكتمل</span>
                          </span>
                        )}
                        {!unlocked && (
                          <span className="inline-flex items-center gap-1 text-xs font-extrabold text-[#64748B] bg-[#E2E8F0] px-2.5 py-1 rounded-full">
                            <Lock className="w-3.5 h-3.5" />
                            <span>مغلق</span>
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-[#64748B] font-medium">{config.subtitle}</p>
                      <p className="text-xs font-bold text-[#475569] tabular-nums">
                        {toArabicDigits(tierQuestionsCount)} أسئلة · +{toArabicDigits(config.starsPerQuestion)} نجوم لكل إجابة + {toArabicDigits(config.completionBonusStars)} نجمة مكافأة
                      </p>
                    </div>
                  </div>
                </div>

                {unlocked ? (
                  <button
                    type="button"
                    onClick={() => startTier(config.tier)}
                    style={{
                      backgroundColor: completed ? '#F1F5F9' : config.accentColor,
                      color: completed ? '#1E293B' : '#FFFFFF',
                    }}
                    className="w-full min-h-[52px] px-6 py-3 rounded-full text-base font-extrabold inline-flex items-center justify-center gap-2 transition-transform active:scale-[0.98]"
                  >
                    {completed ? <RotateCcw className="w-4 h-4" /> : <Play className="w-4 h-4 fill-white" />}
                    <span>{completed ? 'إعادة هذا المستوى' : `ابدأ ${config.title}`}</span>
                  </button>
                ) : (
                  <div className="rounded-2xl bg-[#F1F5F9] border border-[#E2E8F0] px-4 py-3 flex items-center justify-center gap-2 text-sm font-bold text-[#64748B]">
                    <Lock className="w-4 h-4 shrink-0" />
                    <span>
                      {config.tier === 'beginner'
                        ? 'أكمل الدرس المصور أعلاه لفتح هذا المستوى'
                        : config.tier === 'intermediate'
                        ? 'أكمل المستوى الأول لفتح المستوى الثاني'
                        : 'أكمل المستوى الثاني لفتح التحديات المتقدمة'}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </section>
      </div>
    );
  }

  // Active Tier Quiz Flow
  const tierConfig = QUIZ_TIER_CONFIGS.find((c) => c.tier === activeTier)!;
  const questions = getQuestionsForModuleAndTier(moduleKey, activeTier);
  const currentQuestion = questions[currentIndex];
  const progressPercent = Math.round(
    ((currentIndex + (status === 'correct' ? 1 : 0)) / questions.length) * 100
  );

  const handleAnswer = (optionId: string) => {
    if (status === 'correct') return;

    setSelectedOption(optionId);
    if (optionId === currentQuestion.correctId) {
      setStatus('correct');
      playSuccessChime(soundEnabled);
      if (!awardedThisQuestion) {
        setAwardedThisQuestion(true);
        setEarnedInQuiz((prev) => prev + tierConfig.starsPerQuestion);
        onAwardStars(tierConfig.starsPerQuestion);
      }
    } else {
      setStatus('wrong');
      playTryAgainNote(soundEnabled);
    }
  };

  const handleNext = () => {
    playGentleTap(soundEnabled);
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOption(null);
      setStatus('idle');
      setAwardedThisQuestion(false);
    } else {
      const wasBeginnerDone = tierProgress.beginnerCompleted;
      const wasIntermediateDone = tierProgress.intermediateCompleted;

      let newlyUnlocked: string | null = null;
      if (activeTier === 'beginner' && !wasBeginnerDone) {
        newlyUnlocked = 'المستوى الثاني: متوسط';
      } else if (activeTier === 'intermediate' && !wasIntermediateDone) {
        newlyUnlocked = 'المستوى الثالث: التحديات المتقدمة';
      }

      setUnlockedNextLevelTitle(newlyUnlocked);
      onCompleteTier(
        moduleKey,
        activeTier,
        earnedInQuiz + tierConfig.completionBonusStars,
        tierConfig.completionBonusStars
      );
      setIsFinished(true);
      playSuccessChime(soundEnabled);
    }
  };

  if (isFinished) {
    const totalEarnedWithBonus = earnedInQuiz + tierConfig.completionBonusStars;
    const nextTier: QuizTier | null =
      activeTier === 'beginner'
        ? 'intermediate'
        : activeTier === 'intermediate'
        ? 'advanced'
        : null;

    return (
      <div className="max-w-2xl mx-auto rafiq-card p-7 md:p-10 text-center space-y-6">
        <div className="w-24 h-24 rounded-full bg-[#FEF9C3] border-2 border-[#FDE047] flex items-center justify-center mx-auto">
          <Award className="w-12 h-12 text-[#CA8A04]" />
        </div>

        {unlockedNextLevelTitle ? (
          <div className="rounded-3xl bg-[#EFF6FF] border-2 border-[#93C5FD] p-5 space-y-1.5">
            <h2 className="text-[26px] md:text-[30px] font-extrabold text-[#1E3A8A]">
              🎉 أحسنت!
            </h2>
            <p className="text-xl md:text-2xl font-extrabold text-[#1D4ED8]">
              لقد فتحت مستوى جديداً
            </p>
            <p className="text-sm md:text-base font-bold text-[#475569]">
              تم فتح: {unlockedNextLevelTitle}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            <h2 className="text-[26px] md:text-[32px] font-extrabold text-[#1E293B]">
              🎉 أحسنت! أتممت {tierConfig.title}
            </h2>
            <p className="text-base md:text-lg text-[#64748B] font-medium">
              {activeTier === 'advanced'
                ? `رائع! أتقنت تحديات ${badgeTitle} وحصلت على وسام الإتقان!`
                : 'عمل رائع ومميز! لقد أضفنا النجوم والمكافآت إلى رصيدك.'}
            </p>
          </div>
        )}

        <div className="flex flex-wrap items-center justify-center gap-3">
          <div className="inline-flex items-center gap-2.5 px-5 py-3.5 rounded-2xl bg-[#F0FDF4] border border-[#BBF7D0]">
            <Star className="w-6 h-6 fill-[#FFC107] text-[#D97706]" />
            <span className="text-xl font-extrabold text-[#166534] tabular-nums">
              +{toArabicDigits(totalEarnedWithBonus)} نجمة (تشمل مكافأة المستوى)
            </span>
          </div>

          <div className="inline-flex items-center gap-2 px-4 py-3.5 rounded-2xl bg-[#FEFCE8] border border-[#FDE68A]">
            <Trophy className="w-5 h-5 text-[#D97706]" />
            <span className="text-base font-extrabold text-[#854D0E]">
              وسام: {badgeTitle}
            </span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          {nextTier && (
            <button
              type="button"
              onClick={() => startTier(nextTier)}
              className="w-full sm:w-auto min-h-[58px] px-8 py-3.5 rounded-full bg-[#4CAF50] hover:bg-[#43A047] text-white text-lg font-extrabold rafiq-green-shadow transition-all active:scale-[0.97]"
            >
              ابدأ المستوى التالي الآن
            </button>
          )}

          <button
            type="button"
            onClick={() => setActiveTier(null)}
            className="w-full sm:w-auto min-h-[58px] px-8 py-3.5 rounded-full bg-[#4A90E2] hover:bg-[#3B7FD0] text-white text-lg font-bold rafiq-button-shadow transition-all active:scale-[0.97]"
          >
            مسار المستويات
          </button>

          <button
            type="button"
            onClick={() => onNavigate('achievements')}
            className="w-full sm:w-auto min-h-[56px] px-6 py-3 rounded-full bg-[#F1F5F9] hover:bg-[#E2E8F0] text-[#1E293B] text-base font-bold transition-colors"
          >
            عرض الأوسمة
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Progress Header */}
      <div className="rafiq-card p-5 space-y-3">
        <div className="flex items-center justify-between gap-4 text-sm md:text-base font-bold text-[#64748B]">
          <span>
            {tierConfig.title} · السؤال {toArabicDigits(currentIndex + 1)} من{' '}
            {toArabicDigits(questions.length)}
          </span>
          <button
            type="button"
            onClick={() => setActiveTier(null)}
            className="text-[#4A90E2] hover:underline font-bold min-h-[40px] px-2"
          >
            قائمة المستويات
          </button>
        </div>

        <div className="w-full h-3 bg-[#E2E8F0] rounded-full overflow-hidden">
          <div
            className="h-full bg-[#4CAF50] rounded-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Question Card */}
      <div className="rafiq-card p-6 md:p-8 text-center space-y-6">
        <div className="flex flex-col items-center gap-3">
          {currentQuestion.visualPromptEmoji && (
            <div className="w-20 h-20 rounded-3xl bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-center text-5xl">
              <span aria-hidden="true">{currentQuestion.visualPromptEmoji}</span>
            </div>
          )}

          <h2 className="text-[24px] md:text-[28px] font-extrabold text-[#1E293B] text-balance">
            {currentQuestion.prompt}
          </h2>

          <button
            type="button"
            onClick={() => speakArabic(currentQuestion.prompt, true)}
            className="min-h-[44px] px-4 py-2 rounded-full bg-[#EFF6FF] hover:bg-[#DBEAFE] text-[#1E40AF] text-sm font-bold inline-flex items-center gap-2 transition-colors"
          >
            <Volume2 className="w-4 h-4" />
            <span>استمع للسؤال</span>
          </button>
        </div>

        {/* Visual Counting Tray (supports single count & visual addition for advanced numbers) */}
        {currentQuestion.countingDisplay && (
          <div className="flex flex-wrap items-center justify-center gap-3">
            <div className="bg-[#F8FAFC] border-[1.5px] border-[#E2E8F0] rounded-3xl p-4 md:p-5 inline-flex flex-wrap items-center justify-center gap-3">
              {Array.from({ length: currentQuestion.countingDisplay.count }).map((_, idx) => (
                <div
                  key={`primary-${idx}`}
                  className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-white border border-[#E2E8F0] flex items-center justify-center shadow-sm"
                >
                  <CountingObjectSvg type={currentQuestion.countingDisplay!.objectType} size={44} />
                </div>
              ))}
            </div>

            {currentQuestion.secondaryCountingDisplay && (
              <>
                <div className="w-11 h-11 rounded-full bg-[#EFF6FF] border border-[#BFDBFE] text-[#1D4ED8] flex items-center justify-center">
                  <Plus className="w-6 h-6" />
                </div>
                <div className="bg-[#F8FAFC] border-[1.5px] border-[#E2E8F0] rounded-3xl p-4 md:p-5 inline-flex flex-wrap items-center justify-center gap-3">
                  {Array.from({ length: currentQuestion.secondaryCountingDisplay.count }).map(
                    (_, idx) => (
                      <div
                        key={`sec-${idx}`}
                        className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-white border border-[#E2E8F0] flex items-center justify-center shadow-sm"
                      >
                        <CountingObjectSvg
                          type={currentQuestion.secondaryCountingDisplay!.objectType}
                          size={44}
                        />
                      </div>
                    )
                  )}
                </div>
              </>
            )}
          </div>
        )}

        {/* Answer Options Grid */}
        <div className="grid grid-cols-2 gap-4 md:gap-5 pt-2">
          {currentQuestion.options.map((opt) => {
            const isSelected = selectedOption === opt.id;
            const isCorrectCard = status === 'correct' && opt.id === currentQuestion.correctId;
            const isWrongCard = status === 'wrong' && isSelected;

            const colorObj =
              opt.visualType === 'color' || (moduleKey === 'colors' && !opt.visualType)
                ? COLORS_DATA.find((c) => c.id === opt.id)
                : undefined;
            const swatchHex = opt.colorHex ?? colorObj?.hex;

            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => handleAnswer(opt.id)}
                className={`min-h-[132px] md:min-h-[152px] rounded-3xl border-2 p-5 flex flex-col items-center justify-center gap-3 transition-all duration-200 active:scale-[0.97] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4A90E2] ${
                  isCorrectCard
                    ? 'bg-[#F0FDF4] border-[#66BB6A] ring-4 ring-[#66BB6A]/25'
                    : isWrongCard
                    ? 'bg-[#FFF7ED] border-[#FFA726]'
                    : 'bg-white border-[#E2E8F0] hover:border-[#4A90E2] hover:bg-[#F8FAFC]'
                }`}
              >
                {swatchHex && (
                  <div
                    className="w-16 h-16 md:w-20 md:h-20 rounded-full border-4 border-white shadow-md"
                    style={{ backgroundColor: swatchHex }}
                    aria-hidden="true"
                  />
                )}

                {opt.visualType === 'shape' && (
                  <ShapeIllustration
                    shapeId={opt.id as 'circle' | 'square' | 'triangle' | 'rectangle'}
                    size={76}
                  />
                )}

                {opt.visualType === 'number' && (
                  <span className="text-4xl md:text-5xl font-extrabold text-[#4A90E2] tabular-nums">
                    {opt.label}
                  </span>
                )}

                {opt.visualType === 'emotion' && (
                  <EmotionIllustration
                    emotionId={opt.id as 'happy' | 'sad' | 'worried' | 'tired'}
                    size={84}
                  />
                )}

                {opt.visualType === 'emoji' && opt.emoji && (
                  <span className="text-5xl" aria-hidden="true">
                    {opt.emoji}
                  </span>
                )}

                {opt.visualType !== 'number' && (
                  <span className="text-lg md:text-xl font-extrabold text-[#1E293B]">
                    {opt.label}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Calm Feedback Area */}
        {status === 'correct' && (
          <div
            role="status"
            className="p-5 rounded-3xl bg-[#F0FDF4] border-2 border-[#66BB6A] flex flex-col sm:flex-row items-center justify-between gap-4 transition-all duration-200"
          >
            <div className="flex items-center gap-3 text-right">
              <CheckCircle2 className="w-8 h-8 text-[#4CAF50] shrink-0" />
              <div>
                <div className="text-xl font-extrabold text-[#166534]">✅ أحسنت!</div>
                <div className="text-base font-bold text-[#15803D] tabular-nums">
                  +{toArabicDigits(tierConfig.starsPerQuestion)} نجوم أضيفت لرصيدك
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleNext}
              className="w-full sm:w-auto min-h-[56px] px-8 py-3 rounded-full bg-[#4CAF50] hover:bg-[#43A047] text-white text-lg font-bold rafiq-green-shadow transition-all duration-200 active:scale-[0.97]"
            >
              {currentIndex + 1 < questions.length ? 'السؤال التالي' : 'إنهاء المستوى'}
            </button>
          </div>
        )}

        {status === 'wrong' && (
          <div
            role="status"
            className="p-4 rounded-2xl bg-[#FFF7ED] border-2 border-[#FFA726] text-[#9A3412] text-lg font-bold"
          >
            حاول مرة أخرى · يمكنك اختيار بطاقة أخرى بهدوء
          </div>
        )}
      </div>
    </div>
  );
};
