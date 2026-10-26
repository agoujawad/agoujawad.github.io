// Vaccin'Assist : fonctionnement hors ligne. Changer VERSION à chaque mise à jour du site.
const VERSION = 'va-app-2';
const CORE = [
  './', 'index.html', 'manifest.webmanifest',
  'fonts/Alexandria-arabic.woff2',
  'fonts/JetBrainsMono-480c0625.woff2',
  'fonts/JetBrainsMono-ba16536d.woff2',
  'fonts/MontserratAlternates-4731bef9.woff2',
  'fonts/MontserratAlternates-5f237f6b.woff2',
  'fonts/PlusJakartaSans-9f6257e3.woff2',
  'fonts/PlusJakartaSans-fdb05bf0.woff2',
  'fonts/Sora-4fa0aa0c.woff2',
  'fonts/Sora-f9e5e339.woff2',
  'fonts/fonts.css',
  'icons/apple-touch-icon.png',
  'icons/favicon-32.png',
  'icons/icon-192.png',
  'icons/icon-512.png',
  'icons/maskable-512.png',
  'img/campagne-allaitement.jpg',
  'img/campagne-bronchiolite.jpg',
  'img/campagne-depistage.jpg',
  'video/apercu.jpg',
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(CORE)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => k.startsWith('va-app-') && k !== VERSION && k !== 'va-app-docs').map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

// Page : réseau d'abord (pour recevoir les mises à jour), sinon la copie enregistrée.
// Documents et vidéo : enregistrés à la première ouverture, puis disponibles hors ligne.
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  if (req.mode === 'navigate') {
    e.respondWith(fetch(req).then(r => {
      const copy = r.clone(); caches.open(VERSION).then(c => c.put('index.html', copy)); return r;
    }).catch(() => caches.match('index.html')));
    return;
  }
  if (req.headers.has('range')) return;
  e.respondWith(caches.match(req).then(hit => hit || fetch(req).then(r => {
    if (r.ok && /\/(docs|video)\//.test(req.url)) { const copy = r.clone(); caches.open('va-app-docs').then(c => c.put(req, copy)); }
    return r;
  })));
});
