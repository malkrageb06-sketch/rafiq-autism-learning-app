import React, { useState } from 'react';
import { Volume2 } from 'lucide-react';
import { NUMBERS_DATA, toArabicDigits } from '../data/learningData';
import { CountingObjectSvg } from '../components/Illustrations';
import { playGentleTap, speakArabic } from '../utils/audio';

interface NumbersLearningScreenProps {
  soundEnabled: boolean;
  onStartQuiz: () => void;
}

export const NumbersLearningScreen: React.FC<NumbersLearningScreenProps> = ({
  soundEnabled,
  onStartQuiz,
}) => {
  const [activeNumber, setActiveNumber] = useState<number>(1);
  const [countedIndices, setCountedIndices] = useState<Record<number, number>>({});

  const handleSelectNumber = (val: number, name: string, plural: string) => {
    setActiveNumber(val);
    playGentleTap(soundEnabled);
    speakArabic(`${name}. ${plural}`, soundEnabled);
  };

  const handleTapObject = (numValue: number, objIndex: number) => {
    setActiveNumber(numValue);
    setCountedIndices((prev) => ({
      ...prev,
      [numValue]: objIndex + 1,
    }));
    playGentleTap(soundEnabled);
    speakArabic(toArabicDigits(objIndex + 1), soundEnabled);
  };

  return (
    <div className="space-y-6">
      <div className="rafiq-card p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-[24px] md:text-[28px] font-extrabold text-[#1E293B]">
            تعلم الأرقام
          </h2>
          <p className="text-base md:text-lg text-[#64748B] font-medium">
            اضغط على الرقم أو على الفواكه والألعاب لتعدّها واحداً تلو الآخر
          </p>
        </div>
        <button
          type="button"
          onClick={onStartQuiz}
          className="min-h-[60px] px-8 py-3.5 rounded-full bg-[#4CAF50] hover:bg-[#43A047] text-white text-lg font-bold rafiq-green-shadow transition-all duration-200 active:scale-[0.97] whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4CAF50]"
        >
          ابدأ الاختبار
        </button>
      </div>

      <div className="space-y-4">
        {NUMBERS_DATA.map((item) => {
          const isSelected = activeNumber === item.value;
          const highlightedUpTo = countedIndices[item.value] ?? 0;

          return (
            <div
              key={item.value}
              style={{
                backgroundColor: isSelected ? item.softBg : '#FFFFFF',
                borderColor: isSelected ? item.accentColor : '#E2E8F0',
              }}
              className="rounded-3xl border-2 p-5 md:p-6 shadow-[0_8px_24px_rgba(30,41,59,0.05)] transition-colors duration-200 flex flex-col sm:flex-row sm:items-center justify-between gap-5"
            >
              {/* Number Button */}
              <button
                type="button"
                onClick={() => handleSelectNumber(item.value, item.name, item.objectPlural)}
                className="flex items-center gap-4 text-right min-h-[64px] rounded-2xl p-2 -m-2 focus-visible:outline-2 focus-visible:outline-[#4A90E2]"
              >
                <div
                  className="w-16 h-16 md:w-20 md:h-20 rounded-2xl flex items-center justify-center text-4xl md:text-5xl font-extrabold text-white shrink-0 shadow-sm"
                  style={{ backgroundColor: item.accentColor }}
                >
                  {item.arabicDigit}
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-2xl font-extrabold text-[#1E293B]">{item.name}</h3>
                    <Volume2 className="w-5 h-5 text-[#64748B]" />
                  </div>
                  <p className="text-base font-semibold text-[#475569]">{item.objectPlural}</p>
                </div>
              </button>

              {/* Interactive Counting Objects */}
              <div className="flex flex-wrap items-center gap-3 bg-white/85 rounded-2xl p-3 border border-[#E2E8F0]">
                {Array.from({ length: item.value }).map((_, idx) => {
                  const isCounted = idx < highlightedUpTo;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleTapObject(item.value, idx)}
                      className={`min-w-[54px] min-h-[54px] rounded-2xl flex flex-col items-center justify-center p-1.5 border transition-all duration-200 focus-visible:outline-2 focus-visible:outline-[#4A90E2] ${
                        isCounted
                          ? 'bg-[#FEF9C3] border-[#FACC15]'
                          : 'bg-white border-transparent hover:bg-[#F8FAFC]'
                      }`}
                      aria-label={`عنصر رقم ${toArabicDigits(idx + 1)}`}
                    >
                      <CountingObjectSvg
                        type={item.objectType}
                        size={44}
                        highlighted={isCounted}
                      />
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <div className="pt-2 flex justify-center">
        <button
          type="button"
          onClick={onStartQuiz}
          className="w-full sm:w-auto min-w-[280px] min-h-[64px] px-10 py-4 rounded-full bg-[#4A90E2] hover:bg-[#3B7FD0] text-white text-xl font-bold rafiq-button-shadow transition-all duration-200 active:scale-[0.97] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4A90E2]"
        >
          ابدأ الاختبار
        </button>
      </div>
    </div>
  );
};
