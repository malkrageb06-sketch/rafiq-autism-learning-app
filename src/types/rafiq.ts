export type ScreenId =
  | 'splash'
  | 'login'
  | 'home'
  | 'lessons'
  | 'colors-learn'
  | 'colors-quiz'
  | 'shapes-learn'
  | 'shapes-quiz'
  | 'numbers-learn'
  | 'numbers-quiz'
  | 'emotions-learn'
  | 'emotions-quiz'
  | 'rewards'
  | 'profile'
  | 'ask-rafiq'
  | 'daily-routine'
  | 'parent-dashboard'
  | 'achievements';

export type ModuleKey = 'colors' | 'shapes' | 'numbers' | 'emotions';

export type QuizTier = 'beginner' | 'intermediate' | 'advanced';

export interface ModuleTierProgress {
  beginnerCompleted: boolean;
  intermediateCompleted: boolean;
  advancedCompleted: boolean;
  bestScores: Record<QuizTier, number>;
}

export interface ProgressiveQuizOption {
  id: string;
  label: string;
  emoji?: string;
  colorHex?: string;
  visualType?: 'color' | 'shape' | 'number' | 'emotion' | 'emoji';
}

export interface ProgressiveQuizQuestion {
  id: string;
  tier: QuizTier;
  prompt: string;
  correctId: string;
  visualPromptEmoji?: string;
  countingDisplay?: {
    objectType: NumberItem['objectType'];
    count: number;
  };
  secondaryCountingDisplay?: {
    objectType: NumberItem['objectType'];
    count: number;
  };
  options: ProgressiveQuizOption[];
}

export type RoutineTaskIconType = 'wakeup' | 'brush' | 'eat' | 'study' | 'learn' | 'sleep';

export interface RoutineTask {
  id: string;
  title: string;
  subtitle: string;
  timeLabel: string;
  starsReward: number;
  iconType: RoutineTaskIconType;
  accentColor: string;
  softBg: string;
}

export interface ChatVisualCard {
  emoji: string;
  label: string;
  bg: string;
}

export interface ChatMessage {
  id: string;
  sender: 'child' | 'rafiq';
  text: string;
  timestamp: string;
  visualCards?: ChatVisualCard[];
  recommendedModule?: ModuleKey;
  isError?: boolean;
  isOfflineNotice?: boolean;
}

export interface UserAccount {
  name: string;
  email: string;
  ageGroup: string;
  isGuest?: boolean;
}

export interface AuthSession {
  isAuthenticated: boolean;
  loggedInAt: string | null;
}

export interface ProgressState {
  stars: number;
  soundEnabled: boolean;
  calmMode: boolean;
  completedLessons: Record<ModuleKey, boolean>;
  completedQuizzes: Record<ModuleKey, boolean>;
  quizScores: Record<ModuleKey, number>;
  moduleTiers: Record<ModuleKey, ModuleTierProgress>;
  totalCorrectAnswers: number;
  routineTasks: Record<string, boolean>;
  aiQuestionsAsked: number;
  dailyRewardClaimedDate: string | null;
}

export interface ColorItem {
  id: 'red' | 'green' | 'blue' | 'yellow';
  name: string;
  hex: string;
  softBg: string;
  borderColor: string;
  textColor: string;
  exampleLabel: string;
  description: string;
}

export interface ShapeItem {
  id: 'circle' | 'square' | 'triangle' | 'rectangle';
  name: string;
  symbol: string;
  accentColor: string;
  softBg: string;
  exampleLabel: string;
  description: string;
}

export interface NumberItem {
  value: number;
  arabicDigit: string;
  name: string;
  objectType: 'apple' | 'ball' | 'duck' | 'orange' | 'block';
  objectPlural: string;
  accentColor: string;
  softBg: string;
}

export interface EmotionItem {
  id: 'happy' | 'sad' | 'worried' | 'tired';
  name: string;
  emoji: string;
  accentColor: string;
  softBg: string;
  description: string;
  tip: string;
}

export interface QuizQuestion {
  id: string;
  prompt: string;
  correctId: string;
  options: { id: string; label: string }[];
  countingDisplay?: {
    objectType: NumberItem['objectType'];
    count: number;
  };
}

export interface BadgeItem {
  id: string;
  title: string;
  description: string;
  requirementText: string;
  unlocked: boolean;
  accentColor: string;
  iconType: 'learner' | 'colors' | 'numbers' | 'star';
}

export interface ExtendedBadgeItem {
  id: string;
  title: string;
  description: string;
  requirementText: string;
  unlocked: boolean;
  accentColor: string;
  iconType: 'learner' | 'colors' | 'shapes' | 'numbers' | 'emotions' | 'star';
}

export interface LevelStage {
  level: number;
  title: string;
  subtitle: string;
  minXp: number;
  nextXp: number;
  badgeLabel: string;
}
