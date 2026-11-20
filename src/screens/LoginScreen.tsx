import React, { useState } from 'react';
import { Eye, EyeOff, Lock, Mail, User } from 'lucide-react';
import { RafiqLogo } from '../components/Illustrations';
import { UserAccount } from '../types/rafiq';

interface LoginScreenProps {
  onAuthenticate: (user: UserAccount) => void;
  onBackToSplash: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onAuthenticate, onBackToSplash }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [childName, setChildName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const trimmedEmail = email.trim();
    if (!trimmedEmail || !trimmedEmail.includes('@')) {
      setErrorMsg('يرجى إدخال بريد إلكتروني صحيح.');
      return;
    }
    if (password.trim().length < 4) {
      setErrorMsg('يرجى إدخال كلمة مرور لا تقل عن ٤ أحرف.');
      return;
    }
    if (isSignUp && childName.trim().length < 2) {
      setErrorMsg('يرجى كتابة اسم الطفل للترحيب به داخل التطبيق.');
      return;
    }

    const derivedName =
      childName.trim() || trimmedEmail.split('@')[0].replace(/[._-]/g, ' ') || 'صديقي';

    onAuthenticate({
      name: derivedName,
      email: trimmedEmail,
      ageGroup: '٤ - ١٠ سنوات',
      isGuest: false,
    });
  };

  const handleGuestStart = () => {
    onAuthenticate({
      name: 'بطل رفيق',
      email: 'parent@rafiq.app',
      ageGroup: '٤ - ١٠ سنوات',
      isGuest: true,
    });
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-lg rafiq-card p-6 sm:p-10 space-y-7">
        <div className="flex flex-col items-center text-center space-y-3">
          <button
            type="button"
            onClick={onBackToSplash}
            className="rounded-2xl p-1 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4A90E2]"
            aria-label="العودة لشاشة البداية"
          >
            <RafiqLogo size="md" />
          </button>
          <h1 className="text-[24px] md:text-[28px] font-bold text-[#1E293B]">
            {isSignUp ? 'إنشاء حساب جديد' : 'تسجيل الدخول'}
          </h1>
          <p className="text-base text-[#64748B] font-medium">
            {isSignUp
              ? 'أنشئ ملفاً آمناً لحفظ نجوم الطفل وتقدمه التعليمي'
              : 'أهلاً بولي الأمر، سجّل الدخول لمتابعة رحلة التعلم'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          {isSignUp && (
            <div className="space-y-2">
              <label htmlFor="child-name" className="block text-base font-bold text-[#1E293B]">
                اسم الطفل
              </label>
              <div className="relative">
                <User className="w-5 h-5 text-[#64748B] absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="child-name"
                  type="text"
                  value={childName}
                  onChange={(e) => setChildName(e.target.value)}
                  placeholder="مثال: آدم أو سارة"
                  className="w-full min-h-[54px] pr-12 pl-4 rounded-2xl border-[1.5px] border-[#CBD5E1] bg-white text-base font-medium text-[#1E293B] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#4A90E2] transition-colors"
                />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <label htmlFor="login-email" className="block text-base font-bold text-[#1E293B]">
              البريد الإلكتروني
            </label>
            <div className="relative">
              <Mail className="w-5 h-5 text-[#64748B] absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                id="login-email"
                type="email"
                dir="ltr"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full min-h-[54px] pr-12 pl-4 rounded-2xl border-[1.5px] border-[#CBD5E1] bg-white text-base font-medium text-[#1E293B] placeholder:text-[#94A3B8] text-right focus:outline-none focus:border-[#4A90E2] transition-colors"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="login-password" className="block text-base font-bold text-[#1E293B]">
              كلمة المرور
            </label>
            <div className="relative">
              <Lock className="w-5 h-5 text-[#64748B] absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                dir="ltr"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full min-h-[54px] pr-12 pl-12 rounded-2xl border-[1.5px] border-[#CBD5E1] bg-white text-base font-medium text-[#1E293B] placeholder:text-[#94A3B8] text-right focus:outline-none focus:border-[#4A90E2] transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="min-h-[44px] min-w-[44px] absolute left-2 top-1/2 -translate-y-1/2 flex items-center justify-center text-[#64748B] hover:text-[#1E293B] rounded-xl focus-visible:outline-2 focus-visible:outline-[#4A90E2]"
                aria-label={showPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {errorMsg && (
            <div
              role="alert"
              className="p-3.5 rounded-2xl bg-[#FFF7ED] border border-[#FDBA74] text-[#9A3412] text-sm font-semibold"
            >
              {errorMsg}
            </div>
          )}

          <div className="space-y-3 pt-2">
            <button
              type="submit"
              className="w-full min-h-[60px] px-6 py-3.5 rounded-full bg-[#4A90E2] hover:bg-[#3B7FD0] text-white text-lg font-bold rafiq-button-shadow transition-all duration-200 active:scale-[0.97] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4A90E2]"
            >
              {isSignUp ? 'إنشاء حساب جديد' : 'تسجيل الدخول'}
            </button>

            <button
              type="button"
              onClick={() => {
                setIsSignUp((prev) => !prev);
                setErrorMsg('');
              }}
              className="w-full min-h-[56px] px-6 py-3 rounded-full bg-[#EFF6FF] hover:bg-[#DBEAFE] text-[#1E40AF] text-lg font-semibold border border-[#BFDBFE] transition-colors duration-200 active:scale-[0.97] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4A90E2]"
            >
              {isSignUp ? 'لدي حساب بالفعل · تسجيل الدخول' : 'إنشاء حساب جديد'}
            </button>
          </div>
        </form>

        <div className="pt-2 border-t border-[#E2E8F0] text-center">
          <button
            type="button"
            onClick={handleGuestStart}
            className="min-h-[44px] px-4 text-base font-semibold text-[#4A90E2] hover:text-[#1E40AF] underline underline-offset-4 transition-colors"
          >
            الدخول السريع للطفل بدون حساب
          </button>
        </div>
      </div>
    </div>
  );
};
