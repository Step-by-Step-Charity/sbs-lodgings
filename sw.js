/* ─────────────────────────────────────────────────────────────
   Step by Step Supported Lodgings kiosk — Service Worker
   Pages: network first (always the latest when online), falling back to
   the saved copy after 4s or offline. Photos: cache first.

   Bump CACHE_VERSION (and PAGE_VERSION in index.html) whenever anything
   changes, so devices pick up the new copy.
   ───────────────────────────────────────────────────────────── */
const CACHE_VERSION = 'sbs-lodgings-v77';

const PRECACHE = [
  './',
  './index.html',
  './manifest.webmanifest',
  './project/assets/logo-primary-white.png',
  './project/assets/logo-secondary-white.png',
  './project/assets/photo-mum-daughter.jpg',
  './project/assets/qr-donate.png',
  './project/assets/sl-young-person.jpg',
  './project/assets/sl-sofa-chat.jpg',
  './project/assets/sl-host-garden.jpg',
  './project/assets/jess-portrait-small.jpg',
  './project/assets/sl-ella-richard-card.jpg',
  './project/assets/sl-lydia.jpg'
];

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_VERSION);
    await Promise.all(PRECACHE.map(async (url) => {
      try {
        const res = await fetch(url, { cache: 'reload' });
        if (res.ok) await cache.put(url, res);
      } catch (e) { console.warn('[sw] precache skipped:', url); }
    }));
    self.skipWaiting();
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => k !== CACHE_VERSION).map(k => caches.delete(k)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;   // ActiveCampaign etc. go straight to the network

  if (req.mode === 'navigate') {
    event.respondWith((async () => {
      const cache = await caches.open(CACHE_VERSION);
      try {
        const res = await Promise.race([
          fetch(req, { cache: 'no-store' }),
          new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), 4000))
        ]);
        if (res && res.ok) cache.put('./index.html', res.clone());
        return res;
      } catch (e) {
        const saved = await caches.match('./index.html');
        if (saved) return saved;
        throw e;
      }
    })());
    return;
  }

  event.respondWith((async () => {
    const cached = await caches.match(req);
    if (cached) return cached;
    const res = await fetch(req);
    if (res && res.ok) { const cache = await caches.open(CACHE_VERSION); cache.put(req, res.clone()); }
    return res;
  })());
});

self.addEventListener('message', (event) => {
  if (event.data === 'skipWaiting') self.skipWaiting();
});
