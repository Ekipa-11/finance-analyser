// src/js/auth.js
import { login } from './api.js';

export default function initAuth() {
  const form = document.getElementById('login-form');
  const errorEl = document.getElementById('login-error');
  if (!form) return; // not on login page

  function showError(msg) {
    errorEl.textContent = msg;
    errorEl.classList.add('visible');
  }

  form.addEventListener('submit', async e => {
    e.preventDefault();
    errorEl.classList.remove('visible');

    const username = form.username.value.trim();
    const password = form.password.value.trim();

    if (!username || !password) {
      showError('Both fields are required.');
      return;
    }

    try {
      const { token, user } = await login(username, password);
      // save to localStorage
      localStorage.setItem('authToken', token);
      localStorage.setItem('currentUser', user.username);
      // redirect
      window.location.href = 'budget.html';
    } catch (err) {
      showError(err.message);
    }
  });
}
