import { useEffect, useState } from 'react';
import { AppShell } from './components/AppShell';
import { ModuleKey, ProgressState, ScreenId, UserAccount } from './types/rafiq';
import { SplashScreen } from './screens/SplashScreen';
import { LoginScreen } from './screens/LoginScreen';
import { HomeScreen } from './screens/HomeScreen';
import { LessonsHubScreen } from './screens/LessonsHubScreen';
import { ColorsLearningScreen } from './screens/ColorsLearningScreen';
import { ShapesLearningScreen } from './screens/ShapesLearningScreen';
import { NumbersLearningScreen } from './screens/NumbersLearningScreen';
import { EmotionsLearningScreen } from './screens/EmotionsLearningScreen';
import { QuizScreen } from './screens/QuizScreen';
import { RewardsScreen } from './screens/RewardsScreen';
import { ProfileScreen } from './screens/ProfileScreen';
import { playGentleTap } from './utils/audio';

const STORAGE_KEY = 'rafiq_asd_learning_v1';

const DEFAULT_PROGRESS: ProgressState = {
  stars: 0,
  soundEnabled: true,
  calmMode: true,
  completedLessons: {
    colors: false,
    shapes: false,
    numbers: false,
    emotions: false,
  },
  completedQuizzes: {
    colors: false,
    shapes: false,
    numbers: false,
    emotions: false,
  },
  quizScores: {
    colors: 0,
    shapes: 0,
    numbers: 0,
    emotions: 0,
  },
  totalCorrectAnswers: 0,
};

const DEFAULT_USER: UserAccount = {
  name: 'بطل رفيق',
  email: 'parent@rafiq.app',
  ageGroup: '٤ - ١٠ سنوات',
  isGuest: true,
};

interface PersistedData {
  user: UserAccount;
  progress: ProgressState;
}

function loadPersistedData(): PersistedData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return { user: DEFAULT_USER, progress: DEFAULT_PROGRESS };
    }
    const parsed = JSON.parse(raw) as Partial<PersistedData>;
    return {
      user: { ...DEFAULT_USER, ...(parsed.user ?? {}) },
      progress: {
        ...DEFAULT_PROGRESS,
        ...(parsed.progress ?? {}),
        completedLessons: {
          ...DEFAULT_PROGRESS.completedLessons,
          ...(parsed.progress?.completedLessons ?? {}),
        },
        completedQuizzes: {
          ...DEFAULT_PROGRESS.completedQuizzes,
          ...(parsed.progress?.completedQuizzes ?? {}),
        },
        quizScores: {
          ...DEFAULT_PROGRESS.quizScores,
          ...(parsed.progress?.quizScores ?? {}),
        },
      },
    };
  } catch {
    return { user: DEFAULT_USER, progress: DEFAULT_PROGRESS };
  }
}

