import { ModuleKey, ProgressiveQuizQuestion, QuizTier } from '../types/rafiq';

export interface QuizTierConfig {
  tier: QuizTier;
  levelNumber: number;
  title: string;
  subtitle: string;
  starsPerQuestion: number;
  completionBonusStars: number;
  accentColor: string;
  softBg: string;
  borderColor: string;
}

export const QUIZ_TIER_CONFIGS: QuizTierConfig[] = [
  {
    tier: 'beginner',
    levelNumber: 1,
    title: 'المستوى الأول: مبتدئ',
    subtitle: 'التعرّف الأساسي على المفاهيم المصورة',
    starsPerQuestion: 10,
    completionBonusStars: 15,
    accentColor: '#4A90E2',
    softBg: '#EFF6FF',
    borderColor: '#BFDBFE',
  },
  {
    tier: 'intermediate',
    levelNumber: 2,
    title: 'المستوى الثاني: متوسط',
    subtitle: 'ربط المفاهيم بأمثلة الحياة اليومية',
    starsPerQuestion: 12,
    completionBonusStars: 20,
    accentColor: '#4CAF50',
    softBg: '#F0FDF4',
    borderColor: '#BBF7D0',
  },
  {
    tier: 'advanced',
    levelNumber: 3,
    title: 'المستوى الثالث: التحديات المتقدمة',
    subtitle: 'التفكير الذكي والمقارنة والتمييز المتقدم',
    starsPerQuestion: 15,
    completionBonusStars: 30,
    accentColor: '#D97706',
    softBg: '#FEFCE8',
    borderColor: '#FDE68A',
  },
];

