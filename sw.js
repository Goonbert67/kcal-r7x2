// Offline cache for the app shell. Always asks the server first (bypassing the
// browser's HTTP cache), so a new upload shows up on the next launch.
const C = 'kalorier-v6';
const FILES = ['./', 'index.html', 'manifest.json', 'icon.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(C).then(c => c.addAll(FILES))); self.skipWaiting(); });
self.addEventListener('activate', e => e.waitUntil(
  caches.keys().then(ks => Promise.all(ks.filter(k => k !== C).map(k => caches.delete(k)))).then(() => self.clients.claim())));
self.addEventListener('fetch', e => {
  const u = new URL(e.request.url);
  if (e.request.method !== 'GET' || u.hostname.includes('openfoodfacts')) return;   // food lookups: always live
  const own = u.origin === self.location.origin;
  e.respondWith(fetch(e.request, own ? { cache: 'no-cache' } : {}).then(r => {
    if (r.ok) { const copy = r.clone(); caches.open(C).then(c => c.put(e.request, copy)); }
    return r;
  }).catch(() => caches.match(e.request)));
});
