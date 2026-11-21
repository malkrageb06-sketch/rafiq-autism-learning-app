import React, { useState } from 'react';
import {
  Award,
  BookOpen,
  Calendar,
  CheckCircle2,
  HeartHandshake,
  Lightbulb,
  Star,
  TrendingUp,
  UserCog,
} from 'lucide-react';
import { ProgressState, ScreenId, UserAccount } from '../types/rafiq';
import { computeOverallProgress, toArabicDigits } from '../data/learningData';
import {
  buildActivitySeries,
  computeExtendedBadges,
  computeUserXpAndLevel,
  DAILY_ROUTINE_TASKS,
} from '../data/rafiqExtensionsData';
import { RoutineTaskIllustration } from '../components/Illustrations';

interface ParentDashboardScreenProps {
  user: UserAccount;
  progress: ProgressState;
  onNavigate: (screen: ScreenId) => void;
}

export const ParentDashboardScreen: React.FC<ParentDashboardScreenProps> = ({
  user,
  progress,
  onNavigate,
}) => {
  const [timeframe, setTimeframe] = useState<'week' | 'month'>('week');
  const series = buildActivitySeries(progress, timeframe);
  const [selectedDayId, setSelectedDayId] = useState<string>(series[series.length - 1].id);

  const lessonsDone = Object.values(progress.completedLessons).filter(Boolean).length;
  const quizzesDone = Object.values(progress.completedQuizzes).filter(Boolean).length;
  const routineDone = Object.values(progress.routineTasks).filter(Boolean).length;
  const overallProgress = computeOverallProgress(progress);
  const { currentStage } = computeUserXpAndLevel(progress);
  const badges = computeExtendedBadges(progress);
  const unlockedBadges = badges.filter((b) => b.unlocked);

  const activePoint = series.find((d) => d.id === selectedDayId) ?? series[series.length - 1];
  const calmnessScore = progress.calmMode
    ? Math.min(10, 8.5 + (routineDone >= 3 ? 0.5 : 0) + (quizzesDone >= 2 ? 0.5 : 0))
    : 7.5;

  const quizAverageScore = (() => {
    const scores = Object.values(progress.quizScores).filter((s) => s > 0);
    if (scores.length === 0) return 0;
    const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
    return Math.round((avg / 4) * 100);
  })();

  const nextRecommendedModule = !progress.completedQuizzes.colors
    ? 'تعلم الألوان'
    : !progress.completedQuizzes.shapes
    ? 'تعلم الأشكال'
    : !progress.completedQuizzes.numbers
    ? 'تعلم الأرقام'
    : !progress.completedQuizzes.emotions
    ? 'تعلم المشاعر'
    : 'الروتين اليومي';

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      {/* Child Summary Header Card */}
      <section className="rafiq-card p-5 md:p-6 space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-16 h-16 rounded-full bg-[#EFF6FF] border-2 border-[#BFDBFE] flex items-center justify-center text-2xl font-extrabold text-[#4A90E2] shrink-0">
              {user.name.slice(0, 1)}
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h2 className="text-xl md:text-2xl font-extrabold text-[#1E293B]">{user.name}</h2>
                <Star className="w-4 h-4 fill-[#FFC107] text-[#D97706]" />
              </div>
              <p className="text-sm text-[#64748B] font-semibold">
                الفئة العمرية: {user.ageGroup} · {currentStage.title}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onNavigate('profile')}
            aria-label="إعدادات الطفل"
            className="min-h-[44px] px-3.5 rounded-full bg-[#F1F5F9] hover:bg-[#E2E8F0] text-[#1E293B] inline-flex items-center gap-2 text-sm font-bold transition-colors shrink-0"
          >
            <UserCog className="w-4 h-4" />
            <span className="hidden sm:inline">الملف الشخصي</span>
          </button>
        </div>

        {/* Timeframe Segmented Control */}
        <div className="grid grid-cols-2 gap-1.5 p-1 bg-[#F1F5F9] rounded-2xl">
          <button
            type="button"
            onClick={() => {
              setTimeframe('week');
              setSelectedDayId('fri');
            }}
            className={`min-h-[42px] rounded-xl text-sm font-bold transition-colors ${
              timeframe === 'week'
                ? 'bg-white text-[#1E293B] shadow-sm'
                : 'text-[#64748B] hover:text-[#1E293B]'
            }`}
          >
            هذا الأسبوع
          </button>
          <button
            type="button"
            onClick={() => {
              setTimeframe('month');
              setSelectedDayId('w4');
            }}
            className={`min-h-[42px] rounded-xl text-sm font-bold transition-colors ${
              timeframe === 'month'
                ? 'bg-white text-[#1E293B] shadow-sm'
                : 'text-[#64748B] hover:text-[#1E293B]'
            }`}
          >
            هذا الشهر
          </button>
        </div>
      </section>

      {/* 4 Key Parent Metrics */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4" aria-label="إحصائيات التقدم">
        <div className="rafiq-card p-5 space-y-2">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-[#FEF9C3] text-[#D97706] flex items-center justify-center">
              <Star className="w-5 h-5 fill-[#FFC107]" />
            </div>
            <span className="text-xs font-bold text-[#166534] tabular-nums">
              +{toArabicDigits(routineDone * 5)} اليوم
            </span>
          </div>
          <div className="text-3xl font-extrabold text-[#1E293B] tabular-nums">
            {toArabicDigits(progress.stars)}
          </div>
          <div className="text-xs md:text-sm font-semibold text-[#64748B]">
            إجمالي النجوم المكتسبة
          </div>
        </div>

        <div className="rafiq-card p-5 space-y-2">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-[#EFF6FF] text-[#4A90E2] flex items-center justify-center">
              <BookOpen className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-[#64748B] tabular-nums">من أصل ٤</span>
          </div>
          <div className="text-3xl font-extrabold text-[#1E293B] tabular-nums">
            {toArabicDigits(lessonsDone)}
          </div>
          <div className="text-xs md:text-sm font-semibold text-[#64748B]">الدروس المكتملة</div>
        </div>

        <div className="rafiq-card p-5 space-y-2">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-[#DCFCE7] text-[#16A34A] flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-[#166534] tabular-nums">
              {quizAverageScore > 0 ? `${toArabicDigits(quizAverageScore)}٪ دقة` : 'جاهز'}
            </span>
          </div>
          <div className="text-3xl font-extrabold text-[#1E293B] tabular-nums">
            {toArabicDigits(quizzesDone)}
          </div>
          <div className="text-xs md:text-sm font-semibold text-[#64748B]">الاختبارات المنجزة</div>
        </div>

        <div className="rafiq-card p-5 space-y-2">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-[#F3E8FF] text-[#7C3AED] flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-[#1E40AF]">
              {overallProgress >= 75 ? 'ممتاز' : overallProgress >= 40 ? 'جيد جداً' : 'بداية موفقة'}
            </span>
          </div>
          <div className="text-3xl font-extrabold text-[#1E293B] tabular-nums">
            {toArabicDigits(overallProgress)}٪
          </div>
          <div className="text-xs md:text-sm font-semibold text-[#64748B]">نسبة الاستيعاب الكلية</div>
        </div>
      </section>

      {/* Weekly Activity Chart + Calmness Index */}
      <section className="rafiq-card p-5 md:p-6 space-y-5">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <h3 className="text-lg md:text-xl font-extrabold text-[#1E293B]">
              مخطط الإنجاز والروتين اليومي
            </h3>
            <p className="text-sm text-[#64748B] font-medium">
              معدل الالتزام عبر الأنشطة والجداول {timeframe === 'week' ? 'الأسبوعية' : 'الشهرية'}
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#EFF6FF] text-[#4A90E2] flex items-center justify-center shrink-0">
            <Calendar className="w-5 h-5" />
          </div>
        </div>

        {/* Interactive Rounded Bars */}
        <div className="rounded-3xl bg-[#F8FAFC] border border-[#E2E8F0] p-4 md:p-6 space-y-4">
          <div className="h-44 flex items-end justify-around gap-2 sm:gap-4 pt-4">
            {series.map((point) => {
              const isSelected = activePoint.id === point.id;
              return (
                <button
                  key={point.id}
                  type="button"
                  onClick={() => setSelectedDayId(point.id)}
                  className="flex-1 h-full flex flex-col items-center justify-end gap-2 group focus-visible:outline-2 focus-visible:outline-[#4A90E2] rounded-xl"
                >
                  <span className="text-[11px] font-bold text-[#64748B] tabular-nums">
                    {toArabicDigits(point.percent)}٪
                  </span>
                  <div className="w-full max-w-[34px] h-28 flex items-end justify-center">
                    <div
                      style={{ height: `${Math.max(16, point.percent)}%` }}
                      className={`w-full rounded-t-full rounded-b-lg transition-all duration-200 ${
                        isSelected
                          ? 'bg-[#4CAF50] ring-4 ring-[#4CAF50]/20'
                          : point.isToday
                          ? 'bg-[#1D70B8]'
                          : 'bg-[#4A90E2]/80 group-hover:bg-[#4A90E2]'
                      }`}
                    />
                  </div>
                  <span
                    className={`text-xs font-bold whitespace-nowrap ${
                      isSelected ? 'text-[#166534]' : 'text-[#475569]'
                    }`}
                  >
                    {point.label}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="rounded-2xl bg-white border border-[#E2E8F0] px-4 py-3 flex flex-wrap items-center justify-between gap-2 text-xs md:text-sm font-bold text-[#1E293B]">
            <span>تفاصيل {activePoint.label}:</span>
            <div className="flex flex-wrap items-center gap-3 text-[#475569] tabular-nums">
              <span>دروس: {toArabicDigits(activePoint.lessonsCount)}</span>
              <span aria-hidden="true">·</span>
              <span>مهام روتينية: {toArabicDigits(activePoint.routineCount)}</span>
              <span aria-hidden="true">·</span>
              <span className="text-[#854D0E]">+{toArabicDigits(activePoint.starsEarned)} نجمة</span>
            </div>
          </div>
        </div>

        {/* Calmness & Engagement Card */}
        <div className="rounded-2xl bg-[#DCFCE7] border border-[#BBF7D0] p-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white text-[#16A34A] flex items-center justify-center shrink-0">
              <HeartHandshake className="w-6 h-6" />
            </div>
            <div>
              <div className="text-base font-extrabold text-[#14532D]">معدل الهدوء والتفاعل</div>
              <div className="text-xs md:text-sm font-semibold text-[#166534]">
                استقرار حسي ممتاز وتشتت منخفض أثناء التعلم
              </div>
            </div>
          </div>
          <div className="text-xl md:text-2xl font-extrabold text-[#14532D] tabular-nums shrink-0" dir="ltr">
            {calmnessScore.toFixed(1)} / 10
          </div>
        </div>
      </section>

      {/* Recent Badges Summary + PECS Visual Schedule Preview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Achievement Summary */}
        <section className="rafiq-card p-5 space-y-4">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-lg font-extrabold text-[#1E293B]">
              الأوسمة المكتسبة ({toArabicDigits(unlockedBadges.length)})
            </h3>
            <button
              type="button"
              onClick={() => onNavigate('achievements')}
              className="text-sm font-bold text-[#4A90E2] hover:underline"
            >
              عرض الكل
            </button>
          </div>

          <div className="space-y-2.5">
            {badges.slice(0, 3).map((badge) => (
              <div
                key={badge.id}
                className="rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] px-4 py-3 flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0"
                    style={{ backgroundColor: badge.unlocked ? badge.accentColor : '#CBD5E1' }}
                  >
                    <Award className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-extrabold text-[#1E293B] truncate">
                      {badge.title}
                    </div>
                    <div className="text-xs text-[#64748B] font-medium truncate">
                      {badge.description}
                    </div>
                  </div>
                </div>
                <CheckCircle2
                  className={`w-5 h-5 shrink-0 ${
                    badge.unlocked ? 'text-[#4CAF50]' : 'text-[#CBD5E1]'
                  }`}
                />
              </div>
            ))}
          </div>
        </section>

        {/* PECS Routine Preview */}
        <section className="rafiq-card p-5 space-y-4">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-lg font-extrabold text-[#1E293B]">جدول الأنشطة المصورة (PECS)</h3>
            <button
              type="button"
              onClick={() => onNavigate('daily-routine')}
              className="text-sm font-bold text-[#4A90E2] hover:underline"
            >
              فتح الجدول
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {DAILY_ROUTINE_TASKS.slice(1, 3).map((task) => {
              const done = Boolean(progress.routineTasks[task.id]);
              return (
                <button
                  key={task.id}
                  type="button"
                  onClick={() => onNavigate('daily-routine')}
                  className="rounded-2xl bg-[#F8FAFC] hover:bg-[#F1F5F9] border border-[#E2E8F0] p-3.5 flex flex-col items-center gap-2.5 text-center transition-colors"
                >
                  <RoutineTaskIllustration iconType={task.iconType} size={56} />
                  <div className="space-y-0.5">
                    <div className="text-sm font-extrabold text-[#1E293B]">{task.title}</div>
                    <div
                      className={`text-xs font-bold ${
                        done ? 'text-[#166534]' : 'text-[#64748B]'
                      }`}
                    >
                      {done ? 'مكتمل ✓' : 'قيد الانتظار'}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </section>
      </div>

      {/* Smart Insight Note from Rafiq */}
      <section className="rounded-3xl bg-[#EFF6FF] border-[1.5px] border-[#BFDBFE] p-5 flex items-start gap-3.5">
        <div className="w-11 h-11 rounded-2xl bg-[#4A90E2] text-white flex items-center justify-center shrink-0">
          <Lightbulb className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <h3 className="text-base md:text-lg font-extrabold text-[#1E3A8A]">ملاحظة ذكية من رفيق</h3>
          <p className="text-sm md:text-base font-medium text-[#1E40AF] leading-relaxed">
            {overallProgress === 100
              ? `ما شاء الله! أتم ${user.name} جميع الدروس والاختبارات بنجاح. يمكنكم تعزيز المهارات اليومية عبر جدول الروتين والمحادثة التفاعلية مع رفيق.`
              : `يُظهر ${user.name} تفاعلاً هادئاً وإيجابياً. ننصح بتشجيعه اليوم على استكشاف وحدة "${nextRecommendedModule}" مع الحفاظ على روتين مكافآت النجوم.`}
          </p>
        </div>
      </section>
    </div>
  );
};
