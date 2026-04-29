self.addEventListener('push', (event) => {
  if (!event.data) return;

  let data = {};
  try { data = event.data.json(); } catch { data = { title: 'New notification', body: event.data.text() }; }

  const title   = data.title ?? 'Campuxo';
  const options = {
    body:  data.body ?? '',
    icon:  data.icon ?? '/campuxo_logo.png',
    badge: '/campuxo_logo.png',
    data:  { link: data.link ?? '/notifications' },
    vibrate: [200, 100, 200],
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const link = event.notification.data?.link ?? '/notifications';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((list) => {
      const existing = list.find(c => c.url.includes(self.location.origin));
      if (existing) {
        existing.focus();
        existing.navigate(self.location.origin + link);
      } else {
        clients.openWindow(self.location.origin + link);
      }
    })
  );
});
