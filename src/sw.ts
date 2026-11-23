export {};

interface PrecacheEntry {
  url: string;
  revision?: string | null;
}

interface SWExtendableEvent extends Event {
  waitUntil(promise: Promise<unknown>): void;
}

interface SWFetchEvent extends Event {
  readonly request: Request;
  respondWith(response: Response | PromiseLike<Response>): void;
}

interface SWMessageEvent extends Event {
  readonly data: unknown;
}

interface SWGlobalScope {
  __WB_MANIFEST?: Array<string | PrecacheEntry>;
  location: Location;
  skipWaiting(): Promise<void>;
  clients: {
    claim(): Promise<void>;
  };
  addEventListener(type: 'install', listener: (event: SWExtendableEvent) => void): void;
  addEventListener(type: 'activate', listener: (event: SWExtendableEvent) => void): void;
  addEventListener(type: 'fetch', listener: (event: SWFetchEvent) => void): void;
  addEventListener(type: 'message', listener: (event: SWMessageEvent) => void): void;
}

declare const self: SWGlobalScope;

const CACHE_VERSION = 'v2';
const PRECACHE_NAME = `rafiq-precache-${CACHE_VERSION}`;
const SHELL_CACHE_NAME = `rafiq-shell-${CACHE_VERSION}`;
const ASSET_CACHE_NAME = `rafiq-assets-${CACHE_VERSION}`;
const RUNTIME_CACHE_NAME = `rafiq-runtime-${CACHE_VERSION}`;
const FONT_CACHE_NAME = `rafiq-fonts-${CACHE_VERSION}`;
const CONTENT_CACHE_NAME = `rafiq-content-${CACHE_VERSION}`;

const ACTIVE_CACHES = new Set([
  PRECACHE_NAME,
  SHELL_CACHE_NAME,
  ASSET_CACHE_NAME,
  RUNTIME_CACHE_NAME,
  FONT_CACHE_NAME,
  CONTENT_CACHE_NAME,
]);

const CORE_SHELL_URLS = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/icon.svg',
  '/apple-touch-icon.png',
  '/apple-splash.png',
  '/pwa-192x192.png',
  '/pwa-512x512.png',
  '/pwa-maskable-512x512.png',
];

function getNormalizedManifestUrls(): string[] {
  const wbManifest = self.__WB_MANIFEST;
  const rawManifest = Array.isArray(wbManifest) ? wbManifest : [];
  const urls = new Set<string>();

  for (const entry of rawManifest) {
    const rawUrl = typeof entry === 'string' ? entry : entry?.url;
    if (!rawUrl) continue;
    const normalized = rawUrl.startsWith('/') || rawUrl.startsWith('http') ? rawUrl : `/${rawUrl}`;
    urls.add(normalized);
  }

  return Array.from(urls);
}

async function fetchWithTimeout(request: Request | string, timeoutMs = 2500): Promise<Response> {
  const controller = new AbortController();
  const timerId = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(request, { signal: controller.signal });
  } finally {
    clearTimeout(timerId);
  }
}

function isCacheableResponse(response: Response): boolean {
  return response.ok || response.type === 'opaque';
}

async function cacheUrlsSafely(cacheName: string, urls: string[]): Promise<void> {
  const cache = await caches.open(cacheName);
  const uniqueUrls = Array.from(new Set(urls));

  await Promise.allSettled(
    uniqueUrls.map(async (url) => {
      try {
        const req = new Request(url, { cache: 'reload' });
        const response = await fetch(req);
        if (response.ok) {
          await cache.put(url, response);
        }
      } catch {
        // Skip individual failures cleanly so SW install never aborts
      }
    })
  );
}

async function matchFromAllCaches(request: Request, ignoreSearch = false): Promise<Response | undefined> {
  const cacheOrder = [
    SHELL_CACHE_NAME,
    PRECACHE_NAME,
    ASSET_CACHE_NAME,
    RUNTIME_CACHE_NAME,
    FONT_CACHE_NAME,
    CONTENT_CACHE_NAME,
  ];

  for (const name of cacheOrder) {
    const cache = await caches.open(name);
    const match = await cache.match(request, { ignoreSearch });
    if (match) return match;
  }

  return caches.match(request, { ignoreSearch });
}

async function handleNavigationRequest(request: Request): Promise<Response> {
  const shellCache = await caches.open(SHELL_CACHE_NAME);

  try {
    const networkResponse = await fetchWithTimeout(request, 2500);
    if (networkResponse.ok) {
      await Promise.allSettled([
        shellCache.put(request, networkResponse.clone()),
        shellCache.put('/index.html', networkResponse.clone()),
        shellCache.put('/', networkResponse.clone()),
      ]);
      return networkResponse;
    }
  } catch {
    // Offline or network timeout -> serve cached shell immediately
  }

  const cachedCandidates = [
    await shellCache.match(request, { ignoreSearch: true }),
    await shellCache.match('/index.html', { ignoreSearch: true }),
    await shellCache.match('/', { ignoreSearch: true }),
    await matchFromAllCaches(new Request('/index.html'), true),
    await matchFromAllCaches(new Request('/'), true),
  ];

  for (const candidate of cachedCandidates) {
    if (candidate) return candidate;
  }

  return new Response(
    `<!doctype html><html lang="ar" dir="rtl"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>رفيق | وضع عدم الاتصال</title></head><body style="font-family:sans-serif;text-align:center;padding:3rem;background:#F8FAFC;color:#1E293B"><h1>تطبيق رفيق</h1><p>أنت تعمل حالياً بدون اتصال بالإنترنت. يرجى إعادة فتح التطبيق مرة أخرى عند توفر الشبكة لتحميل الملفات الأساسية.</p></body></html>`,
    {
      status: 200,
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    }
  );
}

