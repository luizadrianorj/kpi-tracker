const CACHE = 'kpi-v2';
const ASSETS = ['/', '/index.html', '/manifest.json'];
self.addEventListener('install', e => e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS))));
self.addEventListener('fetch', e => {
  if(e.request.url.includes('firestore') || e.request.url.includes('googleapis')) return;
  e.respondWith(caches.match(e.request).then(r => r || fetch(e.request)));
});