const COLORS_PROGRESSIVE_QUESTIONS: ProgressiveQuizQuestion[] = [
  // Level 1: Beginner (4)
  {
    id: 'col-b1',
    tier: 'beginner',
    prompt: 'اختر اللون الأحمر',
    correctId: 'red',
    options: [
      { id: 'red', label: 'أحمر', visualType: 'color' },
      { id: 'blue', label: 'أزرق', visualType: 'color' },
      { id: 'green', label: 'أخضر', visualType: 'color' },
      { id: 'yellow', label: 'أصفر', visualType: 'color' },
    ],
  },
  {
    id: 'col-b2',
    tier: 'beginner',
    prompt: 'اختر اللون الأزرق',
    correctId: 'blue',
    options: [
      { id: 'yellow', label: 'أصفر', visualType: 'color' },
      { id: 'blue', label: 'أزرق', visualType: 'color' },
      { id: 'red', label: 'أحمر', visualType: 'color' },
      { id: 'green', label: 'أخضر', visualType: 'color' },
    ],
  },
  {
    id: 'col-b3',
    tier: 'beginner',
    prompt: 'اختر اللون الأخضر',
    correctId: 'green',
    options: [
      { id: 'red', label: 'أحمر', visualType: 'color' },
      { id: 'yellow', label: 'أصفر', visualType: 'color' },
      { id: 'green', label: 'أخضر', visualType: 'color' },
      { id: 'blue', label: 'أزرق', visualType: 'color' },
    ],
  },
  {
    id: 'col-b4',
    tier: 'beginner',
    prompt: 'اختر اللون الأصفر',
    correctId: 'yellow',
    options: [
      { id: 'green', label: 'أخضر', visualType: 'color' },
      { id: 'red', label: 'أحمر', visualType: 'color' },
      { id: 'blue', label: 'أزرق', visualType: 'color' },
      { id: 'yellow', label: 'أصفر', visualType: 'color' },
    ],
  },

  // Level 2: Intermediate (4)
  {
    id: 'col-i1',
    tier: 'intermediate',
    prompt: 'ما لون التفاحة الناضجة؟',
    visualPromptEmoji: '🍎',
    correctId: 'red',
    options: [
      { id: 'red', label: 'أحمر', visualType: 'color' },
      { id: 'blue', label: 'أزرق', visualType: 'color' },
      { id: 'yellow', label: 'أصفر', visualType: 'color' },
      { id: 'green', label: 'أخضر', visualType: 'color' },
    ],
  },
  {
    id: 'col-i2',
    tier: 'intermediate',
    prompt: 'ما لون السماء الصافية في النهار؟',
    visualPromptEmoji: '☁️',
    correctId: 'blue',
    options: [
      { id: 'green', label: 'أخضر', visualType: 'color' },
      { id: 'blue', label: 'أزرق', visualType: 'color' },
      { id: 'red', label: 'أحمر', visualType: 'color' },
      { id: 'yellow', label: 'أصفر', visualType: 'color' },
    ],
  },
  {
    id: 'col-i3',
    tier: 'intermediate',
    prompt: 'ما لون أوراق الأشجار في الحديقة؟',
    visualPromptEmoji: '🌳',
    correctId: 'green',
    options: [
      { id: 'yellow', label: 'أصفر', visualType: 'color' },
      { id: 'red', label: 'أحمر', visualType: 'color' },
      { id: 'green', label: 'أخضر', visualType: 'color' },
      { id: 'blue', label: 'أزرق', visualType: 'color' },
    ],
  },
  {
    id: 'col-i4',
    tier: 'intermediate',
    prompt: 'ما لون الشمس المشرقة والموز؟',
    visualPromptEmoji: '☀️',
    correctId: 'yellow',
    options: [
      { id: 'blue', label: 'أزرق', visualType: 'color' },
      { id: 'green', label: 'أخضر', visualType: 'color' },
      { id: 'red', label: 'أحمر', visualType: 'color' },
      { id: 'yellow', label: 'أصفر', visualType: 'color' },
    ],
  },

  // Level 3: Advanced Challenges (4)
  {
    id: 'col-a1',
    tier: 'advanced',
    prompt: 'أي شيء لونه أخضر مثل الشجرة؟',
    correctId: 'leaf',
    options: [
      { id: 'leaf', label: 'ورقة شجر', emoji: '🍀', visualType: 'emoji' },
      { id: 'apple', label: 'تفاحة حمراء', emoji: '🍎', visualType: 'emoji' },
      { id: 'sun', label: 'شمس مشرقة', emoji: '☀️', visualType: 'emoji' },
      { id: 'whale', label: 'حوت أزرق', emoji: '🐳', visualType: 'emoji' },
    ],
  },
  {
    id: 'col-a2',
    tier: 'advanced',
    prompt: 'أي شيء لونه أزرق مثل البحر الهادئ؟',
    correctId: 'whale',
    options: [
      { id: 'banana', label: 'موزة', emoji: '🍌', visualType: 'emoji' },
      { id: 'whale', label: 'حوت لطيف', emoji: '🐳', visualType: 'emoji' },
      { id: 'strawberry', label: 'فراولة', emoji: '🍓', visualType: 'emoji' },
      { id: 'tree', label: 'شجرة', emoji: '🌳', visualType: 'emoji' },
    ],
  },
  {
    id: 'col-a3',
    tier: 'advanced',
    prompt: 'عند مزج الأحمر مع الأصفر نحصل على لون دافئ مثل البرتقال، ما هو؟',
    visualPromptEmoji: '🍊',
    correctId: 'orange',
    options: [
      { id: 'orange', label: 'برتقالي', colorHex: '#FB923C', visualType: 'color' },
      { id: 'blue', label: 'أزرق', visualType: 'color' },
      { id: 'green', label: 'أخضر', visualType: 'color' },
      { id: 'purple', label: 'بنفسجي', colorHex: '#8B5CF6', visualType: 'color' },
    ],
  },
  {
    id: 'col-a4',
    tier: 'advanced',
    prompt: 'أي فاكهة لونها أصفر من الخارج وحلوة؟',
    correctId: 'banana',
    options: [
      { id: 'strawberry', label: 'فراولة', emoji: '🍓', visualType: 'emoji' },
      { id: 'pear', label: 'كمثرى خضراء', emoji: '🍐', visualType: 'emoji' },
      { id: 'banana', label: 'موزة صفراء', emoji: '🍌', visualType: 'emoji' },
      { id: 'cherry', label: 'كرز أحمر', emoji: '🍒', visualType: 'emoji' },
    ],
  },
];

