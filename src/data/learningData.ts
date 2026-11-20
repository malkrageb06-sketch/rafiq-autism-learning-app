import {
  BadgeItem,
  ColorItem,
  EmotionItem,
  NumberItem,
  ProgressState,
  QuizQuestion,
  ShapeItem,
} from '../types/rafiq';

export const COLORS_DATA: ColorItem[] = [
  {
    id: 'red',
    name: 'أحمر',
    hex: '#E5534B',
    softBg: '#FEF2F2',
    borderColor: '#FECACA',
    textColor: '#991B1B',
    exampleLabel: 'تفاحة حمراء · فراولة',
    description: 'لون دافئ ومشرق نراه في التفاح والفراولة.',
  },
  {
    id: 'green',
    name: 'أخضر',
    hex: '#4CAF50',
    softBg: '#F0FDF4',
    borderColor: '#BBF7D0',
    textColor: '#166534',
    exampleLabel: 'شجرة خضراء · ورقة شجر',
    description: 'لون الطبيعة الهادئ نراه في الأشجار والأوراق.',
  },
  {
    id: 'blue',
    name: 'أزرق',
    hex: '#4A90E2',
    softBg: '#EFF6FF',
    borderColor: '#BFDBFE',
    textColor: '#1E40AF',
    exampleLabel: 'سماء زرقاء · حوت لطيف',
    description: 'لون صافٍ ومريح نراه في السماء والبحر.',
  },
  {
    id: 'yellow',
    name: 'أصفر',
    hex: '#F5B800',
    softBg: '#FEFCE8',
    borderColor: '#FDE68A',
    textColor: '#854D0E',
    exampleLabel: 'شمس مشرقة · موزة',
    description: 'لون مبهج نراه في الشمس والموز والنجوم.',
  },
];

export const COLORS_QUIZ: QuizQuestion[] = [
  {
    id: 'color-q1',
    prompt: 'اختر اللون الأحمر',
    correctId: 'red',
    options: [
      { id: 'red', label: 'أحمر' },
      { id: 'blue', label: 'أزرق' },
      { id: 'green', label: 'أخضر' },
      { id: 'yellow', label: 'أصفر' },
    ],
  },
  {
    id: 'color-q2',
    prompt: 'اختر اللون الأزرق',
    correctId: 'blue',
    options: [
      { id: 'yellow', label: 'أصفر' },
      { id: 'blue', label: 'أزرق' },
      { id: 'red', label: 'أحمر' },
      { id: 'green', label: 'أخضر' },
    ],
  },
  {
    id: 'color-q3',
    prompt: 'اختر اللون الأخضر',
    correctId: 'green',
    options: [
      { id: 'red', label: 'أحمر' },
      { id: 'yellow', label: 'أصفر' },
      { id: 'green', label: 'أخضر' },
      { id: 'blue', label: 'أزرق' },
    ],
  },
  {
    id: 'color-q4',
    prompt: 'اختر اللون الأصفر',
    correctId: 'yellow',
    options: [
      { id: 'green', label: 'أخضر' },
      { id: 'red', label: 'أحمر' },
      { id: 'blue', label: 'أزرق' },
      { id: 'yellow', label: 'أصفر' },
    ],
  },
];

export const SHAPES_DATA: ShapeItem[] = [
  {
    id: 'circle',
    name: 'دائرة',
    symbol: '○',
    accentColor: '#4A90E2',
    softBg: '#EFF6FF',
    exampleLabel: 'كرة · ساعة حائط',
    description: 'شكل مستدير ناعم بلا زوايا، مثل الكرة والشمس.',
  },
  {
    id: 'square',
    name: 'مربع',
    symbol: '□',
    accentColor: '#4CAF50',
    softBg: '#F0FDF4',
    exampleLabel: 'صندوق هدايا · نافذة',
    description: 'له أربعة أضلاع متساوية تماماً، مثل صندوق الهدايا.',
  },
  {
    id: 'triangle',
    name: 'مثلث',
    symbol: '△',
    accentColor: '#F59E0B',
    softBg: '#FFFBEB',
    exampleLabel: 'خيمة · هرم صغير',
    description: 'له ثلاثة أضلاع وثلاث زوايا، مثل الخيمة والهرم.',
  },
  {
    id: 'rectangle',
    name: 'مستطيل',
    symbol: '▭',
    accentColor: '#7C69EF',
    softBg: '#F5F3FF',
    exampleLabel: 'كتاب · باب الغرفة',
    description: 'له أربعة أضلاع؛ ضلعان طويلان وضلعان قصيران، مثل الكتاب.',
  },
];

