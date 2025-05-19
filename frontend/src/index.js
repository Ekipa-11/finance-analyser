// bring in your CSS & manifest so Webpack bundles/copies them
import './css/styles.css';
import './manifest.json';

// register your SW
import './js/pwa.js';



// normalize page name
const raw = window.location.pathname.split('/').pop();
const page = (!raw || raw === '') ? 'login.html' : raw;
console.log('[index.js] Detected page:', page);


if (page === 'login.html') {
  import('./js/auth.js')
    .then(mod => {
      console.log('[index.js] auth.js module loaded');
      mod.default();                
    })
    .catch(err => console.error('[index.js] auth.js failed:', err));
} else if (page === 'budget.html') {
  import('./js/budget.js')
    .then(mod => {
      console.log('[index.js] budget.js module loaded');
      mod.default();
    })
    .catch(err => console.error('[index.js] budget.js failed:', err));
} else {
  console.warn('[index.js] No script for page:', page);
}
