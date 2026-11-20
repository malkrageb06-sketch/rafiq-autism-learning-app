import React from 'react';
import { Award, CheckCircle2, Lock, Palette, Hash, Star, TrendingUp, Trophy } from 'lucide-react';
import {
  computeBadges,
  computeOverallProgress,
  toArabicDigits,
} from '../data/learningData';
import { ProgressState, ScreenId } from '../types/rafiq';

interface RewardsScreenProps {
  progress: ProgressState;
  onNavigate: (screen: ScreenId) => void;
}

export const RewardsScreen: React.FC<RewardsScreenProps> = ({ progress, onNavigate }) => {
  const badges = computeBadges(progress);
  const unlockedCount = badges.filter((b) => b.unlocked).length;
  const overallProgress = computeOverallProgress(progress);

  const renderBadgeIcon = (iconType: 'learner' | 'colors' | 'numbers' | 'star', unlocked: boolean) => {
    const cls = `w-9 h-9 ${unlocked ? 'text-white' : 'text-[#94A3B8]'}`;
    if (iconType === 'learner') return <Trophy className={cls} />;
    if (iconType === 'colors') return <Palette className={cls} />;
    if (iconType === 'numbers') return <Hash className={cls} />;
    return <Star className={cls} />;
  };

  return (
    <div className="space-y-6">
      {/* Header Summary Card */}
      <div className="rafiq-card p-6 md:p-8 space-y-5">
        <div className="space-y-1">
          <h2 className="text-[24px] md:text-[28px] font-extrabold text-[#1E293B]">
            المكافآت والإنجازات
          </h2>
          <p className="text-base md:text-lg text-[#64748B] font-medium">
            كل درس تكمله وكل إجابة صحيحة تقربك من وسام جديد
          </p>
        </div>

        {/* 3 Key Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="rounded-2xl bg-[#FEFCE8] border border-[#FDE047] p-5 flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#FFC107] text-white flex items-center justify-center shrink-0">
              <Star className="w-8 h-8 fill-white" />
            </div>
            <div>
              <div className="text-sm font-bold text-[#854D0E]">عدد النجوم</div>
              <div className="text-3xl font-extrabold text-[#1E293B] tabular-nums">
                {toArabicDigits(progress.stars)}
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-[#EFF6FF] border border-[#BFDBFE] p-5 flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#4A90E2] text-white flex items-center justify-center shrink-0">
              <Award className="w-8 h-8" />
            </div>
            <div>
              <div className="text-sm font-bold text-[#1E40AF]">الأوسمة المكتسبة</div>
              <div className="text-3xl font-extrabold text-[#1E293B] tabular-nums">
                {toArabicDigits(unlockedCount)} / {toArabicDigits(badges.length)}
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-[#F0FDF4] border border-[#BBF7D0] p-5 flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#4CAF50] text-white flex items-center justify-center shrink-0">
              <TrendingUp className="w-8 h-8" />
            </div>
            <div>
              <div className="text-sm font-bold text-[#166534]">نسبة التقدم</div>
              <div className="text-3xl font-extrabold text-[#1E293B] tabular-nums">
                {toArabicDigits(overallProgress)}٪
              </div>
            </div>
          </div>
        </div>

        {/* Overall Progress Bar */}
        <div className="space-y-2 pt-1">
          <div className="flex items-center justify-between text-sm font-bold text-[#475569]">
            <span>تقدم الدروس والاختبارات</span>
            <span className="tabular-nums">{toArabicDigits(overallProgress)}٪ مكتمل</span>
          </div>
          <div className="w-full h-4 bg-[#E2E8F0] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#4CAF50] rounded-full transition-all duration-300"
              style={{ width: `${overallProgress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Achievement Badges Grid */}
      <section className="space-y-4">
        <h3 className="text-xl md:text-2xl font-extrabold text-[#1E293B]">الأوسمة التعليمية</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {badges.map((badge) => (
            <div
              key={badge.id}
              className={`rounded-3xl border-2 p-6 flex items-center gap-5 shadow-[0_8px_24px_rgba(30,41,59,0.05)] transition-colors ${
                badge.unlocked
                  ? 'bg-white border-[#FCD34D]'
                  : 'bg-[#F8FAFC] border-[#E2E8F0]'
              }`}
            >
              <div
                className="w-20 h-20 rounded-full flex items-center justify-center shrink-0"
                style={{
                  backgroundColor: badge.unlocked ? badge.accentColor : '#E2E8F0',
                }}
              >
                {renderBadgeIcon(badge.iconType, badge.unlocked)}
              </div>

              <div className="flex-1 space-y-1.5 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-xl font-extrabold text-[#1E293B]">{badge.title}</h4>
                  {badge.unlocked ? (
                    <span className="inline-flex items-center gap-1 text-sm font-bold text-[#166534]">
                      <CheckCircle2 className="w-5 h-5 text-[#4CAF50]" />
                      <span>مكتسب</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-sm font-semibold text-[#64748B]">
                      <Lock className="w-4 h-4" />
                      <span>مغلق</span>
                    </span>
                  )}
                </div>

                <p className="text-sm md:text-base text-[#475569] font-medium">
                  {badge.description}
                </p>
                <p
                  className={`text-sm font-bold ${
                    badge.unlocked ? 'text-[#15803D]' : 'text-[#64748B]'
                  }`}
                >
                  {badge.requirementText}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="flex justify-center pt-2">
        <button
          type="button"
          onClick={() => onNavigate('lessons')}
          className="min-h-[60px] px-10 py-3.5 rounded-full bg-[#4A90E2] hover:bg-[#3B7FD0] text-white text-lg font-bold rafiq-button-shadow transition-all duration-200 active:scale-[0.97]"
        >
          متابعة الدروس لربح المزيد
        </button>
      </div>
    </div>
  );
};
