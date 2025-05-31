// src/js/auth.js
import { login } from './api.js';

export default function initAuth() {
  const form = document.getElementById('login-form');
  const errorEl = document.getElementById('login-error');
  if (!form) return;

  function showError(msg) {
    errorEl.textContent = msg;
  }

  form.addEventListener('submit', async e => {
    e.preventDefault();
    errorEl.textContent = '';

    const email = form.email.value.trim();
    const password = form.password.value.trim();

    if (!email || !password) {
      showError('Both fields are required.');
      return;
    }

    try {
      const { token, user } = await login(email, password);


      localStorage.setItem('token', token);
      localStorage.setItem('currentUser', email);

      window.location.href = 'budget.html';
    } catch (err) {
      showError(err.message);
    }
  });
}
