const CACHE = 'scv-v1';

self.addEventListener('install', (e) => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll([
      '/',
      '/manifest.json',
      '/images/icon-1024.png',
    ]))
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(clients.claim());
});

self.addEventListener('push', (e) => {
  let data = { titulo: 'SCV', mensaje: '', icono: '/images/icon-1024.png', badge: '/images/icon-1024.png' };
  try {
    const payload = e.data?.json();
    if (payload) {
      data.titulo = payload.titulo || data.titulo;
      data.mensaje = payload.mensaje || '';
      data.icono = payload.icono || data.icono;
      data.badge = payload.badge || data.badge;
      data.tag = payload.tag || 'scv-default';
      data.url = payload.url || '/';
    }
  } catch (_) {
    data.mensaje = e.data?.text() || '';
  }

  e.waitUntil(
    self.registration.showNotification(data.titulo, {
      body: data.mensaje,
      icon: data.icono,
      badge: data.badge,
      tag: data.tag,
      renotify: true,
      vibrate: [200, 100, 200],
      data: { url: data.url },
    })
  );
});

self.addEventListener('notificationclick', (e) => {
  e.notification.close();
  const url = e.notification.data?.url || '/';
  e.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      for (const client of windowClients) {
        if (client.url === url && 'focus' in client) return client.focus();
      }
      if (clients.openWindow) return clients.openWindow(url);
    })
  );
});
