// bring in your CSS & manifest so Webpack bundles/copies them
import './css/styles.css';
import './manifest.json';

// register your SW
import './js/pwa.js';

import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap';

import './icons/logo_1024x1024.png';
import './icons/logo_512x512.png';
import './icons/logo_192x192.png';
import './icons/logo_96x96.png';
import './icons/screenshot_1.png';
import './icons/screenshot_2.png';
import './icons/favicon.ico';

// normalize page name
const raw = window.location.pathname.split('/').pop();
const page = !raw || raw === '' ? 'login.html' : raw;
console.log('[index.js] Detected page:', page);

if (page === 'login.html' || page === 'login') {
  import('./js/auth.js')
    .then((mod) => {
      console.log('[index.js] auth.js module loaded');
      mod.default();
    })
    .catch((err) => console.error('[index.js] auth.js failed:', err));
} else if (page === 'budget.html' || page === 'budget') {
  import('./js/budget.js')
    .then((mod) => {
      console.log('[index.js] budget.js module loaded');
      mod.default();
    })
    .catch((err) => console.error('[index.js] budget.js failed:', err));
} 
 else if (page === 'graphs.html' || page === 'graphs') {
  import('./js/graphs.js')
    .then((mod) => {
      console.log('[index.js] graphs.js module loaded');
      mod.default();
    })
    .catch((err) => console.error('[index.js] graphs.js failed:', err));
}
else if (page === 'register.html' || page === 'register') {
  import('./js/register.js')
    .then((mod) => {
      console.log('[index.js] register.js module loaded');
      mod.default();
    })
    .catch((err) => console.error('[index.js] register.js failed:', err));
} else {
  console.warn('[index.js] No script for page:', page);
}

