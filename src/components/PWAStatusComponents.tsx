import React, { useState } from 'react';
import { Cloud, Download, RefreshCw, Share, WifiOff } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { SyncStatus } from '../hooks/useOnlineStatus';

interface PWAInstallButtonProps {
  compact?: boolean;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({ compact = false }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  if (isInstalled) {
    return null;
  }

  if (isInstallable) {
    return (
      <button
        type="button"
        onClick={() => void install()}
        className={
          compact
            ? 'min-h-[40px] px-3 rounded-full bg-[#EFF6FF] hover:bg-[#DBEAFE] border border-[#BFDBFE] text-[#1D4ED8] text-xs font-bold inline-flex items-center gap-1.5 transition-colors shrink-0'
            : 'min-h-[48px] px-5 py-2.5 rounded-full bg-[#4A90E2] hover:bg-[#3B7FD0] text-white text-sm md:text-base font-bold inline-flex items-center justify-center gap-2 rafiq-button-shadow transition-colors'
        }
        aria-label="تثبيت تطبيق رفيق"
      >
        <Download className="w-4 h-4 shrink-0" />
        <span>{compact ? 'تثبيت' : 'تثبيت التطبيق للعمل بدون إنترنت'}</span>
      </button>
    );
  }

  if (isIOS) {
    return (
      <>
        <button
          type="button"
          onClick={() => setShowIOSGuide(true)}
          className={
            compact
              ? 'min-h-[40px] px-3 rounded-full bg-[#EFF6FF] hover:bg-[#DBEAFE] border border-[#BFDBFE] text-[#1D4ED8] text-xs font-bold inline-flex items-center gap-1.5 transition-colors shrink-0'
              : 'min-h-[48px] px-5 py-2.5 rounded-full bg-[#EFF6FF] hover:bg-[#DBEAFE] border border-[#BFDBFE] text-[#1D4ED8] text-sm font-bold inline-flex items-center justify-center gap-2 transition-colors'
          }
        >
          <Share className="w-4 h-4 shrink-0" />
          <span>{compact ? 'تثبيت' : 'إضافة إلى الشاشة الرئيسية'}</span>
        </button>

        {showIOSGuide && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4"
            dir="rtl"
          >
            <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-xl space-y-4 text-right border border-[#E2E8F0]">
              <h3 className="text-lg font-extrabold text-[#1E293B]">تثبيت تطبيق رفيق على الجهاز</h3>
              <p className="text-sm font-medium text-[#475569] leading-relaxed">
                ١. اضغط على زر <strong>المشاركة (Share)</strong> في شريط متصفح Safari.
                <br />
                ٢. اختر <strong>إضافة إلى الشاشة الرئيسية (Add to Home Screen)</strong> لتشغيل
                التطبيق في أي وقت بدون إنترنت.
              </p>
              <button
                type="button"
                onClick={() => setShowIOSGuide(false)}
                className="w-full min-h-[46px] rounded-full bg-[#4A90E2] hover:bg-[#3B7FD0] text-white text-sm font-bold transition-colors"
              >
                حسناً
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};

interface OfflineIndicatorProps {
  isOnline: boolean;
  syncStatus: SyncStatus;
  contentUpdatedNotice?: boolean;
}

export const OfflineIndicator: React.FC<OfflineIndicatorProps> = ({
  isOnline,
  syncStatus,
  contentUpdatedNotice = false,
}) => {
  if (!isOnline) {
    return (
      <div
        dir="rtl"
        role="status"
        className="fixed bottom-20 md:bottom-4 left-4 z-50 flex items-center gap-2 rounded-full bg-[#FFFBEB] border border-[#FCD34D] px-3.5 py-2 text-xs font-bold text-[#92400E] shadow-md"
      >
        <WifiOff className="w-4 h-4 text-[#D97706] shrink-0" />
        <span>أنت تعمل حالياً بدون اتصال بالإنترنت</span>
      </div>
    );
  }

  if (contentUpdatedNotice) {
    return (
      <div
        dir="rtl"
        role="status"
        className="fixed bottom-20 md:bottom-4 left-4 z-50 flex items-center gap-2 rounded-full bg-[#ECFDF5] border border-[#6EE7B7] px-3.5 py-2 text-xs font-bold text-[#065F46] shadow-md"
      >
        <RefreshCw className="w-4 h-4 text-[#059669] shrink-0" />
        <span>تم تحديث المحتوى التعليمي ومزامنة التقدم</span>
      </div>
    );
  }

  if (syncStatus === 'syncing') {
    return (
      <div
        dir="rtl"
        role="status"
        className="fixed bottom-20 md:bottom-4 left-4 z-50 flex items-center gap-2 rounded-full bg-[#EFF6FF] border border-[#BFDBFE] px-3.5 py-2 text-xs font-bold text-[#1D4ED8] shadow-sm"
      >
        <Cloud className="w-4 h-4 animate-pulse shrink-0" />
        <span>جاري مزامنة التقدم...</span>
      </div>
    );
  }

  return null;
};
