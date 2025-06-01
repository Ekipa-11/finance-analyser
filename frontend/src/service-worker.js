import { precacheAndRoute } from 'workbox-precaching';

// This is required for InjectManifest to inject the precache manifest here
precacheAndRoute(self.__WB_MANIFEST);

self.addEventListener('install', event => {
  console.log('[SW] Installed');
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  console.log('[SW] Activated');
  self.clients.claim();
});

self.addEventListener('push', event => {
  console.log('[SW] Push received');
  const data = event.data ? event.data.text() : 'No payload';
  const options = {
    body: data,
    icon: '/icon.png', // Optional
    badge: '/badge.png' // Optional
  };

  event.waitUntil(
    self.registration.showNotification('Push Notification', options)
  );
});