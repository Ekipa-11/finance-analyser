// src/js/auth.js
export default function initAuth() {
  const run = () => {
    const btn = document.getElementById('login-btn');
    console.log('[auth.js] button:', btn);
    if (!btn) return;  // not on login page, bail

    console.log('[auth.js] initializing login handler');
    btn.addEventListener('click', () => {
      localStorage.setItem('authToken', 'stub-token');
      window.location.href = 'budget.html';
    });
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run);
  } else {
    run();
  }
}
