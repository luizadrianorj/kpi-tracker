const CACHE = 'kpi-v4';
const ASSETS = ['/kpi-tracker/', '/kpi-tracker/index.html', '/kpi-tracker/manifest.json'];

self.addEventListener('install', e => e.waitUntil(
  caches.open(CACHE).then(c => c.addAll(ASSETS))
));

self.addEventListener('fetch', e => {
  if (e.request.url.includes('firestore') ||
      e.request.url.includes('googleapis') ||
      e.request.url.includes('gstatic')) return;
  e.respondWith(caches.match(e.request).then(r => r || fetch(e.request)));
});

self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(clients.openWindow('/kpi-tracker/'));
});

self.addEventListener('message', e => {
  if (e.data && e.data.type === 'SCHEDULE_NOTIFICATION') {
    const { hour, minute, pendingCount, totalCount } = e.data;
    scheduleDaily(hour, minute, pendingCount, totalCount);
  }
});

let scheduledTimer = null;

function scheduleDaily(hour, minute, pendingCount, totalCount) {
  if (scheduledTimer) clearTimeout(scheduledTimer);
  const now = new Date();
  const next = new Date();
  next.setHours(hour, minute, 0, 0);
  if (next <= now) next.setDate(next.getDate() + 1);
  const delay = next - now;
  scheduledTimer = setTimeout(() => {
    fireNotification(pendingCount, totalCount);
    scheduleDaily(hour, minute, pendingCount, totalCount);
  }, delay);
}

function fireNotification(pendingCount, totalCount) {
  const done = totalCount - pendingCount;
  let title, body;
  if (pendingCount === 0) {
    title = 'KPI Diário — Missão cumprida!';
    body = `Você completou todos os ${totalCount} KPIs hoje. Incrível!`;
  } else if (pendingCount === totalCount) {
    title = 'KPI Diário — Hora de agir!';
    body = `Você ainda não marcou nenhum KPI hoje. São ${totalCount} metas te esperando.`;
  } else {
    title = `KPI Diário — Faltam ${pendingCount}!`;
    body = `Você completou ${done} de ${totalCount} KPIs hoje. Vai lá fechar o dia!`;
  }
  self.registration.showNotification(title, {
    body,
    icon: '/kpi-tracker/icon-192.png',
    badge: '/kpi-tracker/icon-192.png',
    tag: 'kpi-daily',
    renotify: true,
    requireInteraction: false,
    vibrate: [200, 100, 200]
  });
}
