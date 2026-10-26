// Ancien service worker de la racine : il se retire et efface ses copies.
// Vaccin'Assist a maintenant son propre service worker dans /vaccinassist/.
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => ['va-web-1.0-1', 'va-docs', 'va-app-1', 'va-app-2'].includes(k)).map(k => caches.delete(k))))
    .then(() => self.registration.unregister())
    .then(() => self.clients.matchAll())
    .then(list => list.forEach(c => c.navigate(c.url))));
});
