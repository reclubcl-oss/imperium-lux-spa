// Service worker — solo maneja las notificaciones push. No guarda páginas en
// caché a propósito: así el sitio siempre muestra la versión más reciente.

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()));

self.addEventListener('push', (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch {
    data = { body: event.data ? event.data.text() : '' };
  }

  // iOS exige mostrar siempre una notificación por cada push recibido
  // (userVisibleOnly); si no, Safari termina revocando la suscripción.
  event.waitUntil(
    self.registration.showNotification(data.title || 'Clínica Estética Imperium', {
      body: data.body || '',
      icon: '/icon-192.png',
      badge: '/badge-96.png',
      tag: data.tag || undefined,
      data: { url: data.url || '/' },
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  // Solo se abren rutas del propio sitio, aunque el payload traiga otra cosa.
  let target = new URL('/', self.location.origin);
  try {
    const candidate = new URL(event.notification.data?.url || '/', self.location.origin);
    if (candidate.origin === self.location.origin) target = candidate;
  } catch { /* usa la portada */ }

  event.waitUntil((async () => {
    const windows = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    for (const client of windows) {
      try {
        await client.navigate(target.href);
        return client.focus();
      } catch { /* prueba con la siguiente o abre una nueva */ }
    }
    return self.clients.openWindow(target.href);
  })());
});
