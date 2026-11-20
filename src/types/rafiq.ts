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
  | 'profile';

export type ModuleKey = 'colors' | 'shapes' | 'numbers' | 'emotions';

export interface UserAccount {
  name: string;
  email: string;
  ageGroup: string;
  isGuest?: boolean;
}

export interface ProgressState {
  stars: number;
  soundEnabled: boolean;
  calmMode: boolean;
  completedLessons: Record<ModuleKey, boolean>;
  completedQuizzes: Record<ModuleKey, boolean>;
  quizScores: Record<ModuleKey, number>;
  totalCorrectAnswers: number;
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
