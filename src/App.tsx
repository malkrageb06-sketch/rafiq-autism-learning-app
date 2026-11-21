import { useEffect, useState } from 'react';
import { AppShell } from './components/AppShell';
import { ModuleKey, ModuleTierProgress, ProgressState, QuizTier, ScreenId, UserAccount } from './types/rafiq';
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
import { AskRafiqScreen } from './screens/AskRafiqScreen';
import { DailyRoutineScreen } from './screens/DailyRoutineScreen';
import { ParentDashboardScreen } from './screens/ParentDashboardScreen';
import { AchievementsScreen } from './screens/AchievementsScreen';
import { playGentleTap } from './utils/audio';
import { useConnectivityAndSync } from './hooks/useOnlineStatus';
import {
  clearAuthSessionLocally,
  getOrCreateSyncId,
  loadAuthSessionLocally,
  LOCAL_STORAGE_KEY,
  loadUserStateFromIndexedDB,
  mergeProgressStates,
  saveAuthSessionLocally,
  saveUserStateToIndexedDB,
} from './utils/offlineStorage';

const STORAGE_KEY = LOCAL_STORAGE_KEY;

const DEFAULT_MODULE_TIER: ModuleTierProgress = {
  beginnerCompleted: false,
  intermediateCompleted: false,
  advancedCompleted: false,
  bestScores: {
    beginner: 0,
    intermediate: 0,
    advanced: 0,
  },
};

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
  moduleTiers: {
    colors: { ...DEFAULT_MODULE_TIER, bestScores: { ...DEFAULT_MODULE_TIER.bestScores } },
    shapes: { ...DEFAULT_MODULE_TIER, bestScores: { ...DEFAULT_MODULE_TIER.bestScores } },
    numbers: { ...DEFAULT_MODULE_TIER, bestScores: { ...DEFAULT_MODULE_TIER.bestScores } },
    emotions: { ...DEFAULT_MODULE_TIER, bestScores: { ...DEFAULT_MODULE_TIER.bestScores } },
  },
  totalCorrectAnswers: 0,
  routineTasks: {},
  aiQuestionsAsked: 0,
  dailyRewardClaimedDate: null,
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
  isAuthenticated: boolean;
  loggedInAt: string | null;
}

function loadPersistedData(): PersistedData {
  const storedSession = loadAuthSessionLocally();

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return {
        user: storedSession?.user ? { ...DEFAULT_USER, ...storedSession.user } : DEFAULT_USER,
        progress: DEFAULT_PROGRESS,
        isAuthenticated: Boolean(storedSession?.isAuthenticated),
        loggedInAt: storedSession?.loggedInAt ?? null,
      };
    }
    const parsed = JSON.parse(raw) as Partial<PersistedData>;
    const resolvedAuthenticated = Boolean(
      storedSession?.isAuthenticated ?? parsed.isAuthenticated
    );
    const resolvedLoggedInAt =
      storedSession?.loggedInAt ??
      (typeof parsed.loggedInAt === 'string' ? parsed.loggedInAt : null);
    const resolvedUser = {
      ...DEFAULT_USER,
      ...(parsed.user ?? {}),
      ...(storedSession?.user ?? {}),
    };

    return {
      user: resolvedUser,
      isAuthenticated: resolvedAuthenticated,
      loggedInAt: resolvedLoggedInAt,
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
        moduleTiers: {
          colors: {
            ...DEFAULT_MODULE_TIER,
            ...(parsed.progress?.moduleTiers?.colors ?? {}),
            beginnerCompleted:
              parsed.progress?.moduleTiers?.colors?.beginnerCompleted ??
              Boolean(parsed.progress?.completedQuizzes?.colors),
            bestScores: {
              ...DEFAULT_MODULE_TIER.bestScores,
              ...(parsed.progress?.moduleTiers?.colors?.bestScores ?? {}),
            },
          },
          shapes: {
            ...DEFAULT_MODULE_TIER,
            ...(parsed.progress?.moduleTiers?.shapes ?? {}),
            beginnerCompleted:
              parsed.progress?.moduleTiers?.shapes?.beginnerCompleted ??
              Boolean(parsed.progress?.completedQuizzes?.shapes),
            bestScores: {
              ...DEFAULT_MODULE_TIER.bestScores,
              ...(parsed.progress?.moduleTiers?.shapes?.bestScores ?? {}),
            },
          },
          numbers: {
            ...DEFAULT_MODULE_TIER,
            ...(parsed.progress?.moduleTiers?.numbers ?? {}),
            beginnerCompleted:
              parsed.progress?.moduleTiers?.numbers?.beginnerCompleted ??
              Boolean(parsed.progress?.completedQuizzes?.numbers),
            bestScores: {
              ...DEFAULT_MODULE_TIER.bestScores,
              ...(parsed.progress?.moduleTiers?.numbers?.bestScores ?? {}),
            },
          },
          emotions: {
            ...DEFAULT_MODULE_TIER,
            ...(parsed.progress?.moduleTiers?.emotions ?? {}),
            beginnerCompleted:
              parsed.progress?.moduleTiers?.emotions?.beginnerCompleted ??
              Boolean(parsed.progress?.completedQuizzes?.emotions),
            bestScores: {
              ...DEFAULT_MODULE_TIER.bestScores,
              ...(parsed.progress?.moduleTiers?.emotions?.bestScores ?? {}),
            },
          },
        },
        routineTasks: {
          ...DEFAULT_PROGRESS.routineTasks,
          ...(parsed.progress?.routineTasks ?? {}),
        },
      },
    };
  } catch {
    return {
      user: storedSession?.user ? { ...DEFAULT_USER, ...storedSession.user } : DEFAULT_USER,
      progress: DEFAULT_PROGRESS,
      isAuthenticated: Boolean(storedSession?.isAuthenticated),
      loggedInAt: storedSession?.loggedInAt ?? null,
    };
  }
}

