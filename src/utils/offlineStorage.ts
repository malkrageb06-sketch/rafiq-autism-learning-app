import { ModuleKey, ModuleTierProgress, ProgressState, UserAccount } from '../types/rafiq';

export const LOCAL_STORAGE_KEY = 'rafiq_asd_learning_v1';
export const AUTH_SESSION_STORAGE_KEY = 'rafiq_auth_session_v1';
const SYNC_ID_KEY = 'rafiq_sync_profile_id_v1';
const CONTENT_MANIFEST_STORAGE_KEY = 'rafiq_content_manifest_v1';

const DB_NAME = 'rafiq_offline_db';
const DB_VERSION = 1;
const STORE_USER_STATE = 'user_state';
const STORE_TTS_AUDIO = 'tts_audio_cache';
const STORE_CONTENT = 'content_updates';

export interface PersistedUserState {
  id: string;
  user: UserAccount;
  progress: ProgressState;
  isAuthenticated?: boolean;
  loggedInAt?: string | null;
  updatedAt: number;
  lastSyncedAt: string | null;
}

export interface PublishedContentManifest {
  version: string;
  publishedAt: string;
  lessonsCount: number;
  quizzesCount: number;
  announcement: string;
}

function openOfflineDb(): Promise<IDBDatabase | null> {
  if (typeof window === 'undefined' || !('indexedDB' in window)) {
    return Promise.resolve(null);
  }

  return new Promise((resolve) => {
    try {
      const request = window.indexedDB.open(DB_NAME, DB_VERSION);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(STORE_USER_STATE)) {
          db.createObjectStore(STORE_USER_STATE, { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains(STORE_TTS_AUDIO)) {
          db.createObjectStore(STORE_TTS_AUDIO, { keyPath: 'text' });
        }
        if (!db.objectStoreNames.contains(STORE_CONTENT)) {
          db.createObjectStore(STORE_CONTENT, { keyPath: 'id' });
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
}

export function getOrCreateSyncId(user: UserAccount): string {
  const email = user.email?.trim().toLowerCase();
  if (email && email !== 'parent@rafiq.app') {
    return `user:${email}`;
  }

  try {
    const existing = localStorage.getItem(SYNC_ID_KEY);
    if (existing) return existing;
    const generated = `guest:${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
    localStorage.setItem(SYNC_ID_KEY, generated);
    return generated;
  } catch {
    return 'guest:default';
  }
}

export interface StoredAuthSession {
  isAuthenticated: boolean;
  loggedInAt: string | null;
  user?: UserAccount;
}

export function saveAuthSessionLocally(
  isAuthenticated: boolean,
  loggedInAt: string | null,
  user?: UserAccount
): void {
  try {
    if (isAuthenticated && user) {
      const payload: StoredAuthSession = {
        isAuthenticated: true,
        loggedInAt,
        user,
      };
      localStorage.setItem(AUTH_SESSION_STORAGE_KEY, JSON.stringify(payload));
    } else {
      localStorage.removeItem(AUTH_SESSION_STORAGE_KEY);
    }
  } catch {
    // Ignore storage quota errors
  }
}

export function loadAuthSessionLocally(): StoredAuthSession | null {
  try {
    const raw = localStorage.getItem(AUTH_SESSION_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<StoredAuthSession>;
    if (parsed.isAuthenticated !== true) return null;
    return {
      isAuthenticated: true,
      loggedInAt: typeof parsed.loggedInAt === 'string' ? parsed.loggedInAt : null,
      user: parsed.user,
    };
  } catch {
    return null;
  }
}

export function clearAuthSessionLocally(): void {
  try {
    localStorage.removeItem(AUTH_SESSION_STORAGE_KEY);
  } catch {
    // Ignore storage errors
  }
}

export async function saveUserStateToIndexedDB(state: PersistedUserState): Promise<void> {
  const db = await openOfflineDb();
  if (!db) return;

  await new Promise<void>((resolve) => {
    try {
      const tx = db.transaction(STORE_USER_STATE, 'readwrite');
      const store = tx.objectStore(STORE_USER_STATE);
      store.put(state);
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    } catch {
      resolve();
    }
  });
}

export async function loadUserStateFromIndexedDB(): Promise<PersistedUserState | null> {
  const db = await openOfflineDb();
  if (!db) return null;

  return new Promise((resolve) => {
    try {
      const tx = db.transaction(STORE_USER_STATE, 'readonly');
      const store = tx.objectStore(STORE_USER_STATE);
      const req = store.get('current');
      req.onsuccess = () => {
        resolve((req.result as PersistedUserState | undefined) ?? null);
      };
      req.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
}

export async function getCachedTtsAudio(text: string): Promise<string | null> {
  const db = await openOfflineDb();
  if (!db) return null;

  return new Promise((resolve) => {
    try {
      const tx = db.transaction(STORE_TTS_AUDIO, 'readonly');
      const store = tx.objectStore(STORE_TTS_AUDIO);
      const req = store.get(text);
      req.onsuccess = () => {
        const record = req.result as { audioBase64?: string } | undefined;
        resolve(record?.audioBase64 ?? null);
      };
      req.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
}

export async function setCachedTtsAudio(text: string, audioBase64: string): Promise<void> {
  const db = await openOfflineDb();
  if (!db) return;

  await new Promise<void>((resolve) => {
    try {
      const tx = db.transaction(STORE_TTS_AUDIO, 'readwrite');
      const store = tx.objectStore(STORE_TTS_AUDIO);
      store.put({ text, audioBase64, updatedAt: Date.now() });
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    } catch {
      resolve();
    }
  });
}

export async function saveContentManifest(manifest: PublishedContentManifest): Promise<void> {
  try {
    localStorage.setItem(CONTENT_MANIFEST_STORAGE_KEY, JSON.stringify(manifest));
  } catch {
    // Ignore storage errors
  }

  const db = await openOfflineDb();
  if (!db) return;

  await new Promise<void>((resolve) => {
    try {
      const tx = db.transaction(STORE_CONTENT, 'readwrite');
      const store = tx.objectStore(STORE_CONTENT);
      store.put({ id: 'manifest', ...manifest, cachedAt: Date.now() });
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    } catch {
      resolve();
    }
  });
}

export function loadLocalContentManifest(): PublishedContentManifest | null {
  try {
    const raw = localStorage.getItem(CONTENT_MANIFEST_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as PublishedContentManifest;
  } catch {
    return null;
  }
}

export function mergeProgressStates(
  local: ProgressState,
  remote: Partial<ProgressState>
): ProgressState {
  const modules: ModuleKey[] = ['colors', 'shapes', 'numbers', 'emotions'];

  const completedLessons = { ...local.completedLessons };
  const completedQuizzes = { ...local.completedQuizzes };
  const quizScores = { ...local.quizScores };
  const moduleTiers = { ...local.moduleTiers };

  for (const key of modules) {
    completedLessons[key] = Boolean(local.completedLessons[key] || remote.completedLessons?.[key]);
    completedQuizzes[key] = Boolean(local.completedQuizzes[key] || remote.completedQuizzes?.[key]);
    quizScores[key] = Math.max(local.quizScores[key] ?? 0, remote.quizScores?.[key] ?? 0);

    const localTier: ModuleTierProgress = local.moduleTiers[key] ?? {
      beginnerCompleted: false,
      intermediateCompleted: false,
      advancedCompleted: false,
      bestScores: { beginner: 0, intermediate: 0, advanced: 0 },
    };
    const remoteTier = remote.moduleTiers?.[key];

    moduleTiers[key] = {
      beginnerCompleted: Boolean(localTier.beginnerCompleted || remoteTier?.beginnerCompleted),
      intermediateCompleted: Boolean(
        localTier.intermediateCompleted || remoteTier?.intermediateCompleted
      ),
      advancedCompleted: Boolean(localTier.advancedCompleted || remoteTier?.advancedCompleted),
      bestScores: {
        beginner: Math.max(localTier.bestScores?.beginner ?? 0, remoteTier?.bestScores?.beginner ?? 0),
        intermediate: Math.max(
          localTier.bestScores?.intermediate ?? 0,
          remoteTier?.bestScores?.intermediate ?? 0
        ),
        advanced: Math.max(localTier.bestScores?.advanced ?? 0, remoteTier?.bestScores?.advanced ?? 0),
      },
    };
  }

  return {
    ...local,
    stars: Math.max(local.stars, remote.stars ?? 0),
    totalCorrectAnswers: Math.max(local.totalCorrectAnswers, remote.totalCorrectAnswers ?? 0),
    aiQuestionsAsked: Math.max(local.aiQuestionsAsked, remote.aiQuestionsAsked ?? 0),
    dailyRewardClaimedDate: local.dailyRewardClaimedDate ?? remote.dailyRewardClaimedDate ?? null,
    completedLessons,
    completedQuizzes,
    quizScores,
    moduleTiers,
    routineTasks: {
      ...(remote.routineTasks ?? {}),
      ...local.routineTasks,
    },
  };
}
