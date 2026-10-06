// Caches the app shell so it opens offline. Food lookups still need internet.
const C = 'kalorier-v3';
const FILES = ['./', 'index.html', 'manifest.json', 'icon.png',
  'https://unpkg.com/html5-qrcode@2.3.8/html5-qrcode.min.js'];
self.addEventListener('install', e => { e.waitUntil(caches.open(C).then(c => c.addAll(FILES))); self.skipWaiting(); });
self.addEventListener('activate', e => e.waitUntil(
  caches.keys().then(ks => Promise.all(ks.filter(k => k !== C).map(k => caches.delete(k)))).then(() => self.clients.claim())));
self.addEventListener('fetch', e => {
  const u = new URL(e.request.url);
  if (u.hostname.includes('openfoodfacts')) return;           // always live
  e.respondWith(fetch(e.request).then(r => {                   // network first, cache fallback
    const copy = r.clone(); caches.open(C).then(c => c.put(e.request, copy)); return r;
  }).catch(() => caches.match(e.request)));
});
