/**
 * AskPay Service Worker
 *
 * Strategy:
 *   - /_next/static/**  → Cache-first (content-hashed, safe forever)
 *   - /api/**           → Network-only, NEVER cached (answers must be fresh)
 *   - Icons / manifest  → Cache-first
 *   - HTML pages        → Network-first, fall back to cache
 *
 * Registration is skipped entirely when running inside MiniPay's WebView
 * (guarded in service-worker-registration.tsx before register() is called).
 */

const CACHE_NAME = "askpay-shell-v1";

/**
 * Static assets that are safe to cache indefinitely.
 * Next.js content-hashes these paths so stale cache is never served.
 */
const PRECACHE_URLS = [
  "/",
  "/manifest.json",
  "/favicon.png",
  "/favicon-32.png",
  "/apple-touch-icon.png",
];

// ---------------------------------------------------------------------------
// Install — precache the app shell
// ---------------------------------------------------------------------------

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

// ---------------------------------------------------------------------------
// Activate — delete old caches
// ---------------------------------------------------------------------------

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== CACHE_NAME)
            .map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

// ---------------------------------------------------------------------------
// Fetch — route-based caching logic
// ---------------------------------------------------------------------------

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // 1. Only handle same-origin requests
  if (url.origin !== self.location.origin) {
    return; // Let browser handle cross-origin (fonts, RPC calls, etc.)
  }

  // 2. NEVER cache /api/** — always go to the network
  if (url.pathname.startsWith("/api/")) {
    event.respondWith(fetch(request));
    return;
  }

  // 3. Cache-first for Next.js static assets (/_next/static/**)
  //    These are content-hashed so caching forever is safe.
  if (url.pathname.startsWith("/_next/static/")) {
    event.respondWith(
      caches.match(request).then(
        (cached) =>
          cached ||
          fetch(request).then((networkRes) => {
            const clone = networkRes.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
            return networkRes;
          })
      )
    );
    return;
  }

  // 4. Cache-first for static files in /public (icons, manifest)
  if (
    url.pathname === "/manifest.json" ||
    url.pathname.startsWith("/favicon") ||
    url.pathname.startsWith("/apple-touch-icon")
  ) {
    event.respondWith(
      caches.match(request).then(
        (cached) =>
          cached ||
          fetch(request).then((networkRes) => {
            const clone = networkRes.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
            return networkRes;
          })
      )
    );
    return;
  }

  // 5. Network-first for HTML navigation requests (pages)
  //    Falls back to cache only if network is completely unreachable.
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((networkRes) => {
          // Cache a fresh copy for offline fallback
          const clone = networkRes.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          return networkRes;
        })
        .catch(() => caches.match(request))
    );
    return;
  }

  // 6. Default: network only (don't cache unknown request types)
});
