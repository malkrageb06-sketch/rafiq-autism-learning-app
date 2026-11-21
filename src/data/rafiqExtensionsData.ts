import { ExtendedBadgeItem, LevelStage, ProgressState, RoutineTask } from '../types/rafiq';
import { toArabicDigits } from './learningData';

export const DAILY_ROUTINE_TASKS: RoutineTask[] = [
  {
    id: 'wakeup',
    title: 'الاستيقاظ',
    subtitle: 'صباح الخير والنشاط',
    timeLabel: '٧:٠٠ صباحاً',
    starsReward: 5,
    iconType: 'wakeup',
    accentColor: '#F59E0B',
    softBg: '#FEF9C3',
  },
  {
    id: 'brush',
    title: 'غسل الأسنان',
    subtitle: 'نظافة وانتعاش للأسنان',
    timeLabel: '٧:١٥ صباحاً',
    starsReward: 5,
    iconType: 'brush',
    accentColor: '#0EA5E9',
    softBg: '#E0F2FE',
  },
  {
    id: 'eat',
    title: 'تناول الطعام',
    subtitle: 'وجبة الإفطار اللذيذة',
    timeLabel: '٧:٣٠ صباحاً',
    starsReward: 5,
    iconType: 'eat',
    accentColor: '#4CAF50',
    softBg: '#DCFCE7',
  },
  {
    id: 'study',
    title: 'الدراسة',
    subtitle: 'وقت الواجبات الممتعة',
    timeLabel: '٤:٠٠ عصراً',
    starsReward: 5,
    iconType: 'study',
    accentColor: '#4A90E2',
    softBg: '#EFF6FF',
  },
  {
    id: 'learn',
    title: 'وقت التعلم',
    subtitle: 'تمارين وألعاب التفكير',
    timeLabel: '٥:٠٠ عصراً',
    starsReward: 5,
    iconType: 'learn',
    accentColor: '#8B5CF6',
    softBg: '#F3E8FF',
  },
  {
    id: 'sleep',
    title: 'النوم',
    subtitle: 'أحلام سعيدة ونوم هادئ',
    timeLabel: '٨:٣٠ مساءً',
    starsReward: 5,
    iconType: 'sleep',
    accentColor: '#6366F1',
    softBg: '#EEF2FF',
  },
];

export const SUGGESTED_RAFIQ_QUESTIONS: {
  id: string;
  emoji: string;
  question: string;
}[] = [
  {
    id: 'egypt-capital',
    emoji: '🇪🇬',
    question: 'ما هي عاصمة مصر؟',
  },
  {
    id: 'days',
    emoji: '📅',
    question: 'كم عدد أيام الأسبوع؟',
  },
  {
    id: 'rainbow',
    emoji: '🌈',
    question: 'ما هي ألوان قوس قزح؟',
  },
];

export const LEVEL_STAGES: LevelStage[] = [
  {
    level: 1,
    title: 'مبتدئ رفيق',
    subtitle: 'بداية الرحلة والتعرف على التطبيق',
    minXp: 0,
    nextXp: 50,
    badgeLabel: 'المستوى الأول',
  },
  {
    level: 2,
    title: 'متعلم صغير',
    subtitle: 'خطوات واثقة في إتمام المهام اليومية',
    minXp: 50,
    nextXp: 120,
    badgeLabel: 'المستوى الثاني',
  },
  {
    level: 3,
    title: 'مستكشف شجاع',
    subtitle: 'اكتشاف أصوات وكلمات جديدة بلطف',
    minXp: 120,
    nextXp: 220,
    badgeLabel: 'المستوى الثالث',
  },
  {
    level: 4,
    title: 'بطل التعلم',
    subtitle: 'تفاعل هادئ وإيجابي مع الجداول والدروس',
    minXp: 220,
    nextXp: 350,
    badgeLabel: 'المستوى الرابع',
  },
  {
    level: 5,
    title: 'نجم رفيق المميز',
    subtitle: 'أنت تبلي بلاءً رائعاً وصبوراً كل يوم!',
    minXp: 350,
    nextXp: 500,
    badgeLabel: 'المستوى الخامس النشط',
  },
];

