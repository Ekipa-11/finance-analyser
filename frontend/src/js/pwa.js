


const VAPID_PUBLIC_KEY = 'BAEME5cz820vFswVPkerrtQtAGHt-62Yel2u6Kwc3OkJDiAuj3AChJSxjNmXEUDtF0n2Db8FL9XvOqhfxzT7Nfg';

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = atob(base64);
  return new Uint8Array([...raw].map(char => char.charCodeAt(0)));
}

if ('serviceWorker' in navigator && 'PushManager' in window) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then(registration => {
        console.log('✅ Service Worker registered:', registration);

        return navigator.serviceWorker.ready;
      })
      .then(readyRegistration => {
        console.log('📦 Service Worker ready');
        return readyRegistration.pushManager.getSubscription().then(subscription => {
          if (subscription) {
            console.log('🔔 Already subscribed:', subscription);
            return subscription;
          }

          const applicationServerKey = urlBase64ToUint8Array(VAPID_PUBLIC_KEY);
          return readyRegistration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey
          });
        });
      })
      .then(subscription => {
        console.log('📨 Push Subscription:', JSON.stringify(subscription));
        // TODO: Send subscription to your server
      })
      .catch(error => {
        console.error('❌ Service Worker registration or push subscription failed:', error);
      });
  });
}