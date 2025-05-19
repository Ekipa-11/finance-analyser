// src/js/budget.js
import { getEntries, addEntry } from './api.js';

export default function initBudget() {
  const logoutBtn = document.getElementById('logout-btn');
  if (!logoutBtn) return; // not on budget page

  // guard
  if (!localStorage.getItem('authToken')) {
    return window.location.replace('login.html');
  }

  logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
    window.location.replace('login.html');
  });

  const listEl = document.getElementById('entries-list');
  const form = document.getElementById('entry-form');

  // 1) render existing entries
  getEntries().then(entries => {
    listEl.innerHTML = entries.map(e =>
      `<li>${e.date} – ${e.category}: ${e.type === 'expense' ? '-' : '+'}${e.amount} (${e.description})</li>`
    ).join('');
  });

  // 2) wire up add-entry form
  if (form) {
    form.addEventListener('submit', async e => {
      e.preventDefault();
      const entry = {
        type: form.type.value,
        amount: parseFloat(form.amount.value),
        category: form.category.value,
        date: form.date.value,
        description: form.description.value.trim()
      };
      try {
        const newEntry = await addEntry(entry);
        // append to list
        const li = document.createElement('li');
        li.textContent = `${newEntry.date} – ${newEntry.category}: ${newEntry.type==='expense'?'-':''}${newEntry.amount} (${newEntry.description})`;
        listEl.appendChild(li);
        form.reset();
      } catch(err) {
        console.error('Add entry failed:', err);
      }
    });
  }
}