export function computeUserXpAndLevel(progress: ProgressState) {
  const lessonsDone = Object.values(progress.completedLessons).filter(Boolean).length;
  const quizzesDone = Object.values(progress.completedQuizzes).filter(Boolean).length;
  const routineDone = Object.values(progress.routineTasks).filter(Boolean).length;
  const intermediateDone = Object.values(progress.moduleTiers ?? {}).filter(
    (t) => t?.intermediateCompleted
  ).length;
  const advancedDone = Object.values(progress.moduleTiers ?? {}).filter(
    (t) => t?.advancedCompleted
  ).length;

  const xp =
    progress.stars * 2 +
    lessonsDone * 15 +
    quizzesDone * 25 +
    intermediateDone * 30 +
    advancedDone * 45 +
    routineDone * 10 +
    progress.aiQuestionsAsked * 5;

  let currentStage = LEVEL_STAGES[0];
  for (const stage of LEVEL_STAGES) {
    if (xp >= stage.minXp) {
      currentStage = stage;
    }
  }

  const span = Math.max(1, currentStage.nextXp - currentStage.minXp);
  const gainedInStage = Math.max(0, xp - currentStage.minXp);
  const stagePercent = Math.min(100, Math.round((gainedInStage / span) * 100));
  const remainingToNext = Math.max(0, currentStage.nextXp - xp);

  return {
    xp,
    currentStage,
    stagePercent,
    remainingToNext,
  };
}

export function computeExtendedBadges(progress: ProgressState): ExtendedBadgeItem[] {
  const lessonsCount = Object.values(progress.completedLessons).filter(Boolean).length;
  const quizzesCount = Object.values(progress.completedQuizzes).filter(Boolean).length;
  const routineDone = Object.values(progress.routineTasks).filter(Boolean).length;
  const intermediateCount = Object.values(progress.moduleTiers ?? {}).filter(
    (t) => t?.intermediateCompleted
  ).length;
  const advancedCount = Object.values(progress.moduleTiers ?? {}).filter(
    (t) => t?.advancedCompleted
  ).length;

  return [
    {
      id: 'colors-hero',
      title: 'بطل الألوان',
      description: 'ميّز جميع الألوان الأساسية والتحديات',
      requirementText: progress.moduleTiers?.colors?.advancedCompleted
        ? 'وسام الإتقان الذهبي'
        : progress.completedQuizzes.colors
        ? 'وسام المستوى الأول'
        : 'أكمل اختبار الألوان',
      unlocked: progress.completedQuizzes.colors,
      accentColor: '#F59E0B',
      iconType: 'colors',
    },
    {
      id: 'shapes-hero',
      title: 'بطل الأشكال',
      description: 'تعرّف على الأشكال الهندسية وخصائصها',
      requirementText: progress.moduleTiers?.shapes?.advancedCompleted
        ? 'وسام الإتقان الذهبي'
        : progress.completedQuizzes.shapes
        ? 'وسام المستوى الأول'
        : 'أكمل اختبار الأشكال',
      unlocked: progress.completedQuizzes.shapes,
      accentColor: '#4A90E2',
      iconType: 'shapes',
    },
    {
      id: 'numbers-hero',
      title: 'بطل الأرقام',
      description: 'عدّ الأشياء وحل تحديات الجمع البسيطة',
      requirementText: progress.moduleTiers?.numbers?.advancedCompleted
        ? 'وسام الإتقان الذهبي'
        : progress.completedQuizzes.numbers
        ? 'وسام المستوى الأول'
        : 'أكمل اختبار الأرقام',
      unlocked: progress.completedQuizzes.numbers,
      accentColor: '#EA580C',
      iconType: 'numbers',
    },
    {
      id: 'emotions-hero',
      title: 'بطل المشاعر',
      description: 'التعبير عن المشاعر اليومية والتهدئة',
      requirementText: progress.moduleTiers?.emotions?.advancedCompleted
        ? 'وسام الإتقان الذهبي'
        : progress.completedQuizzes.emotions
        ? 'وسام المستوى الأول'
        : 'أكمل اختبار المشاعر',
      unlocked: progress.completedQuizzes.emotions,
      accentColor: '#4CAF50',
      iconType: 'emotions',
    },
    {
      id: 'intermediate-explorer',
      title: 'مستكشف المستوى الثاني',
      description: 'افتح وأكمل أي اختبار من المستوى المتوسط',
      requirementText:
        intermediateCount >= 1
          ? `أكملت ${toArabicDigits(intermediateCount)} من ٤ مستويات متوسطة`
          : 'أكمل المستوى الثاني في أي قسم',
      unlocked: intermediateCount >= 1,
      accentColor: '#6366F1',
      iconType: 'learner',
    },
    {
      id: 'star-of-week',
      title: 'بطل التحديات المتقدمة',
      description: 'أكمل التحدي المتقدم (المستوى ٣) أو اجمع ٦٠ نجمة',
      requirementText:
        advancedCount >= 1 || progress.stars >= 60 || quizzesCount >= 3 || routineDone >= 4 || lessonsCount >= 4
          ? 'وسام التحدي الاستثنائي'
          : `أكمل تحدياً متقدماً أو اجمع ${toArabicDigits(60)} نجمة`,
      unlocked: advancedCount >= 1 || progress.stars >= 60 || quizzesCount >= 3 || routineDone >= 4,
      accentColor: '#0EA5E9',
      iconType: 'star',
    },
  ];
}

