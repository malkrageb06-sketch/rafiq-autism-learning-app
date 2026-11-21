import { useCallback, useEffect, useRef, useState } from 'react';
import { ProgressState, UserAccount } from '../types/rafiq';
import {
  getOrCreateSyncId,
  loadLocalContentManifest,
  PublishedContentManifest,
  saveContentManifest,
} from '../utils/offlineStorage';

export type SyncStatus = 'idle' | 'syncing' | 'synced' | 'offline';

interface UseConnectivityAndSyncOptions {
  user: UserAccount;
  progress: ProgressState;
  onMergedCloudProgress?: (merged: ProgressState) => void;
}

export function useOnlineStatus(): boolean {
  const [isOnline, setIsOnline] = useState<boolean>(() =>
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  useEffect(() => {
    if (typeof window === 'undefined') return;

    let cancelled = false;

    const verifyReachability = async () => {
      if (!navigator.onLine) {
        if (!cancelled) setIsOnline(false);
        return;
      }

      try {
        const res = await fetch('/api/health', {
          method: 'GET',
          cache: 'no-store',
          signal: AbortSignal.timeout(3500),
        });
        if (!cancelled) {
          setIsOnline(res.ok);
        }
      } catch {
        if (!cancelled) {
          setIsOnline(false);
        }
      }
    };

    const handleOnline = () => {
      setIsOnline(true);
      void verifyReachability();
    };
    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    void verifyReachability();

    const intervalId = window.setInterval(() => {
      void verifyReachability();
    }, 20000);

    return () => {
      cancelled = true;
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.clearInterval(intervalId);
    };
  }, []);

  return isOnline;
}

export function useConnectivityAndSync({
  user,
  progress,
}: UseConnectivityAndSyncOptions) {
  const isOnline = useOnlineStatus();
  const [syncStatus, setSyncStatus] = useState<SyncStatus>(isOnline ? 'idle' : 'offline');
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null);
  const [contentManifest, setContentManifest] = useState<PublishedContentManifest | null>(() =>
    loadLocalContentManifest()
  );
  const [contentUpdatedNotice, setContentUpdatedNotice] = useState(false);

  const latestUserRef = useRef(user);
  const latestProgressRef = useRef(progress);
  latestUserRef.current = user;
  latestProgressRef.current = progress;

  const syncNow = useCallback(async () => {
    if (!navigator.onLine) {
      setSyncStatus('offline');
      return;
    }

    setSyncStatus('syncing');
    try {
      const syncId = getOrCreateSyncId(latestUserRef.current);
      const [syncRes, manifestRes] = await Promise.all([
        fetch('/api/sync-progress', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            syncId,
            user: latestUserRef.current,
            progress: latestProgressRef.current,
            updatedAt: Date.now(),
          }),
          signal: AbortSignal.timeout(5000),
        }),
        fetch('/api/content-manifest', {
          method: 'GET',
          cache: 'no-cache',
          signal: AbortSignal.timeout(5000),
        }),
      ]);

      if (syncRes.ok) {
        const syncData = (await syncRes.json()) as { syncedAt?: string };
        setLastSyncedAt(syncData.syncedAt ?? new Date().toISOString());
        setSyncStatus('synced');
      } else {
        setSyncStatus('idle');
      }

      if (manifestRes.ok) {
        const nextManifest = (await manifestRes.json()) as PublishedContentManifest;
        const previous = loadLocalContentManifest();
        if (nextManifest?.version) {
          await saveContentManifest(nextManifest);
          setContentManifest(nextManifest);
          if (previous && previous.version !== nextManifest.version) {
            setContentUpdatedNotice(true);
            window.setTimeout(() => setContentUpdatedNotice(false), 5000);
          }
        }
      }
    } catch {
      if (!navigator.onLine) {
        setSyncStatus('offline');
      } else {
        setSyncStatus('idle');
      }
    }
  }, []);

  // Auto-sync when connectivity turns online or on progress changes (debounced)
  useEffect(() => {
    if (!isOnline) {
      setSyncStatus('offline');
      return;
    }

    const timer = window.setTimeout(() => {
      void syncNow();
    }, 1200);

    return () => window.clearTimeout(timer);
  }, [isOnline, user, progress, syncNow]);

  return {
    isOnline,
    syncStatus,
    lastSyncedAt,
    contentManifest,
    contentUpdatedNotice,
    syncNow,
  };
}
