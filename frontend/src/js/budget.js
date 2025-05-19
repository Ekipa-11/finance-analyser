// src/js/budget.js
export default function initBudget() {
  const run = () => {
    // guard: redirect to login if not authenticated
    if (!localStorage.getItem('authToken')) {
      return window.location.replace('login.html');
    }

    const btn = document.getElementById('logout-btn');
    console.log('[budget.js] logout button:', btn);
    if (!btn) return;

    console.log('[budget.js] initializing logout handler');
    btn.addEventListener('click', () => {
      localStorage.removeItem('authToken');
      window.location.replace('login.html');
    });
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run);
  } else {
    run();
  }
}
