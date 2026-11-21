import React, { useState } from 'react';
import {
  Check,
  Cloud,
  LogOut,
  RefreshCw,
  RotateCcw,
  Star,
  User,
  Volume2,
  Wifi,
  WifiOff,
} from 'lucide-react';
import { ProgressState, UserAccount } from '../types/rafiq';
import { computeOverallProgress, toArabicDigits } from '../data/learningData';
import { SyncStatus } from '../hooks/useOnlineStatus';
import { PublishedContentManifest } from '../utils/offlineStorage';
import { PWAInstallButton } from '../components/PWAStatusComponents';

interface ProfileScreenProps {
  user: UserAccount;
  progress: ProgressState;
  onUpdateName: (newName: string) => void;
  onToggleSound: () => void;
  onResetProgress: () => void;
  onLogout: () => void;
  isOnline?: boolean;
  syncStatus?: SyncStatus;
  lastSyncedAt?: string | null;
  contentManifest?: PublishedContentManifest | null;
  onManualSync?: () => void;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({
  user,
  progress,
  onUpdateName,
  onToggleSound,
  onResetProgress,
  onLogout,
  isOnline = true,
  syncStatus = 'idle',
  lastSyncedAt = null,
  contentManifest = null,
  onManualSync,
}) => {
  const [nameInput, setNameInput] = useState(user.name);
  const [savedNotice, setSavedNotice] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);

  const overallProgress = computeOverallProgress(progress);

  const handleSaveName = (e: React.FormEvent) => {
    e.preventDefault();
    if (nameInput.trim().length >= 2) {
      onUpdateName(nameInput.trim());
      setSavedNotice(true);
      setTimeout(() => setSavedNotice(false), 2500);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Child Profile Card */}
      <section className="rafiq-card p-6 md:p-8 flex flex-col sm:flex-row sm:items-center gap-6">
        <div className="w-20 h-20 rounded-full bg-[#EFF6FF] border-2 border-[#BFDBFE] flex items-center justify-center text-[#4A90E2] shrink-0">
          <User className="w-10 h-10" />
        </div>

        <div className="flex-1 space-y-1.5">
          <h2 className="text-[24px] font-extrabold text-[#1E293B]">{user.name}</h2>
          <p className="text-base text-[#64748B] font-medium">
            {user.email} · الفئة العمرية {user.ageGroup}
          </p>
          <div className="flex flex-wrap items-center gap-4 pt-1 text-base font-bold text-[#1E293B]">
            <span className="inline-flex items-center gap-1.5 text-[#854D0E]">
              <Star className="w-5 h-5 fill-[#FFC107] text-[#D97706]" />
              <span className="tabular-nums">{toArabicDigits(progress.stars)} نجمة</span>
            </span>
            <span className="text-[#CBD5E1]">|</span>
            <span className="text-[#166534] tabular-nums">
              نسبة الإنجاز {toArabicDigits(overallProgress)}٪
            </span>
          </div>
        </div>
      </section>

      {/* Edit Child Name */}
      <section className="rafiq-card p-6 space-y-4">
        <h3 className="text-xl font-extrabold text-[#1E293B]">تخصيص اسم الطفل</h3>
        <form onSubmit={handleSaveName} className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            placeholder="اكتب اسم الطفل"
            className="flex-1 min-h-[54px] px-4 rounded-2xl border-[1.5px] border-[#CBD5E1] bg-white text-base font-semibold text-[#1E293B] focus:outline-none focus:border-[#4A90E2]"
          />
          <button
            type="submit"
            className="min-h-[54px] px-7 rounded-full bg-[#4A90E2] hover:bg-[#3B7FD0] text-white text-base font-bold inline-flex items-center justify-center gap-2 transition-colors active:scale-[0.97]"
          >
            {savedNotice ? <Check className="w-5 h-5" /> : null}
            <span>{savedNotice ? 'تم الحفظ' : 'حفظ الاسم'}</span>
          </button>
        </form>
      </section>

      {/* Sensory & Audio Preferences */}
      <section className="rafiq-card p-6 space-y-4">
        <h3 className="text-xl font-extrabold text-[#1E293B]">الإعدادات الحسية والراحة</h3>

        <div className="flex items-center justify-between gap-4 p-4 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0]">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#EFF6FF] text-[#4A90E2] flex items-center justify-center shrink-0">
              <Volume2 className="w-6 h-6" />
            </div>
            <div>
              <div className="text-lg font-bold text-[#1E293B]">النطق الصوتي والمؤثرات الهادئة</div>
              <div className="text-sm text-[#64748B] font-medium">
                قراءة الكلمات العربية بصوت واضح ونغمات تشجيعية لطيفة
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onToggleSound}
            className={`min-h-[48px] min-w-[100px] px-5 rounded-full text-base font-bold transition-colors ${
              progress.soundEnabled
                ? 'bg-[#4CAF50] text-white'
                : 'bg-[#E2E8F0] text-[#475569]'
            }`}
          >
            {progress.soundEnabled ? 'مفعل' : 'مكتوم'}
          </button>
        </div>
      </section>

