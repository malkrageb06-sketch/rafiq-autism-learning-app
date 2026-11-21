import React from 'react';
import {
  ArrowRight,
  Award,
  BookOpen,
  Bot,
  CalendarCheck2,
  Home,
  Star,
  Trophy,
  User,
  Users,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { ScreenId } from '../types/rafiq';
import { toArabicDigits } from '../data/learningData';
import { RafiqLogo } from './Illustrations';
import { OfflineIndicator, PWAInstallButton } from './PWAStatusComponents';
import { SyncStatus } from '../hooks/useOnlineStatus';

interface AppShellProps {
  currentScreen: ScreenId;
  onNavigate: (screen: ScreenId) => void;
  stars: number;
  soundEnabled: boolean;
  onToggleSound: () => void;
  pageTitle?: string;
  backTarget?: ScreenId;
  isOnline?: boolean;
  syncStatus?: SyncStatus;
  contentUpdatedNotice?: boolean;
  children: React.ReactNode;
}

const PRIMARY_BOTTOM_TABS: {
  id: ScreenId;
  label: string;
  icon: React.FC<{ className?: string }>;
}[] = [
  { id: 'home', label: 'الرئيسية', icon: Home },
  { id: 'lessons', label: 'الدروس', icon: BookOpen },
  { id: 'rewards', label: 'المكافآت', icon: Award },
  { id: 'profile', label: 'الملف الشخصي', icon: User },
];

const COMPANION_BOTTOM_TABS: {
  id: ScreenId;
  label: string;
  icon: React.FC<{ className?: string }>;
}[] = [
  { id: 'ask-rafiq', label: 'اسأل رفيق', icon: Bot },
  { id: 'daily-routine', label: 'جدولي', icon: CalendarCheck2 },
  { id: 'achievements', label: 'الإنجازات', icon: Trophy },
  { id: 'parent-dashboard', label: 'المتابعة', icon: Users },
];

const COMPANION_SCREENS: ScreenId[] = [
  'ask-rafiq',
  'daily-routine',
  'achievements',
  'parent-dashboard',
];

export const AppShell: React.FC<AppShellProps> = ({
  currentScreen,
  onNavigate,
  stars,
  soundEnabled,
  onToggleSound,
  pageTitle,
  backTarget,
  isOnline = true,
  syncStatus = 'idle',
  contentUpdatedNotice = false,
  children,
}) => {
  const showChrome = currentScreen !== 'splash' && currentScreen !== 'login';
  const isPrimaryTabScreen =
    currentScreen === 'home' ||
    currentScreen === 'lessons' ||
    currentScreen === 'rewards' ||
    currentScreen === 'profile';
  const isCompanionScreen = COMPANION_SCREENS.includes(currentScreen);
  const showBottomNav = isPrimaryTabScreen || isCompanionScreen;

  const activeBottomTabs = isCompanionScreen ? COMPANION_BOTTOM_TABS : PRIMARY_BOTTOM_TABS;

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

          {/* Desktop horizontal tab links */}
          {showBottomNav && (
            <nav className="hidden md:flex items-center gap-1.5" aria-label="التنقل الرئيسي">
              {activeBottomTabs.map((tab) => {
                const Icon = tab.icon;
                const active = currentScreen === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => onNavigate(tab.id)}
                    className={`min-h-[40px] px-3.5 rounded-full text-sm font-bold inline-flex items-center gap-2 transition-colors duration-200 whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4A90E2] ${
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
            <PWAInstallButton compact />

            <button
              type="button"
              onClick={() => onNavigate(isCompanionScreen ? 'achievements' : 'rewards')}
              className="min-h-[44px] px-3.5 rounded-full bg-[#FEF9C3] border border-[#FDE68A] text-[#854D0E] inline-flex items-center gap-1.5 font-bold text-base tabular-nums transition-transform duration-200 active:scale-[0.97] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4A90E2]"
              aria-label={`عدد النجوم ${stars}`}
            >
              <Star className="w-5 h-5 fill-[#FFC107] text-[#D97706]" />
              <span>{toArabicDigits(stars)}</span>
              <span className="hidden sm:inline text-xs font-extrabold">نجمة</span>
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

      {/* Mobile Bottom Navigation Bar */}
      {showBottomNav && (
        <nav
          className="md:hidden fixed bottom-0 left-0 right-0 z-40 h-[68px] bg-white/95 backdrop-blur-md border-t border-[#E2E8F0] px-2"
          aria-label="شريط التنقل السفلي"
        >
          <div className="max-w-lg mx-auto h-full grid grid-cols-4 items-center gap-1">
            {activeBottomTabs.map((tab) => {
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
      <OfflineIndicator
        isOnline={isOnline}
        syncStatus={syncStatus}
        contentUpdatedNotice={contentUpdatedNotice}
      />
    </div>
  );
};
