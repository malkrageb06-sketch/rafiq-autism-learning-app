import React, { useState } from 'react';
import { Volume2 } from 'lucide-react';
import { SHAPES_DATA } from '../data/learningData';
import { ShapeIllustration } from '../components/Illustrations';
import { playGentleTap, speakArabic } from '../utils/audio';

interface ShapesLearningScreenProps {
  soundEnabled: boolean;
  onStartQuiz: () => void;
}

export const ShapesLearningScreen: React.FC<ShapesLearningScreenProps> = ({
  soundEnabled,
  onStartQuiz,
}) => {
  const [selectedId, setSelectedId] = useState<string>('circle');

  const handleSelectShape = (id: string, name: string, example: string) => {
    setSelectedId(id);
    playGentleTap(soundEnabled);
    speakArabic(`${name}. مثل ${example.replace('·', 'أو')}`, soundEnabled);
  };

  return (
    <div className="space-y-6">
      <div className="rafiq-card p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-[24px] md:text-[28px] font-extrabold text-[#1E293B]">
            تعلم الأشكال
          </h2>
          <p className="text-base md:text-lg text-[#64748B] font-medium">
            اضغط على كل شكل هندسي لاستكشاف خصائصه وأمثلته اليومية
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

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {SHAPES_DATA.map((item) => {
          const isSelected = selectedId === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => handleSelectShape(item.id, item.name, item.exampleLabel)}
              style={{
                backgroundColor: isSelected ? item.softBg : '#FFFFFF',
                borderColor: isSelected ? item.accentColor : '#E2E8F0',
              }}
              className="text-right rounded-3xl border-2 p-6 flex items-center gap-5 shadow-[0_8px_24px_rgba(30,41,59,0.05)] transition-all duration-200 active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4A90E2]"
            >
              <div className="shrink-0 bg-white rounded-2xl p-2 border border-[#E2E8F0]">
                <ShapeIllustration shapeId={item.id} size={96} withExample />
              </div>

              <div className="flex-1 space-y-2 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold" style={{ color: item.accentColor }}>
                      {item.symbol}
                    </span>
                    <h3 className="text-2xl font-extrabold text-[#1E293B]">{item.name}</h3>
                  </div>
                  <Volume2 className="w-5 h-5 text-[#64748B] shrink-0" />
                </div>

                <p className="text-base font-bold" style={{ color: item.accentColor }}>
                  {item.exampleLabel}
                </p>
                <p className="text-sm md:text-base text-[#475569] font-medium leading-relaxed">
                  {item.description}
                </p>
              </div>
            </button>
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