export const SHAPES_QUIZ: QuizQuestion[] = [
  {
    id: 'shape-q1',
    prompt: 'اختر المثلث',
    correctId: 'triangle',
    options: [
      { id: 'circle', label: 'دائرة' },
      { id: 'triangle', label: 'مثلث' },
      { id: 'square', label: 'مربع' },
      { id: 'rectangle', label: 'مستطيل' },
    ],
  },
  {
    id: 'shape-q2',
    prompt: 'اختر الدائرة',
    correctId: 'circle',
    options: [
      { id: 'square', label: 'مربع' },
      { id: 'circle', label: 'دائرة' },
      { id: 'rectangle', label: 'مستطيل' },
      { id: 'triangle', label: 'مثلث' },
    ],
  },
  {
    id: 'shape-q3',
    prompt: 'اختر المربع',
    correctId: 'square',
    options: [
      { id: 'triangle', label: 'مثلث' },
      { id: 'rectangle', label: 'مستطيل' },
      { id: 'square', label: 'مربع' },
      { id: 'circle', label: 'دائرة' },
    ],
  },
  {
    id: 'shape-q4',
    prompt: 'اختر المستطيل',
    correctId: 'rectangle',
    options: [
      { id: 'circle', label: 'دائرة' },
      { id: 'square', label: 'مربع' },
      { id: 'triangle', label: 'مثلث' },
      { id: 'rectangle', label: 'مستطيل' },
    ],
  },
];

export const NUMBERS_DATA: NumberItem[] = [
  {
    value: 1,
    arabicDigit: '١',
    name: 'واحد',
    objectType: 'apple',
    objectPlural: 'تفاحة واحدة',
    accentColor: '#E5534B',
    softBg: '#FEF2F2',
  },
  {
    value: 2,
    arabicDigit: '٢',
    name: 'اثنان',
    objectType: 'ball',
    objectPlural: 'كرتان ملونتان',
    accentColor: '#4A90E2',
    softBg: '#EFF6FF',
  },
  {
    value: 3,
    arabicDigit: '٣',
    name: 'ثلاثة',
    objectType: 'duck',
    objectPlural: 'ثلاث بطات ألعاب',
    accentColor: '#F59E0B',
    softBg: '#FFFBEB',
  },
  {
    value: 4,
    arabicDigit: '٤',
    name: 'أربعة',
    objectType: 'orange',
    objectPlural: 'أربع برتقالات',
    accentColor: '#EA580C',
    softBg: '#FFF7ED',
  },
  {
    value: 5,
    arabicDigit: '٥',
    name: 'خمسة',
    objectType: 'block',
    objectPlural: 'خمسة مكعبات',
    accentColor: '#4CAF50',
    softBg: '#F0FDF4',
  },
];

export const NUMBERS_QUIZ: QuizQuestion[] = [
  {
    id: 'num-q1',
    prompt: 'كم تفاحة ترى؟',
    correctId: '3',
    countingDisplay: {
      objectType: 'apple',
      count: 3,
    },
    options: [
      { id: '1', label: '١' },
      { id: '2', label: '٢' },
      { id: '3', label: '٣' },
      { id: '4', label: '٤' },
    ],
  },
  {
    id: 'num-q2',
    prompt: 'كم كرة ترى؟',
    correctId: '2',
    countingDisplay: {
      objectType: 'ball',
      count: 2,
    },
    options: [
      { id: '1', label: '١' },
      { id: '2', label: '٢' },
      { id: '3', label: '٣' },
      { id: '5', label: '٥' },
    ],
  },
  {
    id: 'num-q3',
    prompt: 'كم مكعباً ترى؟',
    correctId: '5',
    countingDisplay: {
      objectType: 'block',
      count: 5,
    },
    options: [
      { id: '2', label: '٢' },
      { id: '3', label: '٣' },
      { id: '4', label: '٤' },
      { id: '5', label: '٥' },
    ],
  },
  {
    id: 'num-q4',
    prompt: 'كم برتقالة ترى؟',
    correctId: '4',
    countingDisplay: {
      objectType: 'orange',
      count: 4,
    },
    options: [
      { id: '1', label: '١' },
      { id: '3', label: '٣' },
      { id: '4', label: '٤' },
      { id: '5', label: '٥' },
    ],
  },
];

export const EMOTIONS_DATA: EmotionItem[] = [
  {
    id: 'happy',
    name: 'سعيد',
    emoji: '😊',
    accentColor: '#4CAF50',
    softBg: '#F0FDF4',
    description: 'نبتسم وتشرق وجوهنا عندما نلعب أو ننجز شيئاً نحبه.',
    tip: 'ابتسامة دافئة ومشاعر مريحة',
  },
  {
    id: 'sad',
    name: 'حزين',
    emoji: '😢',
    accentColor: '#4A90E2',
    softBg: '#EFF6FF',
    description: 'نشعر بالحزن أحياناً عندما نفقد لعبة أو نشتاق لأحد.',
    tip: 'لا بأس أن نعبر عن حزننا بهدوء',
  },
  {
    id: 'worried',
    name: 'قلق',
    emoji: '😟',
    accentColor: '#FFA726',
    softBg: '#FFF7ED',
    description: 'نشعر بالقلق عندما نرى شيئاً جديداً أو غير مألوف.',
    tip: 'نأخذ نفساً عميقاً ونطلب المساعدة',
  },
  {
    id: 'tired',
    name: 'متعب',
    emoji: '😴',
    accentColor: '#6366F1',
    softBg: '#EEF2FF',
    description: 'نشعر بالتعب بعد اللعب الطويل ونحتاج إلى الراحة والنوم.',
    tip: 'الراحة الهادئة تعيد لنا النشاط',
  },
];

