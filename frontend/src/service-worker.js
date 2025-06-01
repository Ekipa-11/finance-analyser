// src/service-worker.js
import { precacheAndRoute } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { NetworkFirst, NetworkOnly } from 'workbox-strategies';
import { BackgroundSyncPlugin } from 'workbox-background-sync';

// Precache
precacheAndRoute(self.__WB_MANIFEST);

// Runtime cache
registerRoute(
  /\/api\/transactions/,
  new NetworkFirst({ cacheName: 'transactions-cache' })
);

registerRoute(
  /\/api\/transactions/,
  new NetworkOnly({
    plugins: [
      new BackgroundSyncPlugin('transactions-queue', {
        maxRetentionTime: 24 * 60
      }),
    ],
  }),
);

// Push Notification
self.addEventListener('push', (event) => {
  console.log('[Service Worker] Push received');
  const data = event.data?.json() || {};
  const title = data.title || 'Default Title';
  const options = {
    body: data.body || 'Default body',
    icon: '/icon.png',
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('push', function(event) {
  console.log('[Service Worker] Push Received');

  let data = {};
  try {
    data = event.data.json();
  } catch (e) {
    console.error('Push payload was not JSON', e);
    data = { title: 'Notification', body: 'No data' };
  }

  const title = data.title || 'Default Title';
  const options = {
    body: data.body || 'No content',
    icon: '/icon.png',       // Optional
    badge: '/badge.png'      // Optional
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});