const SHAPES_PROGRESSIVE_QUESTIONS: ProgressiveQuizQuestion[] = [
  // Level 1: Beginner (4)
  {
    id: 'shp-b1',
    tier: 'beginner',
    prompt: 'اختر المثلث',
    correctId: 'triangle',
    options: [
      { id: 'circle', label: 'دائرة', visualType: 'shape' },
      { id: 'triangle', label: 'مثلث', visualType: 'shape' },
      { id: 'square', label: 'مربع', visualType: 'shape' },
      { id: 'rectangle', label: 'مستطيل', visualType: 'shape' },
    ],
  },
  {
    id: 'shp-b2',
    tier: 'beginner',
    prompt: 'اختر الدائرة',
    correctId: 'circle',
    options: [
      { id: 'square', label: 'مربع', visualType: 'shape' },
      { id: 'circle', label: 'دائرة', visualType: 'shape' },
      { id: 'rectangle', label: 'مستطيل', visualType: 'shape' },
      { id: 'triangle', label: 'مثلث', visualType: 'shape' },
    ],
  },
  {
    id: 'shp-b3',
    tier: 'beginner',
    prompt: 'اختر المربع',
    correctId: 'square',
    options: [
      { id: 'triangle', label: 'مثلث', visualType: 'shape' },
      { id: 'rectangle', label: 'مستطيل', visualType: 'shape' },
      { id: 'square', label: 'مربع', visualType: 'shape' },
      { id: 'circle', label: 'دائرة', visualType: 'shape' },
    ],
  },
  {
    id: 'shp-b4',
    tier: 'beginner',
    prompt: 'اختر المستطيل',
    correctId: 'rectangle',
    options: [
      { id: 'circle', label: 'دائرة', visualType: 'shape' },
      { id: 'square', label: 'مربع', visualType: 'shape' },
      { id: 'triangle', label: 'مثلث', visualType: 'shape' },
      { id: 'rectangle', label: 'مستطيل', visualType: 'shape' },
    ],
  },

  // Level 2: Intermediate (4)
  {
    id: 'shp-i1',
    tier: 'intermediate',
    prompt: 'أي شكل مستدير ناعم وليس له أي زوايا؟',
    correctId: 'circle',
    options: [
      { id: 'circle', label: 'دائرة', visualType: 'shape' },
      { id: 'square', label: 'مربع', visualType: 'shape' },
      { id: 'triangle', label: 'مثلث', visualType: 'shape' },
      { id: 'rectangle', label: 'مستطيل', visualType: 'shape' },
    ],
  },
  {
    id: 'shp-i2',
    tier: 'intermediate',
    prompt: 'أي شكل له ٣ أضلاع و٣ زوايا فقط؟',
    correctId: 'triangle',
    options: [
      { id: 'square', label: 'مربع', visualType: 'shape' },
      { id: 'triangle', label: 'مثلث', visualType: 'shape' },
      { id: 'circle', label: 'دائرة', visualType: 'shape' },
      { id: 'rectangle', label: 'مستطيل', visualType: 'shape' },
    ],
  },
  {
    id: 'shp-i3',
    tier: 'intermediate',
    prompt: 'أي شكل له ٤ أضلاع متساوية تماماً في الطول؟',
    correctId: 'square',
    options: [
      { id: 'rectangle', label: 'مستطيل', visualType: 'shape' },
      { id: 'circle', label: 'دائرة', visualType: 'shape' },
      { id: 'square', label: 'مربع', visualType: 'shape' },
      { id: 'triangle', label: 'مثلث', visualType: 'shape' },
    ],
  },
  {
    id: 'shp-i4',
    tier: 'intermediate',
    prompt: 'أي شكل له ضلعان طويلان وضلعان قصيران؟',
    correctId: 'rectangle',
    options: [
      { id: 'triangle', label: 'مثلث', visualType: 'shape' },
      { id: 'circle', label: 'دائرة', visualType: 'shape' },
      { id: 'square', label: 'مربع', visualType: 'shape' },
      { id: 'rectangle', label: 'مستطيل', visualType: 'shape' },
    ],
  },

  // Level 3: Advanced Challenges (4)
  {
    id: 'shp-a1',
    tier: 'advanced',
    prompt: 'ما شكل ساعة الحائط والكرة؟',
    visualPromptEmoji: '⚽',
    correctId: 'circle',
    options: [
      { id: 'circle', label: 'دائرة', visualType: 'shape' },
      { id: 'square', label: 'مربع', visualType: 'shape' },
      { id: 'triangle', label: 'مثلث', visualType: 'shape' },
      { id: 'rectangle', label: 'مستطيل', visualType: 'shape' },
    ],
  },
  {
    id: 'shp-a2',
    tier: 'advanced',
    prompt: 'ما شكل الكتاب وباب الغرفة؟',
    visualPromptEmoji: '📖',
    correctId: 'rectangle',
    options: [
      { id: 'circle', label: 'دائرة', visualType: 'shape' },
      { id: 'triangle', label: 'مثلث', visualType: 'shape' },
      { id: 'rectangle', label: 'مستطيل', visualType: 'shape' },
      { id: 'square', label: 'مربع', visualType: 'shape' },
    ],
  },
  {
    id: 'shp-a3',
    tier: 'advanced',
    prompt: 'ما شكل الخيمة والهرم؟',
    visualPromptEmoji: '⛺',
    correctId: 'triangle',
    options: [
      { id: 'square', label: 'مربع', visualType: 'shape' },
      { id: 'triangle', label: 'مثلث', visualType: 'shape' },
      { id: 'circle', label: 'دائرة', visualType: 'shape' },
      { id: 'rectangle', label: 'مستطيل', visualType: 'shape' },
    ],
  },
  {
    id: 'shp-a4',
    tier: 'advanced',
    prompt: 'ما شكل صندوق الهدايا والنافذة متساوية الأضلاع؟',
    visualPromptEmoji: '🎁',
    correctId: 'square',
    options: [
      { id: 'circle', label: 'دائرة', visualType: 'shape' },
      { id: 'rectangle', label: 'مستطيل', visualType: 'shape' },
      { id: 'triangle', label: 'مثلث', visualType: 'shape' },
      { id: 'square', label: 'مربع', visualType: 'shape' },
    ],
  },
];

