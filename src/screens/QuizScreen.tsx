import React, { useState } from 'react';
import { Award, CheckCircle2, RotateCcw, Star, Volume2 } from 'lucide-react';
import {
  COLORS_DATA,
  COLORS_QUIZ,
  EMOTIONS_QUIZ,
  NUMBERS_QUIZ,
  SHAPES_QUIZ,
  toArabicDigits,
} from '../data/learningData';
import { ModuleKey, QuizQuestion, ScreenId } from '../types/rafiq';
import {
  CountingObjectSvg,
  EmotionIllustration,
  ShapeIllustration,
} from '../components/Illustrations';
import { playGentleTap, playSuccessChime, playTryAgainNote, speakArabic } from '../utils/audio';

interface QuizScreenProps {
  moduleKey: ModuleKey;
  soundEnabled: boolean;
  onAwardStars: (amount: number) => void;
  onCompleteQuiz: (moduleKey: ModuleKey, score: number) => void;
  onNavigate: (screen: ScreenId) => void;
}

const MODULE_META: Record<
  ModuleKey,
  { title: string; questions: QuizQuestion[]; learnScreen: ScreenId }
> = {
  colors: {
    title: 'اختبار الألوان',
    questions: COLORS_QUIZ,
    learnScreen: 'colors-learn',
  },
  shapes: {
    title: 'اختبار الأشكال',
    questions: SHAPES_QUIZ,
    learnScreen: 'shapes-learn',
  },
  numbers: {
    title: 'اختبار الأرقام',
    questions: NUMBERS_QUIZ,
    learnScreen: 'numbers-learn',
  },
  emotions: {
    title: 'اختبار المشاعر',
    questions: EMOTIONS_QUIZ,
    learnScreen: 'emotions-learn',
  },
};

