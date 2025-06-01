// Custom push notification handler (Webpack won't override this)
self.addEventListener('push', (event) => {
  const payload = event.data?.json() || {
    title: 'New Update',
    body: 'You have new updates!',
    icon: '/icons/notification-icon.png'
  };

  event.waitUntil(
    self.registration.showNotification(payload.title, {
      body: payload.body,
      icon: payload.icon,
      data: { url: payload.url || '/' }
    })
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  clients.openWindow(event.notification.data.url);
});