export const EMOTIONS_QUIZ: QuizQuestion[] = [
  {
    id: 'emo-q1',
    prompt: 'من يبدو سعيداً؟',
    correctId: 'happy',
    options: [
      { id: 'happy', label: 'سعيد' },
      { id: 'sad', label: 'حزين' },
      { id: 'worried', label: 'قلق' },
      { id: 'tired', label: 'متعب' },
    ],
  },
  {
    id: 'emo-q2',
    prompt: 'من يبدو حزيناً؟',
    correctId: 'sad',
    options: [
      { id: 'worried', label: 'قلق' },
      { id: 'sad', label: 'حزين' },
      { id: 'happy', label: 'سعيد' },
      { id: 'tired', label: 'متعب' },
    ],
  },
  {
    id: 'emo-q3',
    prompt: 'من يبدو متعباً؟',
    correctId: 'tired',
    options: [
      { id: 'happy', label: 'سعيد' },
      { id: 'tired', label: 'متعب' },
      { id: 'sad', label: 'حزين' },
      { id: 'worried', label: 'قلق' },
    ],
  },
  {
    id: 'emo-q4',
    prompt: 'من يبدو قلقاً؟',
    correctId: 'worried',
    options: [
      { id: 'sad', label: 'حزين' },
      { id: 'happy', label: 'سعيد' },
      { id: 'worried', label: 'قلق' },
      { id: 'tired', label: 'متعب' },
    ],
  },
];

export function computeBadges(progress: ProgressState): BadgeItem[] {
  const lessonsCount = Object.values(progress.completedLessons).filter(Boolean).length;
  const quizzesCount = Object.values(progress.completedQuizzes).filter(Boolean).length;

  return [
    {
      id: 'little-learner',
      title: 'متعلم صغير',
      description: 'أكمل أول درس تعليمي أو اختبار بنجاح',
      requirementText: lessonsCount >= 1 || quizzesCount >= 1 ? 'مكتمل' : 'أكمل درساً واحداً للفتح',
      unlocked: lessonsCount >= 1 || quizzesCount >= 1 || progress.stars >= 10,
      accentColor: '#4A90E2',
      iconType: 'learner',
    },
    {
      id: 'colors-hero',
      title: 'بطل الألوان',
      description: 'أكمل اختبار تعلم الألوان بنجاح',
      requirementText: progress.completedQuizzes.colors ? 'مكتمل' : 'أكمل اختبار الألوان للفتح',
      unlocked: progress.completedQuizzes.colors,
      accentColor: '#4CAF50',
      iconType: 'colors',
    },
    {
      id: 'numbers-hero',
      title: 'بطل الأرقام',
      description: 'أكمل اختبار تعلم الأرقام بنجاح',
      requirementText: progress.completedQuizzes.numbers ? 'مكتمل' : 'أكمل اختبار الأرقام للفتح',
      unlocked: progress.completedQuizzes.numbers,
      accentColor: '#EA580C',
      iconType: 'numbers',
    },
    {
      id: 'star-of-week',
      title: 'نجم الأسبوع',
      description: 'اجمع ٦٠ نجمة أو أكمل ٣ اختبارات',
      requirementText:
        progress.stars >= 60 || quizzesCount >= 3 ? 'مكتمل' : 'اجمع ٦٠ نجمة للفتح',
      unlocked: progress.stars >= 60 || quizzesCount >= 3,
      accentColor: '#FFC107',
      iconType: 'star',
    },
  ];
}

export function computeOverallProgress(progress: ProgressState): number {
  const lessonsDone = Object.values(progress.completedLessons).filter(Boolean).length;
  const quizzesDone = Object.values(progress.completedQuizzes).filter(Boolean).length;
  const totalSteps = 8; // 4 lessons + 4 quizzes
  return Math.min(100, Math.round(((lessonsDone + quizzesDone) / totalSteps) * 100));
}

export function toArabicDigits(num: number): string {
  const arabicNumerals = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  return String(num)
    .split('')
    .map((ch) => (/\d/.test(ch) ? arabicNumerals[Number(ch)] : ch))
    .join('');
}
