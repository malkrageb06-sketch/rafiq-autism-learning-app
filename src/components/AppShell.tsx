import React from 'react';
import { ArrowRight, Award, BookOpen, Home, Star, User, Volume2, VolumeX } from 'lucide-react';
import { ScreenId } from '../types/rafiq';
import { toArabicDigits } from '../data/learningData';
import { RafiqLogo } from './Illustrations';

interface AppShellProps {
  currentScreen: ScreenId;
  onNavigate: (screen: ScreenId) => void;
  stars: number;
  soundEnabled: boolean;
  onToggleSound: () => void;
  pageTitle?: string;
  backTarget?: ScreenId;
  children: React.ReactNode;
}

const BOTTOM_TABS: { id: ScreenId; label: string; icon: React.FC<{ className?: string }> }[] = [
  { id: 'home', label: 'الرئيسية', icon: Home },
  { id: 'lessons', label: 'الدروس', icon: BookOpen },
  { id: 'rewards', label: 'المكافآت', icon: Award },
  { id: 'profile', label: 'الملف الشخصي', icon: User },
];

export const AppShell: React.FC<AppShellProps> = ({
  currentScreen,
  onNavigate,
  stars,
  soundEnabled,
  onToggleSound,
  pageTitle,
  backTarget,
  children,
}) => {
  const showChrome = currentScreen !== 'splash' && currentScreen !== 'login';
  const showBottomNav =
    currentScreen === 'home' ||
    currentScreen === 'lessons' ||
    currentScreen === 'rewards' ||
    currentScreen === 'profile';

  if (!showChrome) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] text-[#1E293B] flex flex-col">
        {children}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#1E293B] flex flex-col">
      {/* Compact Top App Bar (<= 56px height to respect mobile sticky budget) */}
      <header className="sticky top-0 z-30 h-14 bg-white/95 backdrop-blur-md border-b border-[#E2E8F0]">
        <div className="max-w-5xl mx-auto h-full px-4 md:px-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            {backTarget ? (
              <button
                type="button"
                onClick={() => onNavigate(backTarget)}
                className="min-h-[44px] min-w-[44px] px-3 rounded-full bg-[#F1F5F9] hover:bg-[#E2E8F0] text-[#1E293B] inline-flex items-center justify-center gap-2 transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4A90E2] shrink-0"
                aria-label="العودة"
              >
                <ArrowRight className="w-5 h-5" />
                <span className="text-sm font-bold whitespace-nowrap">رجوع</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => onNavigate('home')}
                className="min-h-[44px] flex items-center rounded-xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4A90E2] shrink-0"
              >
                <RafiqLogo size="sm" />
              </button>
            )}
            {pageTitle && (
              <h1 className="text-base md:text-lg font-bold text-[#1E293B] truncate">
                {pageTitle}
              </h1>
            )}
          </div>

          {/* Desktop horizontal tab links (visible on md+ when on primary screens) */}
          {showBottomNav && (
            <nav className="hidden md:flex items-center gap-2" aria-label="التنقل الرئيسي">
              {BOTTOM_TABS.map((tab) => {
                const Icon = tab.icon;
                const active = currentScreen === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => onNavigate(tab.id)}
                    className={`min-h-[44px] px-4 rounded-full text-sm font-bold inline-flex items-center gap-2 transition-colors duration-200 whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4A90E2] ${
                      active
                        ? 'bg-[#4A90E2] text-white'
                        : 'text-[#64748B] hover:text-[#1E293B] hover:bg-[#F1F5F9]'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          )}

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => onNavigate('rewards')}
              className="min-h-[44px] px-3.5 rounded-full bg-[#FEF9C3] border border-[#FDE68A] text-[#854D0E] inline-flex items-center gap-1.5 font-bold text-base tabular-nums transition-transform duration-200 active:scale-[0.97] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4A90E2]"
              aria-label={`عدد النجوم ${stars}`}
            >
              <Star className="w-5 h-5 fill-[#FFC107] text-[#D97706]" />
              <span>{toArabicDigits(stars)}</span>
            </button>

            <button
              type="button"
              onClick={onToggleSound}
              className={`min-h-[44px] min-w-[44px] rounded-full border inline-flex items-center justify-center transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4A90E2] ${
                soundEnabled
                  ? 'bg-[#EFF6FF] border-[#BFDBFE] text-[#4A90E2]'
                  : 'bg-[#F1F5F9] border-[#E2E8F0] text-[#64748B]'
              }`}
              aria-label={soundEnabled ? 'كتم الصوت' : 'تشغيل الصوت'}
              title={soundEnabled ? 'الصوت مفعل' : 'الصوت مكتوم'}
            >
              {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main
        className={`flex-1 w-full max-w-5xl mx-auto px-4 md:px-6 pt-5 ${
          showBottomNav ? 'pb-24 md:pb-10' : 'pb-10'
        }`}
      >
        {children}
      </main>

      {/* Mobile Bottom Navigation Bar (Fixed on small screens, hidden on md+ where top nav handles tabs) */}
      {showBottomNav && (
        <nav
          className="md:hidden fixed bottom-0 left-0 right-0 z-40 h-[68px] bg-white/95 backdrop-blur-md border-t border-[#E2E8F0] px-2"
          aria-label="شريط التنقل السفلي"
        >
          <div className="max-w-lg mx-auto h-full grid grid-cols-4 items-center gap-1">
            {BOTTOM_TABS.map((tab) => {
              const Icon = tab.icon;
              const active = currentScreen === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => onNavigate(tab.id)}
                  className={`min-h-[52px] rounded-2xl flex flex-col items-center justify-center gap-1 transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4A90E2] ${
                    active
                      ? 'bg-[#EFF6FF] text-[#4A90E2] font-bold'
                      : 'text-[#64748B] hover:text-[#1E293B] font-semibold'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-xs leading-none whitespace-nowrap">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </nav>
      )}
    </div>
  );
};