      {/* Parent Actions: Reset & Logout */}
      <section className="rafiq-card p-6 space-y-4">
        <h3 className="text-xl font-extrabold text-[#1E293B]">إدارة الحساب</h3>

        <div className="flex flex-col sm:flex-row gap-3">
          {!confirmReset ? (
            <button
              type="button"
              onClick={() => setConfirmReset(true)}
              className="flex-1 min-h-[56px] px-6 py-3 rounded-full bg-[#FFF7ED] hover:bg-[#FFEDD5] border border-[#FDBA74] text-[#9A3412] text-base font-bold inline-flex items-center justify-center gap-2 transition-colors"
            >
              <RotateCcw className="w-5 h-5" />
              <span>إعادة ضبط التقدم والنجوم</span>
            </button>
          ) : (
            <div className="flex-1 flex items-center gap-2 bg-[#FFF7ED] border border-[#FDBA74] rounded-2xl p-2">
              <button
                type="button"
                onClick={() => {
                  onResetProgress();
                  setConfirmReset(false);
                }}
                className="flex-1 min-h-[48px] px-4 rounded-xl bg-[#EA580C] text-white text-sm font-bold"
              >
                تأكيد تصفير النجوم
              </button>
              <button
                type="button"
                onClick={() => setConfirmReset(false)}
                className="min-h-[48px] px-4 rounded-xl bg-white border border-[#E2E8F0] text-[#1E293B] text-sm font-bold"
              >
                إلغاء
              </button>
            </div>
          )}

          <button
            type="button"
            onClick={onLogout}
            className="flex-1 min-h-[56px] px-6 py-3 rounded-full bg-[#F1F5F9] hover:bg-[#E2E8F0] text-[#1E293B] text-base font-bold inline-flex items-center justify-center gap-2 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span>تسجيل الخروج</span>
          </button>
        </div>
      </section>

      {/* Online / Offline & Cloud Sync Card */}
      <section className="rafiq-card p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-xl font-extrabold text-[#1E293B]">وضع الاتصال والمزامنة السحابية</h3>
          <span
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold inline-flex items-center gap-1.5 border ${
              isOnline
                ? 'bg-[#F0FDF4] border-[#BBF7D0] text-[#166534]'
                : 'bg-[#FFFBEB] border-[#FDE68A] text-[#92400E]'
            }`}
          >
            {isOnline ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
            <span>{isOnline ? 'الوضع المتصل (Online)' : 'الوضع غير المتصل (Offline)'}</span>
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-2 text-sm font-medium text-[#475569]">
          <div className="flex items-center gap-2 text-[#1E293B] font-bold">
            <Cloud className="w-4 h-4 text-[#4A90E2]" />
            <span>
              {syncStatus === 'synced' && lastSyncedAt
                ? 'تم حفظ ومزامنة التقدم والنجوم سحابياً ومحلياً بنجاح'
                : syncStatus === 'syncing'
                ? 'جاري مزامنة التقدم مع السحابة...'
                : isOnline
                ? 'التقدم محفوظ محلياً وجاهز للمزامنة السحابية'
                : 'جميع الدروس والاختبارات والنجوم محفوظة محلياً وتعمل بدون إنترنت'}
            </span>
          </div>
          <div>
            نسخة المحتوى التعليمي المحفوظة: {contentManifest?.version ?? '1.1.0'} · متاح للعمل دون
            إنترنت
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {isOnline && onManualSync && (
            <button
              type="button"
              onClick={onManualSync}
              disabled={syncStatus === 'syncing'}
              className="min-h-[48px] px-5 py-2.5 rounded-full bg-[#EFF6FF] hover:bg-[#DBEAFE] border border-[#BFDBFE] text-[#1D4ED8] text-sm font-bold inline-flex items-center gap-2 transition-colors disabled:opacity-60"
            >
              <RefreshCw className={`w-4 h-4 ${syncStatus === 'syncing' ? 'animate-spin' : ''}`} />
              <span>مزامنة التقدم وتحديث المحتوى الآن</span>
            </button>
          )}
          <PWAInstallButton />
        </div>
      </section>
    </div>
  );
};
