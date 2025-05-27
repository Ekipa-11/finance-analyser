// src/js/budget.js
import { getEntries, addEntry } from './api.js';

export default function initBudget() {
  // 1) Auth guard
  const token = localStorage.getItem('token');
  if (!token) {
    return window.location.href = 'login.html';
  }

  // 2) Grab DOM elements
  const listEl = document.getElementById('entries-list');
  const form = document.getElementById('entry-form');
  const error = document.createElement('p');
  error.className = 'text-danger mt-2';
  form.appendChild(error);

  // 3) Render helper
  function render(entries) {
    listEl.innerHTML = '';
    if (entries.length === 0) {
      listEl.innerHTML = '<li class="list-group-item">No entries yet</li>';
      return;
    }
    entries.forEach(e => {
      const li = document.createElement('li');
      li.className = 'list-group-item d-flex justify-content-between align-items-center';
      const displayDate = new Date(e.date).toLocaleDateString();
      li.innerHTML = `
      <div>
        <strong>${e.category}</strong> 
        <span class="badge bg-${e.type === 'income' ? 'success' : 'danger'
        } ms-2">${e.type}</span>
        <div class="text-muted small">${displayDate}</div>
      </div>
      <span>${e.amount.toFixed(2)}</span>
    `;
      listEl.append(li);
    });
  }

  // 4) Initial fetch + render
  getEntries()
    .then(render)
    .catch(err => {
      console.error(err);
      listEl.innerHTML = '<li class="list-group-item text-danger">Failed to load entries</li>';
    });

  // 5) Hook up the form
  form.addEventListener('submit', async e => {
    e.preventDefault();
    error.textContent = '';

    const entry = {
      type: form.type.value,
      amount: parseFloat(form.amount.value),
      category: form.category.value.trim(),
      date: form.date.value.split('T')[0], // Only keep the date part
      description: form.description.value.trim(),
    };

    try {
      const newEntry = await addEntry(entry);
      // clear inputs
      form.reset();
      // re-fetch and re-render (or just append newEntry)
      getEntries().then(render);
    } catch (err) {
      console.error(err);
      error.textContent = err.message || 'Failed to add entry';
    }
  });

  // 5) Logout button
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      // remove only your auth items
      localStorage.removeItem('token');
      localStorage.removeItem('currentUser');
      // redirect back to login
      window.location.href = 'login.html';
    });
  }

}