const NUMBERS_PROGRESSIVE_QUESTIONS: ProgressiveQuizQuestion[] = [
  // Level 1: Beginner (4)
  {
    id: 'num-b1',
    tier: 'beginner',
    prompt: 'كم تفاحة ترى؟',
    correctId: '3',
    countingDisplay: { objectType: 'apple', count: 3 },
    options: [
      { id: '1', label: '١', visualType: 'number' },
      { id: '2', label: '٢', visualType: 'number' },
      { id: '3', label: '٣', visualType: 'number' },
      { id: '4', label: '٤', visualType: 'number' },
    ],
  },
  {
    id: 'num-b2',
    tier: 'beginner',
    prompt: 'كم كرة ترى؟',
    correctId: '2',
    countingDisplay: { objectType: 'ball', count: 2 },
    options: [
      { id: '1', label: '١', visualType: 'number' },
      { id: '2', label: '٢', visualType: 'number' },
      { id: '3', label: '٣', visualType: 'number' },
      { id: '5', label: '٥', visualType: 'number' },
    ],
  },
  {
    id: 'num-b3',
    tier: 'beginner',
    prompt: 'كم مكعباً ترى؟',
    correctId: '5',
    countingDisplay: { objectType: 'block', count: 5 },
    options: [
      { id: '2', label: '٢', visualType: 'number' },
      { id: '3', label: '٣', visualType: 'number' },
      { id: '4', label: '٤', visualType: 'number' },
      { id: '5', label: '٥', visualType: 'number' },
    ],
  },
  {
    id: 'num-b4',
    tier: 'beginner',
    prompt: 'كم برتقالة ترى؟',
    correctId: '4',
    countingDisplay: { objectType: 'orange', count: 4 },
    options: [
      { id: '1', label: '١', visualType: 'number' },
      { id: '3', label: '٣', visualType: 'number' },
      { id: '4', label: '٤', visualType: 'number' },
      { id: '5', label: '٥', visualType: 'number' },
    ],
  },

  // Level 2: Intermediate (4)
  {
    id: 'num-i1',
    tier: 'intermediate',
    prompt: 'كم بطة لطيفة ترى؟',
    correctId: '3',
    countingDisplay: { objectType: 'duck', count: 3 },
    options: [
      { id: '1', label: '١', visualType: 'number' },
      { id: '2', label: '٢', visualType: 'number' },
      { id: '3', label: '٣', visualType: 'number' },
      { id: '5', label: '٥', visualType: 'number' },
    ],
  },
  {
    id: 'num-i2',
    tier: 'intermediate',
    prompt: 'ما الرقم الذي يأتي بعد الرقم ٢ مباشرة؟ (١ ، ٢ ، ...)',
    correctId: '3',
    options: [
      { id: '1', label: '١', visualType: 'number' },
      { id: '3', label: '٣', visualType: 'number' },
      { id: '4', label: '٤', visualType: 'number' },
      { id: '5', label: '٥', visualType: 'number' },
    ],
  },
  {
    id: 'num-i3',
    tier: 'intermediate',
    prompt: 'ما الرقم الذي يأتي قبل الرقم ٥ مباشرة؟ (... ، ٥)',
    correctId: '4',
    options: [
      { id: '2', label: '٢', visualType: 'number' },
      { id: '3', label: '٣', visualType: 'number' },
      { id: '4', label: '٤', visualType: 'number' },
      { id: '1', label: '١', visualType: 'number' },
    ],
  },
  {
    id: 'num-i4',
    tier: 'intermediate',
    prompt: 'عدّ الكرات الملونة في الصورة:',
    correctId: '4',
    countingDisplay: { objectType: 'ball', count: 4 },
    options: [
      { id: '2', label: '٢', visualType: 'number' },
      { id: '3', label: '٣', visualType: 'number' },
      { id: '4', label: '٤', visualType: 'number' },
      { id: '5', label: '٥', visualType: 'number' },
    ],
  },

  // Level 3: Advanced Challenges (4)
  {
    id: 'num-a1',
    tier: 'advanced',
    prompt: 'لديك تفاحة واحدة وأضفنا تفاحة واحدة، كم تفاحة أصبحت؟',
    correctId: '2',
    countingDisplay: { objectType: 'apple', count: 1 },
    secondaryCountingDisplay: { objectType: 'apple', count: 1 },
    options: [
      { id: '1', label: '١', visualType: 'number' },
      { id: '2', label: '٢', visualType: 'number' },
      { id: '3', label: '٣', visualType: 'number' },
      { id: '4', label: '٤', visualType: 'number' },
    ],
  },
  {
    id: 'num-a2',
    tier: 'advanced',
    prompt: 'لديك كرتان وحصلت على كرة واحدة، كم المجموع؟',
    correctId: '3',
    countingDisplay: { objectType: 'ball', count: 2 },
    secondaryCountingDisplay: { objectType: 'ball', count: 1 },
    options: [
      { id: '2', label: '٢', visualType: 'number' },
      { id: '3', label: '٣', visualType: 'number' },
      { id: '4', label: '٤', visualType: 'number' },
      { id: '5', label: '٥', visualType: 'number' },
    ],
  },
  {
    id: 'num-a3',
    tier: 'advanced',
    prompt: 'عدّ البرتقالات معاً: ٣ برتقالات + ١ برتقالة كم تساوي؟',
    correctId: '4',
    countingDisplay: { objectType: 'orange', count: 3 },
    secondaryCountingDisplay: { objectType: 'orange', count: 1 },
    options: [
      { id: '2', label: '٢', visualType: 'number' },
      { id: '3', label: '٣', visualType: 'number' },
      { id: '4', label: '٤', visualType: 'number' },
      { id: '5', label: '٥', visualType: 'number' },
    ],
  },
  {
    id: 'num-a4',
    tier: 'advanced',
    prompt: 'أي رقم هو الأكبر بين هذه الأرقام؟',
    correctId: '5',
    options: [
      { id: '1', label: '١', visualType: 'number' },
      { id: '2', label: '٢', visualType: 'number' },
      { id: '4', label: '٤', visualType: 'number' },
      { id: '5', label: '٥', visualType: 'number' },
    ],
  },
];

