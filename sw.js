/*
 * Smart Vineyard — Service Worker
 * Стратегія:
 *  - Навігація (HTML): network-first з відкатом на кешований app shell (офлайн-старт).
 *  - Власні статичні файли: stale-while-revalidate.
 *  - CDN-залежності (Tailwind, Chart.js, twemoji, heic2any, шрифти): stale-while-revalidate
 *    з кешуванням opaque-відповідей (no-cors) для офлайн-роботи.
 *  - API-запити (Open-Meteo, Gemini) НЕ кешуються — дані мають бути свіжими.
 * Версію кешу піднімати при зміні app shell або стратегії.
 */
const VERSION = 'v3';
const APP_CACHE = `sv-app-${VERSION}`;
const RUNTIME_CACHE = `sv-runtime-${VERSION}`;

// Мінімальний app shell для офлайн-старту.
const APP_SHELL = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icon.svg',
  './icon-maskable.svg',
  './src/calc.js',
  './styles.css',
];

// Хости, чиї відповіді кешуємо у runtime для офлайн-роботи UI.
const RUNTIME_HOSTS = [
  'cdn.jsdelivr.net',
  'fonts.googleapis.com',
  'fonts.gstatic.com',
];

// Хости, які НІКОЛИ не кешуємо (живі дані).
const NETWORK_ONLY_HOSTS = [
  'api.open-meteo.com',
  'archive-api.open-meteo.com',
  'generativelanguage.googleapis.com',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(APP_CACHE)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
      .catch(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys.filter((k) => k !== APP_CACHE && k !== RUNTIME_CACHE)
            .map((k) => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

function isNavigationRequest(request) {
  return request.mode === 'navigate' ||
    (request.method === 'GET' && (request.headers.get('accept') || '').includes('text/html'));
}

async function networkFirstNavigation(request) {
  try {
    const fresh = await fetch(request);
    const cache = await caches.open(APP_CACHE);
    cache.put('./index.html', fresh.clone());
    return fresh;
  } catch (err) {
    const cached = await caches.match('./index.html') || await caches.match('./');
    if (cached) return cached;
    throw err;
  }
}

async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  const network = fetch(request)
    .then((response) => {
      if (response && (response.ok || response.type === 'opaque')) {
        cache.put(request, response.clone());
      }
      return response;
    })
    .catch(() => null);
  return cached || network || fetch(request);
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  // Живі дані — завжди мережа, без кешу.
  if (NETWORK_ONLY_HOSTS.includes(url.hostname)) return;

  if (isNavigationRequest(request)) {
    event.respondWith(networkFirstNavigation(request));
    return;
  }

  // Власні статичні ресурси.
  if (url.origin === self.location.origin) {
    event.respondWith(staleWhileRevalidate(request, APP_CACHE));
    return;
  }

  // CDN-залежності.
  if (RUNTIME_HOSTS.includes(url.hostname)) {
    event.respondWith(staleWhileRevalidate(request, RUNTIME_CACHE));
  }
});

// Дозволяємо сторінці форсувати оновлення SW.
self.addEventListener('message', (event) => {
  if (event.data === 'SKIP_WAITING') self.skipWaiting();
});