export interface DayActivityPoint {
  id: string;
  label: string;
  percent: number;
  lessonsCount: number;
  routineCount: number;
  starsEarned: number;
  isToday?: boolean;
}

export function buildActivitySeries(
  progress: ProgressState,
  timeframe: 'week' | 'month'
): DayActivityPoint[] {
  const routineDone = Object.values(progress.routineTasks).filter(Boolean).length;
  const lessonsDone = Object.values(progress.completedLessons).filter(Boolean).length;
  const quizzesDone = Object.values(progress.completedQuizzes).filter(Boolean).length;

  const todayPercent = Math.max(
    25,
    Math.min(100, Math.round(((routineDone + lessonsDone + quizzesDone) / 14) * 100))
  );

  if (timeframe === 'month') {
    return [
      { id: 'w1', label: 'الأسبوع ١', percent: 62, lessonsCount: 2, routineCount: 4, starsEarned: 25 },
      { id: 'w2', label: 'الأسبوع ٢', percent: 74, lessonsCount: 3, routineCount: 5, starsEarned: 35 },
      { id: 'w3', label: 'الأسبوع ٣', percent: 81, lessonsCount: 3, routineCount: 5, starsEarned: 40 },
      {
        id: 'w4',
        label: 'هذا الأسبوع',
        percent: Math.max(todayPercent, 48),
        lessonsCount: lessonsDone,
        routineCount: routineDone,
        starsEarned: progress.stars,
        isToday: true,
      },
    ];
  }

  return [
    { id: 'sat', label: 'سبت', percent: 72, lessonsCount: 2, routineCount: 4, starsEarned: 20 },
    { id: 'sun', label: 'أحد', percent: 85, lessonsCount: 3, routineCount: 5, starsEarned: 30 },
    { id: 'mon', label: 'إثنين', percent: 68, lessonsCount: 2, routineCount: 4, starsEarned: 20 },
    { id: 'tue', label: 'ثلاثاء', percent: 79, lessonsCount: 3, routineCount: 5, starsEarned: 25 },
    { id: 'wed', label: 'أربعاء', percent: 88, lessonsCount: 4, routineCount: 5, starsEarned: 35 },
    { id: 'thu', label: 'خميس', percent: 76, lessonsCount: 2, routineCount: 5, starsEarned: 25 },
    {
      id: 'fri',
      label: 'اليوم',
      percent: todayPercent,
      lessonsCount: lessonsDone,
      routineCount: routineDone,
      starsEarned: routineDone * 5 + quizzesDone * 10,
      isToday: true,
    },
  ];
}