export const QuizScreen: React.FC<QuizScreenProps> = ({
  moduleKey,
  soundEnabled,
  onAwardStars,
  onCompleteQuiz,
  onNavigate,
}) => {
  const { title, questions, learnScreen } = MODULE_META[moduleKey];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [status, setStatus] = useState<'idle' | 'correct' | 'wrong'>('idle');
  const [earnedInQuiz, setEarnedInQuiz] = useState(0);
  const [awardedThisQuestion, setAwardedThisQuestion] = useState(false);
  const [isFinished, setIsFinished] = useState(false);

  const currentQuestion = questions[currentIndex];
  const progressPercent = Math.round(((currentIndex + (status === 'correct' ? 1 : 0)) / questions.length) * 100);

  const handleAnswer = (optionId: string) => {
    if (status === 'correct') return; // Wait for next button

    setSelectedOption(optionId);
    if (optionId === currentQuestion.correctId) {
      setStatus('correct');
      playSuccessChime(soundEnabled);
      speakArabic('أحسنت! إجابة صحيحة', soundEnabled);
      if (!awardedThisQuestion) {
        setAwardedThisQuestion(true);
        setEarnedInQuiz((prev) => prev + 10);
        onAwardStars(10);
      }
    } else {
      setStatus('wrong');
      playTryAgainNote(soundEnabled);
      speakArabic('حاول مرة أخرى', soundEnabled);
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
      setIsFinished(true);
      onCompleteQuiz(moduleKey, earnedInQuiz);
    }
  };

  const handleRestart = () => {
    playGentleTap(soundEnabled);
    setCurrentIndex(0);
    setSelectedOption(null);
    setStatus('idle');
    setEarnedInQuiz(0);
    setAwardedThisQuestion(false);
    setIsFinished(false);
  };

  if (isFinished) {
    return (
      <div className="max-w-2xl mx-auto rafiq-card p-8 md:p-10 text-center space-y-6">
        <div className="w-24 h-24 rounded-full bg-[#FEF9C3] border-2 border-[#FDE047] flex items-center justify-center mx-auto">
          <Award className="w-12 h-12 text-[#CA8A04]" />
        </div>

        <div className="space-y-2">
          <h2 className="text-[26px] md:text-[32px] font-extrabold text-[#1E293B]">
            ✅ أحسنت! أتممت {title}
          </h2>
          <p className="text-lg text-[#64748B] font-medium">
            عمل رائع ومميز! لقد أضفنا النجوم إلى رصيدك.
          </p>
        </div>

        <div className="inline-flex items-center gap-3 px-6 py-4 rounded-2xl bg-[#F0FDF4] border border-[#BBF7D0]">
          <Star className="w-7 h-7 fill-[#FFC107] text-[#D97706]" />
          <span className="text-2xl font-extrabold text-[#166534] tabular-nums">
            +{toArabicDigits(earnedInQuiz)} نجمة جديدة
          </span>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
          <button
            type="button"
            onClick={() => onNavigate('rewards')}
            className="w-full sm:w-auto min-h-[60px] px-8 py-3.5 rounded-full bg-[#4CAF50] hover:bg-[#43A047] text-white text-lg font-bold rafiq-green-shadow transition-all duration-200 active:scale-[0.97]"
          >
            عرض المكافآت والأوسمة
          </button>

          <button
            type="button"
            onClick={() => onNavigate('home')}
            className="w-full sm:w-auto min-h-[60px] px-8 py-3.5 rounded-full bg-[#4A90E2] hover:bg-[#3B7FD0] text-white text-lg font-bold rafiq-button-shadow transition-all duration-200 active:scale-[0.97]"
          >
            العودة للرئيسية
          </button>

          <button
            type="button"
            onClick={handleRestart}
            className="w-full sm:w-auto min-h-[56px] px-6 py-3 rounded-full bg-[#F1F5F9] hover:bg-[#E2E8F0] text-[#1E293B] text-base font-bold inline-flex items-center justify-center gap-2 transition-colors duration-200"
          >
            <RotateCcw className="w-4 h-4" />
            <span>إعادة الاختبار</span>
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
            {title} · السؤال {toArabicDigits(currentIndex + 1)} من {toArabicDigits(questions.length)}
          </span>
          <button
            type="button"
            onClick={() => onNavigate(learnScreen)}
            className="text-[#4A90E2] hover:underline font-bold min-h-[40px] px-2"
          >
            مراجعة الدرس
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
          <h2 className="text-[26px] md:text-[30px] font-extrabold text-[#1E293B] text-balance">
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

        {/* Visual Counting Tray for Numbers Quiz */}
        {currentQuestion.countingDisplay && (
          <div className="bg-[#F8FAFC] border-[1.5px] border-[#E2E8F0] rounded-3xl p-5 md:p-6 inline-flex flex-wrap items-center justify-center gap-4 mx-auto">
            {Array.from({ length: currentQuestion.countingDisplay.count }).map((_, idx) => (
              <div
                key={idx}
                className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-white border border-[#E2E8F0] flex items-center justify-center shadow-sm"
              >
                <CountingObjectSvg type={currentQuestion.countingDisplay!.objectType} size={52} />
              </div>
            ))}
          </div>
        )}

        {/* Answer Options Grid */}
        <div className="grid grid-cols-2 gap-4 md:gap-5 pt-2">
          {currentQuestion.options.map((opt) => {
            const isSelected = selectedOption === opt.id;
            const isCorrectCard = status === 'correct' && opt.id === currentQuestion.correctId;
            const isWrongCard = status === 'wrong' && isSelected;

            const colorObj =
              moduleKey === 'colors' ? COLORS_DATA.find((c) => c.id === opt.id) : undefined;

            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => handleAnswer(opt.id)}
                className={`min-h-[136px] md:min-h-[156px] rounded-3xl border-2 p-5 flex flex-col items-center justify-center gap-3 transition-all duration-200 active:scale-[0.97] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4A90E2] ${
                  isCorrectCard
                    ? 'bg-[#F0FDF4] border-[#66BB6A] ring-4 ring-[#66BB6A]/25'
                    : isWrongCard
                    ? 'bg-[#FFF7ED] border-[#FFA726]'
                    : 'bg-white border-[#E2E8F0] hover:border-[#4A90E2] hover:bg-[#F8FAFC]'
                }`}
              >
                {moduleKey === 'colors' && colorObj && (
                  <div
                    className="w-16 h-16 md:w-20 md:h-20 rounded-full border-4 border-white shadow-md"
                    style={{ backgroundColor: colorObj.hex }}
                    aria-hidden="true"
                  />
                )}

                {moduleKey === 'shapes' && (
                  <ShapeIllustration
                    shapeId={opt.id as 'circle' | 'square' | 'triangle' | 'rectangle'}
                    size={76}
                  />
                )}

                {moduleKey === 'numbers' && (
                  <span className="text-4xl md:text-5xl font-extrabold text-[#4A90E2] tabular-nums">
                    {opt.label}
                  </span>
                )}

                {moduleKey === 'emotions' && (
                  <EmotionIllustration
                    emotionId={opt.id as 'happy' | 'sad' | 'worried' | 'tired'}
                    size={84}
                  />
                )}

                {moduleKey !== 'numbers' && (
                  <span className="text-xl md:text-2xl font-extrabold text-[#1E293B]">
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
                <div className="text-base font-bold text-[#15803D]">+١٠ نجوم أضيفت لرصيدك</div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleNext}
              className="w-full sm:w-auto min-h-[56px] px-8 py-3 rounded-full bg-[#4CAF50] hover:bg-[#43A047] text-white text-lg font-bold rafiq-green-shadow transition-all duration-200 active:scale-[0.97]"
            >
              {currentIndex + 1 < questions.length ? 'السؤال التالي' : 'إنهاء الاختبار'}
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
