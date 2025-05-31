//src/js/register.js
import { register } from './api.js';

export default function initRegister() {
  const form = document.getElementById('register-form');
  const errorEl = document.getElementById('register-error');
  if (!form) return;

  function showError(msg) {
    errorEl.textContent = msg;
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorEl.textContent = '';

    const email = form.email.value.trim();
    const password = form.password.value.trim();
    const confirmPassword = form['confirm-password'].value.trim();
    const username = form.username.value.trim();

    if (!email || !password || !username || !confirmPassword) {
      showError('All fields are required.');
      return;
    }
    if (password.length < 6) {
      showError('Password must be at least 6 characters long.');
      return;
    }    
    if (password !== confirmPassword) {
      showError('Passwords do not match.');
      return;
    }

    try {
      const { token, user } = await register(email, username, password);

      localStorage.setItem('token', token);
      localStorage.setItem('currentUser', email);

      window.location.href = 'budget.html';
    } catch (err) {
      showError(err.message);
    }
  });

  const loginBtn = document.getElementById('login');
  console.log('Login button:', loginBtn);
  if (loginBtn) {
    console.log('Login button found, adding listener');
    loginBtn.addEventListener('click', () => {
      console.log('Login button clicked, redirecting to login page');
      window.location.href = '/login';
    });
  }
}