export default function App() {
  const [initialData] = useState<PersistedData>(() => loadPersistedData());
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(initialData.isAuthenticated);
  const [loggedInAt, setLoggedInAt] = useState<string | null>(initialData.loggedInAt);
  const [currentScreen, setCurrentScreen] = useState<ScreenId>(() =>
    initialData.isAuthenticated ? 'home' : 'splash'
  );
  const [user, setUser] = useState<UserAccount>(initialData.user);
  const [progress, setProgress] = useState<ProgressState>(initialData.progress);

  const {
    isOnline,
    syncStatus,
    lastSyncedAt,
    contentManifest,
    contentUpdatedNotice,
    syncNow,
  } = useConnectivityAndSync({ user, progress });

  // Restore any newer IndexedDB session/progress or cloud-synced progress safely on startup
  useEffect(() => {
    let active = true;

    void (async () => {
      const idbState = await loadUserStateFromIndexedDB();
      if (active && idbState) {
        if (idbState.progress) {
          setProgress((prev) => mergeProgressStates(prev, idbState.progress));
        }
        // If localStorage lacked session info (e.g. evicted) but IndexedDB holds an active login session,
        // automatically restore the user session and open the Home Screen directly.
        if (!initialData.isAuthenticated && idbState.isAuthenticated && idbState.user?.name) {
          setUser({ ...DEFAULT_USER, ...idbState.user });
          setIsAuthenticated(true);
          setLoggedInAt(idbState.loggedInAt ?? null);
          saveAuthSessionLocally(true, idbState.loggedInAt ?? null, idbState.user);
          setCurrentScreen((curr) => (curr === 'splash' || curr === 'login' ? 'home' : curr));
        }
      }

      if (!navigator.onLine) return;
      try {
        const activeUser = idbState?.user?.name ? idbState.user : initialData.user;
        const syncId = getOrCreateSyncId(activeUser);
        const res = await fetch(`/api/sync-progress?syncId=${encodeURIComponent(syncId)}`, {
          signal: AbortSignal.timeout(4000),
        });
        if (!res.ok) return;
        const cloud = (await res.json()) as {
          found?: boolean;
          progress?: Partial<ProgressState>;
        };
        if (active && cloud.found && cloud.progress) {
          setProgress((prev) => mergeProgressStates(prev, cloud.progress!));
        }
      } catch {
        // Offline or unreachable; local progress stays intact
      }
    })();

    return () => {
      active = false;
    };
  }, [initialData.isAuthenticated, initialData.user]);

  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          user,
          progress,
          isAuthenticated,
          loggedInAt,
        })
      );
      saveAuthSessionLocally(isAuthenticated, loggedInAt, user);
    } catch {
      // Ignore storage quota errors
    }

    void saveUserStateToIndexedDB({
      id: 'current',
      user,
      progress,
      isAuthenticated,
      loggedInAt,
      updatedAt: Date.now(),
      lastSyncedAt,
    });
  }, [user, progress, isAuthenticated, loggedInAt, lastSyncedAt]);

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
    const loginTimestamp = new Date().toISOString();
    setUser(account);
    setIsAuthenticated(true);
    setLoggedInAt(loginTimestamp);
    saveAuthSessionLocally(true, loginTimestamp, account);
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          user: account,
          progress,
          isAuthenticated: true,
          loggedInAt: loginTimestamp,
        })
      );
    } catch {
      // Ignore storage quota errors
    }
    void saveUserStateToIndexedDB({
      id: 'current',
      user: account,
      progress,
      isAuthenticated: true,
      loggedInAt: loginTimestamp,
      updatedAt: Date.now(),
      lastSyncedAt,
    });
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

  const handleAwardAskStars = (amount: number) => {
    setProgress((prev) => ({
      ...prev,
      stars: prev.stars + amount,
      aiQuestionsAsked: prev.aiQuestionsAsked + 1,
    }));
  };

  const handleToggleRoutineTask = (taskId: string, completed: boolean, starsReward: number) => {
    setProgress((prev) => {
      const wasCompleted = Boolean(prev.routineTasks[taskId]);
      if (wasCompleted === completed) return prev;
      const starDelta = completed ? starsReward : -starsReward;
      return {
        ...prev,
        stars: Math.max(0, prev.stars + starDelta),
        routineTasks: {
          ...prev.routineTasks,
          [taskId]: completed,
        },
      };
    });
  };

  const handleResetRoutine = () => {
    setProgress((prev) => ({
      ...prev,
      routineTasks: {},
    }));
  };

  const handleClaimDailyReward = (amount: number, dateKey: string) => {
    setProgress((prev) => {
      if (prev.dailyRewardClaimedDate === dateKey) return prev;
      return {
        ...prev,
        stars: prev.stars + amount,
        dailyRewardClaimedDate: dateKey,
      };
    });
  };

  const handleCompleteTier = (
    moduleKey: ModuleKey,
    tier: QuizTier,
    score: number,
    bonusStars: number
  ) => {
    setProgress((prev) => {
      const currentTierData = prev.moduleTiers[moduleKey] ?? DEFAULT_MODULE_TIER;
      const updatedTierData: ModuleTierProgress = {
        ...currentTierData,
        beginnerCompleted:
          currentTierData.beginnerCompleted || tier === 'beginner',
        intermediateCompleted:
          currentTierData.intermediateCompleted || tier === 'intermediate',
        advancedCompleted:
          currentTierData.advancedCompleted || tier === 'advanced',
        bestScores: {
          ...currentTierData.bestScores,
          [tier]: Math.max(currentTierData.bestScores[tier] ?? 0, score),
        },
      };

      return {
        ...prev,
        stars: prev.stars + bonusStars,
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
        moduleTiers: {
          ...prev.moduleTiers,
          [moduleKey]: updatedTierData,
        },
      };
    });
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
    setIsAuthenticated(false);
    setLoggedInAt(null);
    clearAuthSessionLocally();
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          user,
          progress,
          isAuthenticated: false,
          loggedInAt: null,
        })
      );
    } catch {
      // Ignore storage quota errors
    }
    void saveUserStateToIndexedDB({
      id: 'current',
      user,
      progress,
      isAuthenticated: false,
      loggedInAt: null,
      updatedAt: Date.now(),
      lastSyncedAt,
    });
    setCurrentScreen('login');
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
      case 'ask-rafiq':
        return { title: 'اسأل رفيق', backTarget: 'home' };
      case 'daily-routine':
        return { title: 'جدولي اليومي', backTarget: 'home' };
      case 'parent-dashboard':
        return { title: 'متابعة الطفل', backTarget: 'home' };
      case 'achievements':
        return { title: 'المستويات والإنجازات', backTarget: 'home' };
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
      isOnline={isOnline}
      syncStatus={syncStatus}
      contentUpdatedNotice={contentUpdatedNotice}
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
          progress={progress}
          onAwardStars={handleAwardStars}
          onCompleteTier={handleCompleteTier}
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
          progress={progress}
          onAwardStars={handleAwardStars}
          onCompleteTier={handleCompleteTier}
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
          progress={progress}
          onAwardStars={handleAwardStars}
          onCompleteTier={handleCompleteTier}
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
          progress={progress}
          onAwardStars={handleAwardStars}
          onCompleteTier={handleCompleteTier}
          onNavigate={navigateTo}
        />
      )}

      {currentScreen === 'ask-rafiq' && (
        <AskRafiqScreen
          soundEnabled={progress.soundEnabled}
          aiQuestionsAsked={progress.aiQuestionsAsked}
          onAwardAskStars={handleAwardAskStars}
          onNavigate={navigateTo}
          isOnline={isOnline}
        />
      )}

      {currentScreen === 'daily-routine' && (
        <DailyRoutineScreen
          routineTasks={progress.routineTasks}
          soundEnabled={progress.soundEnabled}
          onToggleTask={handleToggleRoutineTask}
          onResetRoutine={handleResetRoutine}
        />
      )}

      {currentScreen === 'parent-dashboard' && (
        <ParentDashboardScreen user={user} progress={progress} onNavigate={navigateTo} />
      )}

      {currentScreen === 'achievements' && (
        <AchievementsScreen
          progress={progress}
          onClaimDailyReward={handleClaimDailyReward}
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
          isOnline={isOnline}
          syncStatus={syncStatus}
          lastSyncedAt={lastSyncedAt}
          contentManifest={contentManifest}
          onManualSync={() => void syncNow()}
        />
      )}
    </AppShell>
  );
}
