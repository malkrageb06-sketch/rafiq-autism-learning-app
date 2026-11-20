import React from 'react';
import { BookOpen, CheckCircle2, Hash, Palette, Play, Shapes, Smile } from 'lucide-react';
import { ModuleKey, ProgressState, ScreenId } from '../types/rafiq';

interface LessonsHubScreenProps {
  progress: ProgressState;
  onNavigate: (screen: ScreenId) => void;
}

const MODULES: {
  key: ModuleKey;
  title: string;
  description: string;
  learnScreen: ScreenId;
  quizScreen: ScreenId;
  icon: React.FC<{ className?: string }>;
  bg: string;
  border: string;
  color: string;
}[] = [
  {
    key: 'colors',
    title: 'تعلم الألوان',
    description: 'الأحمر والأخضر والأزرق والأصفر بأمثلة واضحة ومحببة.',
    learnScreen: 'colors-learn',
    quizScreen: 'colors-quiz',
    icon: Palette,
    bg: '#FEF2F2',
    border: '#FECACA',
    color: '#E5534B',
  },
  {
    key: 'shapes',
    title: 'تعلم الأشكال',
    description: 'الدائرة والمربع والمثلث والمستطيل مع صور توضيحية.',
    learnScreen: 'shapes-learn',
    quizScreen: 'shapes-quiz',
    icon: Shapes,
    bg: '#EFF6FF',
    border: '#BFDBFE',
    color: '#4A90E2',
  },
  {
    key: 'numbers',
    title: 'تعلم الأرقام',
    description: 'العد من ١ إلى ٥ باستخدام الفواكه والألعاب التفاعلية.',
    learnScreen: 'numbers-learn',
    quizScreen: 'numbers-quiz',
    icon: Hash,
    bg: '#F0FDF4',
    border: '#BBF7D0',
    color: '#4CAF50',
  },
  {
    key: 'emotions',
    title: 'تعلم المشاعر',
    description: 'التعرف على مشاعر السعادة والحزن والقلق والتعب.',
    learnScreen: 'emotions-learn',
    quizScreen: 'emotions-quiz',
    icon: Smile,
    bg: '#FFFBEB',
    border: '#FDE68A',
    color: '#D97706',
  },
];

export const LessonsHubScreen: React.FC<LessonsHubScreenProps> = ({ progress, onNavigate }) => {
  return (
    <div className="space-y-6">
      <div className="rafiq-card p-6 space-y-1">
        <h2 className="text-[24px] md:text-[28px] font-extrabold text-[#1E293B]">
          الدروس والاختبارات
        </h2>
        <p className="text-base md:text-lg text-[#64748B] font-medium">
          اختر الدرس المصور للتعلم أولاً، أو انتقل مباشرة إلى الاختبار التفاعلي
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {MODULES.map((mod) => {
          const Icon = mod.icon;
          const lessonDone = progress.completedLessons[mod.key];
          const quizDone = progress.completedQuizzes[mod.key];

          return (
            <div
              key={mod.key}
              className="rafiq-card p-6 flex flex-col justify-between gap-5"
            >
              <div className="flex items-start gap-4">
                <div
                  className="w-16 h-16 rounded-2xl border flex items-center justify-center shrink-0"
                  style={{ backgroundColor: mod.bg, borderColor: mod.border, color: mod.color }}
                >
                  <Icon className="w-8 h-8" />
                </div>

                <div className="flex-1 space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-xl md:text-2xl font-extrabold text-[#1E293B]">{mod.title}</h3>
                    {quizDone && (
                      <span className="inline-flex items-center gap-1 text-sm font-bold text-[#166534]">
                        <CheckCircle2 className="w-5 h-5 text-[#4CAF50]" />
                        <span>مكتمل</span>
                      </span>
                    )}
                  </div>
                  <p className="text-sm md:text-base text-[#64748B] font-medium leading-relaxed">
                    {mod.description}
                  </p>
                  <p className="text-xs font-semibold text-[#64748B]">
                    {lessonDone ? 'تم استكشاف الدرس' : 'الدرس متاح'} ·{' '}
                    {quizDone ? 'تم اجتياز الاختبار' : 'الاختبار بانتظارك'}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => onNavigate(mod.learnScreen)}
                  className="min-h-[54px] px-4 py-3 rounded-full bg-[#4A90E2] hover:bg-[#3B7FD0] text-white text-base font-bold inline-flex items-center justify-center gap-2 transition-colors active:scale-[0.97]"
                >
                  <BookOpen className="w-5 h-5" />
                  <span>الدرس</span>
                </button>
                <button
                  type="button"
                  onClick={() => onNavigate(mod.quizScreen)}
                  className="min-h-[54px] px-4 py-3 rounded-full bg-[#F0FDF4] hover:bg-[#DCFCE7] text-[#166534] border border-[#BBF7D0] text-base font-bold inline-flex items-center justify-center gap-2 transition-colors active:scale-[0.97]"
                >
                  <Play className="w-5 h-5" />
                  <span>الاختبار</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
