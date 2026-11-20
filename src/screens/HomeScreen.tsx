import React from 'react';
import { Award, CheckCircle2, Hash, Palette, Shapes, Smile, Star } from 'lucide-react';
import { ProgressState, ScreenId, UserAccount } from '../types/rafiq';
import { computeOverallProgress, toArabicDigits } from '../data/learningData';

interface HomeScreenProps {
  user: UserAccount;
  progress: ProgressState;
  onNavigate: (screen: ScreenId) => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ user, progress, onNavigate }) => {
  const overallProgress = computeOverallProgress(progress);

  const cards: {
    id: ScreenId;
    title: string;
    subtitle: string;
    emoji: string;
    icon: React.FC<{ className?: string }>;
    bg: string;
    border: string;
    iconBg: string;
    iconColor: string;
    completed?: boolean;
  }[] = [
    {
      id: 'colors-learn',
      title: 'تعلم الألوان',
      subtitle: 'أحمر · أخضر · أزرق · أصفر',
      emoji: '🎨',
      icon: Palette,
      bg: '#FEF2F2',
      border: '#FECACA',
      iconBg: '#FFFFFF',
      iconColor: '#E5534B',
      completed: progress.completedQuizzes.colors,
    },
    {
      id: 'shapes-learn',
      title: 'تعلم الأشكال',
      subtitle: 'دائرة · مربع · مثلث · مستطيل',
      emoji: '🔺',
      icon: Shapes,
      bg: '#EFF6FF',
      border: '#BFDBFE',
      iconBg: '#FFFFFF',
      iconColor: '#4A90E2',
      completed: progress.completedQuizzes.shapes,
    },
    {
      id: 'numbers-learn',
      title: 'تعلم الأرقام',
      subtitle: 'عدّ الأرقام من ١ إلى ٥',
      emoji: '🔢',
      icon: Hash,
      bg: '#F0FDF4',
      border: '#BBF7D0',
      iconBg: '#FFFFFF',
      iconColor: '#4CAF50',
      completed: progress.completedQuizzes.numbers,
    },
    {
      id: 'emotions-learn',
      title: 'تعلم المشاعر',
      subtitle: 'سعيد · حزين · قلق · متعب',
      emoji: '😊',
      icon: Smile,
      bg: '#FFFBEB',
      border: '#FDE68A',
      iconBg: '#FFFFFF',
      iconColor: '#D97706',
      completed: progress.completedQuizzes.emotions,
    },
    {
      id: 'rewards',
      title: 'المكافآت',
      subtitle: 'الأوسمة ونسبة التقدم',
      emoji: '🏆',
      icon: Award,
      bg: '#F5F3FF',
      border: '#DDD6FE',
      iconBg: '#FFFFFF',
      iconColor: '#7C3AED',
    },
    {
      id: 'rewards',
      title: 'نقاطي',
      subtitle: `${toArabicDigits(progress.stars)} نجمة مكتسبة`,
      emoji: '⭐',
      icon: Star,
      bg: '#FEFCE8',
      border: '#FDE047',
      iconBg: '#FFFFFF',
      iconColor: '#CA8A04',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Calm Welcome Banner */}
      <section className="rafiq-card p-6 md:p-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
        <div className="space-y-2">
          <h2 className="text-[24px] md:text-[28px] font-extrabold text-[#1E293B] leading-snug">
            مرحباً بك في رفيق
          </h2>
          <p className="text-base md:text-lg text-[#64748B] font-medium">
            أهلاً {user.name} · اختر نشاطاً هادئاً لنبدأ التعلم معاً
          </p>
        </div>

        {/* Clean Progress Overview */}
        <div className="flex items-center gap-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl px-5 py-3.5 shrink-0">
          <div className="text-right">
            <div className="text-sm font-semibold text-[#64748B]">نسبة التقدم</div>
            <div className="text-2xl font-extrabold text-[#4A90E2] tabular-nums">
              {toArabicDigits(overallProgress)}٪
            </div>
          </div>
          <div className="w-16 h-16 relative flex items-center justify-center">
            <svg className="w-16 h-16 -rotate-90" viewBox="0 0 64 64" aria-hidden="true">
              <circle cx="32" cy="32" r="26" fill="none" stroke="#E2E8F0" strokeWidth="6" />
              <circle
                cx="32"
                cy="32"
                r="26"
                fill="none"
                stroke="#4CAF50"
                strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray={2 * Math.PI * 26}
                strokeDashoffset={2 * Math.PI * 26 * (1 - overallProgress / 100)}
                className="transition-all duration-300"
              />
            </svg>
            <Star className="w-5 h-5 fill-[#FFC107] text-[#D97706] absolute" />
          </div>
        </div>
      </section>

      {/* Large Colorful Learning Cards Grid */}
      <section aria-label="الأنشطة التعليمية">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {cards.map((card, index) => {
            const Icon = card.icon;
            return (
              <button
                key={`${card.title}-${index}`}
                type="button"
                onClick={() => onNavigate(card.id)}
                style={{ backgroundColor: card.bg, borderColor: card.border }}
                className="group relative text-right rounded-3xl border-[1.5px] p-6 min-h-[156px] flex flex-col justify-between gap-4 shadow-[0_8px_24px_rgba(30,41,59,0.05)] transition-transform duration-200 hover:-translate-y-0.5 active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4A90E2]"
              >
                <div className="flex items-start justify-between gap-3 w-full">
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm"
                    style={{ backgroundColor: card.iconBg, color: card.iconColor }}
                  >
                    <Icon className="w-8 h-8" />
                  </div>

                  <div className="flex items-center gap-2">
                    {card.completed && (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-[#166534]">
                        <CheckCircle2 className="w-5 h-5 text-[#4CAF50]" />
                        <span>مكتمل</span>
                      </span>
                    )}
                    <span className="text-2xl" aria-hidden="true">
                      {card.emoji}
                    </span>
                  </div>
                </div>

                <div className="space-y-1">
                  <h3 className="text-xl md:text-2xl font-bold text-[#1E293B]">{card.title}</h3>
                  <p className="text-sm md:text-base font-medium text-[#475569]">{card.subtitle}</p>
                </div>
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
};