export default function App() {
  const [initialData] = useState<PersistedData>(() => loadPersistedData());
  const [currentScreen, setCurrentScreen] = useState<ScreenId>('splash');
  const [user, setUser] = useState<UserAccount>(initialData.user);
  const [progress, setProgress] = useState<ProgressState>(initialData.progress);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ user, progress }));
    } catch {
      // Ignore storage quota errors
    }
  }, [user, progress]);

  const navigateTo = (screen: ScreenId) => {
    playGentleTap(progress.soundEnabled);

    // Mark lesson explored when visiting any learning screen
    if (screen === 'colors-learn') markLessonExplored('colors');
    if (screen === 'shapes-learn') markLessonExplored('shapes');
    if (screen === 'numbers-learn') markLessonExplored('numbers');
    if (screen === 'emotions-learn') markLessonExplored('emotions');

    setCurrentScreen(screen);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const markLessonExplored = (moduleKey: ModuleKey) => {
    setProgress((prev) => {
      if (prev.completedLessons[moduleKey]) return prev;
      return {
        ...prev,
        completedLessons: {
          ...prev.completedLessons,
          [moduleKey]: true,
        },
      };
    });
  };

  const handleAuthenticate = (account: UserAccount) => {
    playGentleTap(progress.soundEnabled);
    setUser(account);
    setCurrentScreen('home');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAwardStars = (amount: number) => {
    setProgress((prev) => ({
      ...prev,
      stars: prev.stars + amount,
      totalCorrectAnswers: prev.totalCorrectAnswers + 1,
    }));
  };

  const handleCompleteQuiz = (moduleKey: ModuleKey, score: number) => {
    setProgress((prev) => ({
      ...prev,
      completedLessons: {
        ...prev.completedLessons,
        [moduleKey]: true,
      },
      completedQuizzes: {
        ...prev.completedQuizzes,
        [moduleKey]: true,
      },
      quizScores: {
        ...prev.quizScores,
        [moduleKey]: Math.max(prev.quizScores[moduleKey], score),
      },
    }));
  };

  const handleToggleSound = () => {
    setProgress((prev) => ({
      ...prev,
      soundEnabled: !prev.soundEnabled,
    }));
  };

  const handleResetProgress = () => {
    setProgress((prev) => ({
      ...DEFAULT_PROGRESS,
      soundEnabled: prev.soundEnabled,
    }));
  };

  const handleLogout = () => {
    playGentleTap(progress.soundEnabled);
    setCurrentScreen('login');
  };

  const getHeaderMeta = (): { title?: string; backTarget?: ScreenId } => {
    switch (currentScreen) {
      case 'colors-learn':
        return { title: 'تعلم الألوان', backTarget: 'home' };
      case 'colors-quiz':
        return { title: 'اختبار الألوان', backTarget: 'colors-learn' };
      case 'shapes-learn':
        return { title: 'تعلم الأشكال', backTarget: 'home' };
      case 'shapes-quiz':
        return { title: 'اختبار الأشكال', backTarget: 'shapes-learn' };
      case 'numbers-learn':
        return { title: 'تعلم الأرقام', backTarget: 'home' };
      case 'numbers-quiz':
        return { title: 'اختبار الأرقام', backTarget: 'numbers-learn' };
      case 'emotions-learn':
        return { title: 'تعلم المشاعر', backTarget: 'home' };
      case 'emotions-quiz':
        return { title: 'اختبار المشاعر', backTarget: 'emotions-learn' };
      case 'lessons':
        return { title: 'الدروس' };
      case 'rewards':
        return { title: 'المكافآت' };
      case 'profile':
        return { title: 'الملف الشخصي' };
      default:
        return {};
    }
  };

  const { title, backTarget } = getHeaderMeta();

  return (
    <AppShell
      currentScreen={currentScreen}
      onNavigate={navigateTo}
      stars={progress.stars}
      soundEnabled={progress.soundEnabled}
      onToggleSound={handleToggleSound}
      pageTitle={title}
      backTarget={backTarget}
    >
      {currentScreen === 'splash' && <SplashScreen onStart={() => navigateTo('login')} />}

      {currentScreen === 'login' && (
        <LoginScreen
          onAuthenticate={handleAuthenticate}
          onBackToSplash={() => navigateTo('splash')}
        />
      )}

      {currentScreen === 'home' && (
        <HomeScreen user={user} progress={progress} onNavigate={navigateTo} />
      )}

      {currentScreen === 'lessons' && (
        <LessonsHubScreen progress={progress} onNavigate={navigateTo} />
      )}

      {currentScreen === 'colors-learn' && (
        <ColorsLearningScreen
          soundEnabled={progress.soundEnabled}
          onStartQuiz={() => navigateTo('colors-quiz')}
        />
      )}

      {currentScreen === 'colors-quiz' && (
        <QuizScreen
          key="colors-quiz"
          moduleKey="colors"
          soundEnabled={progress.soundEnabled}
          onAwardStars={handleAwardStars}
          onCompleteQuiz={handleCompleteQuiz}
          onNavigate={navigateTo}
        />
      )}

      {currentScreen === 'shapes-learn' && (
        <ShapesLearningScreen
          soundEnabled={progress.soundEnabled}
          onStartQuiz={() => navigateTo('shapes-quiz')}
        />
      )}

      {currentScreen === 'shapes-quiz' && (
        <QuizScreen
          key="shapes-quiz"
          moduleKey="shapes"
          soundEnabled={progress.soundEnabled}
          onAwardStars={handleAwardStars}
          onCompleteQuiz={handleCompleteQuiz}
          onNavigate={navigateTo}
        />
      )}

      {currentScreen === 'numbers-learn' && (
        <NumbersLearningScreen
          soundEnabled={progress.soundEnabled}
          onStartQuiz={() => navigateTo('numbers-quiz')}
        />
      )}

      {currentScreen === 'numbers-quiz' && (
        <QuizScreen
          key="numbers-quiz"
          moduleKey="numbers"
          soundEnabled={progress.soundEnabled}
          onAwardStars={handleAwardStars}
          onCompleteQuiz={handleCompleteQuiz}
          onNavigate={navigateTo}
        />
      )}

      {currentScreen === 'emotions-learn' && (
        <EmotionsLearningScreen
          soundEnabled={progress.soundEnabled}
          onStartQuiz={() => navigateTo('emotions-quiz')}
        />
      )}

      {currentScreen === 'emotions-quiz' && (
        <QuizScreen
          key="emotions-quiz"
          moduleKey="emotions"
          soundEnabled={progress.soundEnabled}
          onAwardStars={handleAwardStars}
          onCompleteQuiz={handleCompleteQuiz}
          onNavigate={navigateTo}
        />
      )}

      {currentScreen === 'rewards' && (
        <RewardsScreen progress={progress} onNavigate={navigateTo} />
      )}

      {currentScreen === 'profile' && (
        <ProfileScreen
          user={user}
          progress={progress}
          onUpdateName={(name) => setUser((prev) => ({ ...prev, name }))}
          onToggleSound={handleToggleSound}
          onResetProgress={handleResetProgress}
          onLogout={handleLogout}
        />
      )}
    </AppShell>
  );
}
