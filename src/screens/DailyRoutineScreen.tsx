import React from 'react';
import { Award, CheckCircle2, Clock, Moon, Play, RotateCcw, Star, Volume2 } from 'lucide-react';
import { DAILY_ROUTINE_TASKS } from '../data/rafiqExtensionsData';
import { toArabicDigits } from '../data/learningData';
import { RoutineTaskIllustration } from '../components/Illustrations';
import { playGentleTap, playSuccessChime, speakArabic } from '../utils/audio';

interface DailyRoutineScreenProps {
  routineTasks: Record<string, boolean>;
  soundEnabled: boolean;
  onToggleTask: (taskId: string, completed: boolean, starsReward: number) => void;
  onResetRoutine: () => void;
}

export const DailyRoutineScreen: React.FC<DailyRoutineScreenProps> = ({
  routineTasks,
  soundEnabled,
  onToggleTask,
  onResetRoutine,
}) => {
  const totalTasks = DAILY_ROUTINE_TASKS.length;
  const completedCount = DAILY_ROUTINE_TASKS.filter((t) => Boolean(routineTasks[t.id])).length;
  const progressPercent = Math.round((completedCount / totalTasks) * 100);
  const starsToday = DAILY_ROUTINE_TASKS.reduce(
    (sum, task) => (routineTasks[task.id] ? sum + task.starsReward : sum),
    0
  );

  // First uncompleted task is highlighted as the active current step
  const firstPendingTask = DAILY_ROUTINE_TASKS.find((t) => !routineTasks[t.id]);

  const handleCompleteToggle = (taskId: string, starsReward: number, nextState: boolean) => {
    if (nextState) {
      playSuccessChime(soundEnabled);
    } else {
      playGentleTap(soundEnabled);
    }
    onToggleTask(taskId, nextState, starsReward);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      {/* Page Title */}
      <section className="space-y-1 px-1">
        <h2 className="text-[24px] md:text-[28px] font-extrabold text-[#1E293B]">جدولي اليومي</h2>
        <p className="text-base text-[#64748B] font-medium">
          أكمل مهامك بهدوء واحصل على النجوم الذهبية 🌟
        </p>
      </section>

      {/* Progress Summary Card */}
      <section className="rafiq-card p-5 md:p-6 space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-6 h-6 text-[#4CAF50] shrink-0" />
            <span className="text-base md:text-lg font-extrabold text-[#1E293B] tabular-nums">
              مهام اليوم المنجزة: {toArabicDigits(completedCount)} من {toArabicDigits(totalTasks)}
            </span>
          </div>

          <span className="px-3 py-1 rounded-full bg-[#DCFCE7] text-[#166534] text-sm font-extrabold tabular-nums">
            {toArabicDigits(progressPercent)}٪
          </span>
        </div>

        <div className="w-full h-3.5 bg-[#E2E8F0] rounded-full overflow-hidden">
          <div
            className="h-full bg-[#4CAF50] rounded-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        <div className="rounded-2xl bg-[#FEF9C3] border border-[#FDE68A] px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-[#854D0E] font-extrabold text-base tabular-nums">
            <Star className="w-5 h-5 fill-[#FFC107] text-[#D97706]" />
            <span>مجموع نجوم اليوم: {toArabicDigits(starsToday)} نجمة</span>
          </div>

          {completedCount > 0 && (
            <button
              type="button"
              onClick={() => {
                playGentleTap(soundEnabled);
                onResetRoutine();
              }}
              className="text-xs font-bold text-[#854D0E] hover:text-[#713F12] inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-white/70 border border-[#FDE68A]"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>تصفير اليوم</span>
            </button>
          )}
        </div>
      </section>

      {/* Tasks List */}
      <section className="space-y-4" aria-label="قائمة المهام اليومية">
        {DAILY_ROUTINE_TASKS.map((task) => {
          const isCompleted = Boolean(routineTasks[task.id]);
          const isCurrent = !isCompleted && firstPendingTask?.id === task.id;
          const isSleepTask = task.iconType === 'sleep';

          return (
            <div
              key={task.id}
              className={`rafiq-card p-5 space-y-4 transition-colors ${
                isCurrent ? 'border-[#4A90E2] ring-2 ring-[#4A90E2]/15' : ''
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3.5 min-w-0">
                  <RoutineTaskIllustration iconType={task.iconType} size={58} />
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-lg md:text-xl font-extrabold text-[#1E293B]">
                        {task.title}
                      </h3>
                    </div>
                    <p className="text-sm text-[#64748B] font-medium truncate">
                      {task.subtitle} · {task.timeLabel}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2 shrink-0">
                  {isCompleted ? (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#DCFCE7] text-[#166534] text-xs font-bold">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>مكتملة</span>
                    </span>
                  ) : isCurrent ? (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#DBEAFE] text-[#1E40AF] text-xs font-bold">
                      <Clock className="w-3.5 h-3.5" />
                      <span>قيد الإنجاز</span>
                    </span>
                  ) : isSleepTask ? (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#EEF2FF] text-[#4338CA] text-xs font-bold">
                      <Moon className="w-3.5 h-3.5" />
                      <span>وقت النوم</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#F1F5F9] text-[#475569] text-xs font-bold">
                      <Clock className="w-3.5 h-3.5" />
                      <span>قادمة</span>
                    </span>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      playGentleTap(soundEnabled);
                      speakArabic(`${task.title}. ${task.subtitle}`, soundEnabled);
                    }}
                    aria-label={`استمع لمهمة ${task.title}`}
                    className="w-9 h-9 rounded-full bg-[#F1F5F9] hover:bg-[#E2E8F0] text-[#475569] flex items-center justify-center transition-colors"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {isCompleted ? (
                <div className="pt-1 flex items-center justify-between gap-3 border-t border-[#F1F5F9]">
                  <span className="text-sm font-extrabold text-[#166534] tabular-nums">
                    +{toArabicDigits(task.starsReward)} نجوم تم الحصول عليها!
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCompleteToggle(task.id, task.starsReward, false)}
                    className="text-xs font-bold text-[#64748B] hover:text-[#1E293B] px-3 py-1.5 rounded-full bg-[#F8FAFC] border border-[#E2E8F0]"
                  >
                    تراجع
                  </button>
                </div>
              ) : isCurrent ? (
                <div className="space-y-3 pt-1">
                  <div className="text-sm font-bold text-[#1E40AF] text-center tabular-nums">
                    جائزة الإكمال: +{toArabicDigits(task.starsReward)} نجوم ذهبية
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCompleteToggle(task.id, task.starsReward, true)}
                    className="w-full min-h-[54px] px-6 py-3 rounded-full bg-[#1D70B8] hover:bg-[#175B96] text-white text-base md:text-lg font-extrabold inline-flex items-center justify-center gap-2 rafiq-button-shadow transition-colors active:scale-[0.98]"
                  >
                    <CheckCircle2 className="w-5 h-5" />
                    <span>أنهيت المهمة</span>
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => handleCompleteToggle(task.id, task.starsReward, true)}
                  className="w-full min-h-[48px] px-5 py-2.5 rounded-full bg-[#F1F5F9] hover:bg-[#E2E8F0] text-[#1E293B] text-sm md:text-base font-bold inline-flex items-center justify-center gap-2 transition-colors active:scale-[0.98]"
                >
                  <Play className="w-4 h-4 text-[#4A90E2]" />
                  <span>تحديد كمكتمل (+{toArabicDigits(task.starsReward)} نجوم)</span>
                </button>
              )}
            </div>
          );
        })}
      </section>

      {/* Positive Encouragement Footer Banner */}
      <section className="rounded-3xl bg-[#DCFCE7] border-[1.5px] border-[#86EFAC] p-5 flex items-center justify-between gap-4">
        <div className="space-y-1">
          <h3 className="text-lg md:text-xl font-extrabold text-[#14532D]">
            {completedCount === totalTasks
              ? 'مذهل! أكملت كل مهامك اليوم بنجاح 🌟'
              : completedCount > 0
              ? 'أنت بطل رائع اليوم! 🏅'
              : 'يوم جديد هادئ ومليء بالإنجازات! ☀️'}
          </h3>
          <p className="text-sm md:text-base font-semibold text-[#166534]">
            {completedCount === totalTasks
              ? 'استمتع بوقتك الهادئ واستعد لغدٍ مشرق.'
              : 'اقتربت من الحصول على وسام الالتزام اليومي، استمر في التألق!'}
          </p>
        </div>
        <div className="w-12 h-12 rounded-2xl bg-white/80 text-[#16A34A] flex items-center justify-center shrink-0">
          <Award className="w-7 h-7" />
        </div>
      </section>
    </div>
  );
};