async function handleCacheFirst(request: Request, cacheName: string): Promise<Response> {
  const cache = await caches.open(cacheName);
  const cached = (await cache.match(request)) ?? (await matchFromAllCaches(request));
  if (cached) {
    return cached;
  }

  try {
    const response = await fetch(request);
    if (isCacheableResponse(response)) {
      await cache.put(request, response.clone());
    }
    return response;
  } catch {
    const fallback = await matchFromAllCaches(request, true);
    if (fallback) return fallback;
    return new Response('', { status: 504, statusText: 'Offline' });
  }
}

async function handleNetworkFirst(
  request: Request,
  cacheName: string,
  timeoutMs = 2500
): Promise<Response> {
  const cache = await caches.open(cacheName);

  try {
    const response = await fetchWithTimeout(request, timeoutMs);
    if (response.ok) {
      await cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = (await cache.match(request)) ?? (await matchFromAllCaches(request));
    if (cached) {
      return cached;
    }
    return new Response('', { status: 504, statusText: 'Offline' });
  }
}

self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const manifestUrls = getNormalizedManifestUrls();
      await Promise.all([
        cacheUrlsSafely(SHELL_CACHE_NAME, CORE_SHELL_URLS),
        manifestUrls.length > 0 ? cacheUrlsSafely(PRECACHE_NAME, manifestUrls) : Promise.resolve(),
      ]);
      await self.skipWaiting();
    })()
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys
          .filter((key) => !ACTIVE_CACHES.has(key))
          .map((key) => caches.delete(key))
      );
      await self.clients.claim();
    })()
  );
});

self.addEventListener('message', (event) => {
  const data = event.data as { type?: string; urls?: unknown } | undefined;
  if (!data || typeof data !== 'object') return;

  if (data.type === 'SKIP_WAITING') {
    void self.skipWaiting();
    return;
  }

  if (data.type === 'WARM_CACHE' && Array.isArray(data.urls)) {
    const urls = data.urls.filter((u): u is string => typeof u === 'string' && u.length > 0);
    if (urls.length === 0) return;

    void (async () => {
      const runtimeCache = await caches.open(RUNTIME_CACHE_NAME);
      const fontCache = await caches.open(FONT_CACHE_NAME);

      await Promise.allSettled(
        urls.map(async (rawUrl) => {
          try {
            const parsed = new URL(rawUrl, self.location.origin);
            if (parsed.pathname.startsWith('/api/')) return;
            if (parsed.pathname === '/sw.js' || parsed.pathname.includes('dev-sw.js')) return;

            const isGoogleFont =
              parsed.hostname === 'fonts.googleapis.com' ||
              parsed.hostname === 'fonts.gstatic.com';
            const isSameOrigin = parsed.origin === self.location.origin;

            if (!isSameOrigin && !isGoogleFont) return;

            const targetCache = isGoogleFont ? fontCache : runtimeCache;
            const existing = await targetCache.match(parsed.href);
            if (existing) return;

            const response = await fetch(parsed.href, {
              mode: isGoogleFont && parsed.hostname === 'fonts.gstatic.com' ? 'cors' : undefined,
            });
            if (isCacheableResponse(response)) {
              await targetCache.put(parsed.href, response);
            }
          } catch {
            // Ignore warm cache miss
          }
        })
      );
    })();
  }
});

self.addEventListener('fetch', (event) => {
  const { request } = event;

  if (request.method !== 'GET') {
    return;
  }

  const url = new URL(request.url);

  // Never intercept connectivity verification probes so online status checks real network reachability
  if (url.searchParams.has('_connectivity_check')) {
    return;
  }

  // Never intercept SW script fetches themselves
  if (
    url.origin === self.location.origin &&
    (url.pathname === '/sw.js' ||
      url.pathname === '/dev-sw.js' ||
      url.pathname.startsWith('/workbox-'))
  ) {
    return;
  }

  // Content manifest: Network-First with cache fallback
  if (url.origin === self.location.origin && url.pathname === '/api/content-manifest') {
    event.respondWith(handleNetworkFirst(request, CONTENT_CACHE_NAME, 3000));
    return;
  }

  // Never cache /api/health, /api/sync-progress, /api/ask-rafiq, /api/tts
  if (url.origin === self.location.origin && url.pathname.startsWith('/api/')) {
    return;
  }

  // Google Fonts: Cache-First so Arabic Cairo font works offline
  if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
    event.respondWith(handleCacheFirst(request, FONT_CACHE_NAME));
    return;
  }

  // Only handle same-origin requests from here on
  if (url.origin !== self.location.origin) {
    return;
  }

  // Navigation requests (HTML shell): guaranteed offline fallback (prevents browser offline dinosaur page)
  if (
    request.mode === 'navigate' ||
    (request.headers.get('accept') || '').includes('text/html')
  ) {
    event.respondWith(handleNavigationRequest(request));
    return;
  }

  // Hashed build bundles & static media assets: Cache-First
  if (
    url.pathname.startsWith('/assets/') ||
    /\.(?:png|jpg|jpeg|svg|gif|webp|wav|mp3|ogg|ico|woff|woff2)$/i.test(url.pathname)
  ) {
    event.respondWith(handleCacheFirst(request, ASSET_CACHE_NAME));
    return;
  }

  // All other same-origin JS/TSX/CSS/Vite modules/manifest/data: Network-First with instant offline cache fallback
  event.respondWith(handleNetworkFirst(request, RUNTIME_CACHE_NAME, 2500));
});
