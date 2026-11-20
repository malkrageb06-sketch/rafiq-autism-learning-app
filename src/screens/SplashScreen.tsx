import React from 'react';
import { Palette, Shapes, Hash, Smile } from 'lucide-react';
import { ChildrenLearningIllustration, RafiqLogo } from '../components/Illustrations';

interface SplashScreenProps {
  onStart: () => void;
}

const EDUCATIONAL_ICONS = [
  { label: 'الألوان', icon: Palette, bg: '#FEF2F2', color: '#E5534B' },
  { label: 'الأشكال', icon: Shapes, bg: '#EFF6FF', color: '#4A90E2' },
  { label: 'الأرقام', icon: Hash, bg: '#F0FDF4', color: '#4CAF50' },
  { label: 'المشاعر', icon: Smile, bg: '#FEFCE8', color: '#D97706' },
];

export const SplashScreen: React.FC<SplashScreenProps> = ({ onStart }) => {
  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center px-4 py-8 md:py-12">
      <div className="w-full max-w-4xl rafiq-card p-6 sm:p-10 md:p-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10 items-center">
          {/* Text & Primary Action */}
          <div className="flex flex-col items-center lg:items-start text-center lg:text-right space-y-6 order-2 lg:order-1">
            <RafiqLogo size="lg" />

            <div className="space-y-3">
              <h1 className="text-[28px] md:text-[34px] font-extrabold text-[#1E293B] leading-snug text-balance">
                تعلم واكتشف واستمتع
              </h1>
              <p className="text-base md:text-lg text-[#64748B] font-medium max-w-md leading-relaxed">
                بيئة تعليمية هادئة وممتعة تساعد الأطفال على استكشاف الألوان والأشكال والأرقام والمشاعر بخطوات واضحة ومشجعة.
              </p>
            </div>

            {/* Colorful Educational Icons Row */}
            <div className="grid grid-cols-4 gap-3 w-full max-w-sm pt-1">
              {EDUCATIONAL_ICONS.map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.label}
                    className="flex flex-col items-center gap-2 p-2.5 rounded-2xl border border-[#E2E8F0] bg-white"
                  >
                    <div
                      className="w-11 h-11 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: item.bg, color: item.color }}
                    >
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-xs font-bold text-[#1E293B] whitespace-nowrap">
                      {item.label}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="w-full sm:w-auto pt-2">
              <button
                type="button"
                onClick={onStart}
                className="w-full sm:w-auto min-w-[240px] min-h-[64px] px-10 py-4 rounded-full bg-[#4A90E2] hover:bg-[#3B7FD0] text-white text-xl font-bold rafiq-button-shadow transition-all duration-200 active:scale-[0.97] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4A90E2]"
              >
                ابدأ الآن
              </button>
            </div>
          </div>

          {/* Calm Children Learning Illustration */}
          <div className="order-1 lg:order-2 flex items-center justify-center">
            <ChildrenLearningIllustration />
          </div>
        </div>
      </div>
    </div>
  );
};
