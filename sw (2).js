const CACHE = 'kpi-v3';
const ASSETS = ['/kpi-tracker/', '/kpi-tracker/index.html', '/kpi-tracker/manifest.json'];
self.addEventListener('install', e => e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS))));
self.addEventListener('fetch', e => {
  if(e.request.url.includes('firestore') || e.request.url.includes('googleapis') || e.request.url.includes('gstatic')) return;
  e.respondWith(caches.match(e.request).then(r => r || fetch(e.request)));
});