const EMOTIONS_PROGRESSIVE_QUESTIONS: ProgressiveQuizQuestion[] = [
  // Level 1: Beginner (4)
  {
    id: 'emo-b1',
    tier: 'beginner',
    prompt: 'من يبدو سعيداً؟',
    correctId: 'happy',
    options: [
      { id: 'happy', label: 'سعيد', visualType: 'emotion' },
      { id: 'sad', label: 'حزين', visualType: 'emotion' },
      { id: 'worried', label: 'قلق', visualType: 'emotion' },
      { id: 'tired', label: 'متعب', visualType: 'emotion' },
    ],
  },
  {
    id: 'emo-b2',
    tier: 'beginner',
    prompt: 'من يبدو حزيناً؟',
    correctId: 'sad',
    options: [
      { id: 'worried', label: 'قلق', visualType: 'emotion' },
      { id: 'sad', label: 'حزين', visualType: 'emotion' },
      { id: 'happy', label: 'سعيد', visualType: 'emotion' },
      { id: 'tired', label: 'متعب', visualType: 'emotion' },
    ],
  },
  {
    id: 'emo-b3',
    tier: 'beginner',
    prompt: 'من يبدو متعباً؟',
    correctId: 'tired',
    options: [
      { id: 'happy', label: 'سعيد', visualType: 'emotion' },
      { id: 'tired', label: 'متعب', visualType: 'emotion' },
      { id: 'sad', label: 'حزين', visualType: 'emotion' },
      { id: 'worried', label: 'قلق', visualType: 'emotion' },
    ],
  },
  {
    id: 'emo-b4',
    tier: 'beginner',
    prompt: 'من يبدو قلقاً؟',
    correctId: 'worried',
    options: [
      { id: 'sad', label: 'حزين', visualType: 'emotion' },
      { id: 'happy', label: 'سعيد', visualType: 'emotion' },
      { id: 'worried', label: 'قلق', visualType: 'emotion' },
      { id: 'tired', label: 'متعب', visualType: 'emotion' },
    ],
  },

  // Level 2: Intermediate (4)
  {
    id: 'emo-i1',
    tier: 'intermediate',
    prompt: 'فاز أحمد بوسام جميل ولعب مع أصدقائه، كيف يشعر الآن؟',
    visualPromptEmoji: '🏆',
    correctId: 'happy',
    options: [
      { id: 'happy', label: 'سعيد', visualType: 'emotion' },
      { id: 'sad', label: 'حزين', visualType: 'emotion' },
      { id: 'worried', label: 'قلق', visualType: 'emotion' },
      { id: 'tired', label: 'متعب', visualType: 'emotion' },
    ],
  },
  {
    id: 'emo-i2',
    tier: 'intermediate',
    prompt: 'حان وقت النوم بعد يوم طويل من اللعب، كيف يشعر الجسم؟',
    visualPromptEmoji: '🌙',
    correctId: 'tired',
    options: [
      { id: 'happy', label: 'سعيد', visualType: 'emotion' },
      { id: 'tired', label: 'متعب', visualType: 'emotion' },
      { id: 'worried', label: 'قلق', visualType: 'emotion' },
      { id: 'sad', label: 'حزين', visualType: 'emotion' },
    ],
  },
  {
    id: 'emo-i3',
    tier: 'intermediate',
    prompt: 'ضاعت لعبة سارة المفضلة في الغرفة، كيف قد تشعر؟',
    visualPromptEmoji: '🧸',
    correctId: 'sad',
    options: [
      { id: 'sad', label: 'حزين', visualType: 'emotion' },
      { id: 'happy', label: 'سعيد', visualType: 'emotion' },
      { id: 'tired', label: 'متعب', visualType: 'emotion' },
      { id: 'worried', label: 'قلق', visualType: 'emotion' },
    ],
  },
  {
    id: 'emo-i4',
    tier: 'intermediate',
    prompt: 'سمع خالد صوتاً عالياً ومفاجئاً لم يتعود عليه، كيف قد يشعر؟',
    visualPromptEmoji: '🔊',
    correctId: 'worried',
    options: [
      { id: 'happy', label: 'سعيد', visualType: 'emotion' },
      { id: 'tired', label: 'متعب', visualType: 'emotion' },
      { id: 'worried', label: 'قلق', visualType: 'emotion' },
      { id: 'sad', label: 'حزين', visualType: 'emotion' },
    ],
  },

  // Level 3: Advanced Challenges (4)
  {
    id: 'emo-a1',
    tier: 'advanced',
    prompt: 'عندما نشعر بالقلق أو التوتر، ما أفضل شيء نفعله بهدوء؟',
    correctId: 'breathe',
    options: [
      { id: 'breathe', label: 'نأخذ نفساً عميقاً', emoji: '🌬️', visualType: 'emoji' },
      { id: 'shout', label: 'نرفع صوتنا', emoji: '📢', visualType: 'emoji' },
      { id: 'run', label: 'نركض بسرعة', emoji: '🏃', visualType: 'emoji' },
      { id: 'hide', label: 'نغضب كثيراً', emoji: '😠', visualType: 'emoji' },
    ],
  },
  {
    id: 'emo-a2',
    tier: 'advanced',
    prompt: 'إذا رأينا صديقاً يشعر بالحزن، ماذا نفعل بلطف؟',
    correctId: 'comfort',
    options: [
      { id: 'comfort', label: 'نواسيه ونساعده', emoji: '💙', visualType: 'emoji' },
      { id: 'ignore', label: 'نتركه وحده', emoji: '🚶', visualType: 'emoji' },
      { id: 'loud', label: 'نصدر ضجيجاً', emoji: '🔊', visualType: 'emoji' },
      { id: 'laugh', label: 'نضحك عليه', emoji: '🙃', visualType: 'emoji' },
    ],
  },
  {
    id: 'emo-a3',
    tier: 'advanced',
    prompt: 'عندما نشعر بالتعب بعد اللعب، ماذا يحتاج جسمنا؟',
    correctId: 'rest',
    options: [
      { id: 'rest', label: 'الراحة والنوم الهادئ', emoji: '😴', visualType: 'emoji' },
      { id: 'jump', label: 'القفز المستمر', emoji: '🤸', visualType: 'emoji' },
      { id: 'noise', label: 'أصوات عالية', emoji: '🥁', visualType: 'emoji' },
      { id: 'rush', label: 'الركض السريع', emoji: '🏃', visualType: 'emoji' },
    ],
  },
  {
    id: 'emo-a4',
    tier: 'advanced',
    prompt: 'ما العلامة التي تظهر غالباً على الوجه عندما نكون سعداء؟',
    correctId: 'smile',
    options: [
      { id: 'smile', label: 'ابتسامة دافئة', emoji: '😊', visualType: 'emoji' },
      { id: 'tear', label: 'دمعة حزن', emoji: '😢', visualType: 'emoji' },
      { id: 'sleepy', label: 'عيون نائمة', emoji: '😴', visualType: 'emoji' },
      { id: 'worry', label: 'ملامح قلقة', emoji: '😟', visualType: 'emoji' },
    ],
  },
];

export const PROGRESSIVE_QUIZZES: Record<ModuleKey, ProgressiveQuizQuestion[]> = {
  colors: COLORS_PROGRESSIVE_QUESTIONS,
  shapes: SHAPES_PROGRESSIVE_QUESTIONS,
  numbers: NUMBERS_PROGRESSIVE_QUESTIONS,
  emotions: EMOTIONS_PROGRESSIVE_QUESTIONS,
};

export function getQuestionsForModuleAndTier(
  moduleKey: ModuleKey,
  tier: QuizTier
): ProgressiveQuizQuestion[] {
  return PROGRESSIVE_QUIZZES[moduleKey].filter((q) => q.tier === tier);
}
