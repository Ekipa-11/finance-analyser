// src/js/budget.js
import { getEntries, addEntry, authHeader, updateEntry, deleteEntry } from './api.js';
import { downloadReport, exportTransactions } from './download-files.js';
import { Modal } from 'bootstrap';

export default function initBudget() {
  // ─── 1) Auth guard ───
  const token = localStorage.getItem('token');
  if (!token) {
    window.location.href = 'login.html';
    return;
  }

  // ─── 2) Logout button ───
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      localStorage.removeItem('token');
      localStorage.removeItem('currentUser');
      window.location.href = 'login.html';
    });
  }

  // ─── 3) Transactions: cache elements ───
  const listEl = document.getElementById('entries-list');
  const txForm = document.getElementById('entry-form');
  const txError = document.createElement('p');
  txError.className = 'text-danger mt-2';
  txForm.appendChild(txError);

  // ─── 4) Cache “Edit Transaction” modal elements ───
  const editModalEl = document.getElementById('editTransactionModal');
  const editTxForm = document.getElementById('edit-transaction-form');
  const editTxError = document.getElementById('edit-tx-error');
  const editIdInput = document.getElementById('edit-tx-id');
  const editTypeInput = document.getElementById('edit-tx-type');
  const editAmountInput = document.getElementById('edit-tx-amount');
  const editCategoryInput = document.getElementById('edit-tx-category');
  const editDateInput = document.getElementById('edit-tx-date');
  const editDescInput = document.getElementById('edit-tx-description');

  // Instantiate the Bootstrap modal (requires Bootstrap JS)
  const editModal = new Modal(editModalEl);

  // ─── 5) Local app state for entries ───
  let allEntries = [];
  let pendingOps = JSON.parse(localStorage.getItem('pendingOps') || '[]');

  function saveQueue() {
    localStorage.setItem('pendingOps', JSON.stringify(pendingOps));
  }
  function queueOfflineOp(op) {
    pendingOps.push(op);
    saveQueue();
    console.log('[budget.js] Offline op queued:', op);
  }
  function saveLocalEntries() {
    localStorage.setItem('allEntries', JSON.stringify(allEntries));
  }
  function loadLocalEntries() {
    try {
      const local = localStorage.getItem('allEntries');
      return local ? JSON.parse(local) : [];
    } catch {
      return [];
    }
  }

  // ─── 6) Online/Offline UI state ───
  const budgetError = document.getElementById('budget-error');
  function showOfflineMsg() {
    budgetError.textContent = 'You are offline. Changes will sync automatically when back online.';
  }
  function clearStatusMsg() {
    budgetError.textContent = '';
  }
  if (!navigator.onLine) showOfflineMsg();

  window.addEventListener('offline', showOfflineMsg);

  window.addEventListener('online', async () => {
    budgetError.textContent = 'You are back online. Syncing offline changes...';
    await syncPendingOps();
    clearStatusMsg();
  });

  // ─── 7) Sync offline queue when online ───
  async function syncPendingOps() {
    if (!pendingOps.length) return;
    budgetError.textContent = 'Syncing offline changes...';
    for (const op of pendingOps) {
      try {
        if (op.type === 'add')      await addEntry(op.payload);
        else if (op.type === 'update') await updateEntry(op.id, op.payload);
        else if (op.type === 'delete') await deleteEntry(op.id);
      } catch (err) {
        console.error('[budget.js] Error replaying pending op', op, err);
        budgetError.textContent = 'Some offline changes could not be synced. Please retry.';
        return;
      }
    }
    pendingOps = [];
    saveQueue();
    // Refresh entries from server
    try {
      allEntries = await getEntries();
      renderEntries(allEntries);
      saveLocalEntries();
    } catch (err) {
      console.error('[budget.js] Could not refresh entries after sync:', err);
      budgetError.textContent = 'Could not refresh entries after syncing.';
    }
    budgetError.textContent = '';
  }
  if (navigator.onLine && pendingOps.length) {
    syncPendingOps();
  }

  // ─── 8) Transactions list rendering ───
  function renderEntries(entries) {
    allEntries = entries;
    saveLocalEntries();
    listEl.innerHTML = '';
    if (!entries.length) {
      listEl.innerHTML = '<li class="list-group-item">No entries yet</li>';
      return;
    }

    entries.forEach((e) => {
      const li = document.createElement('li');
      li.className =
        'list-group-item d-flex justify-content-between align-items-center';

      const displayDate = new Date(e.date).toLocaleDateString();
      li.innerHTML = `
        <div>
          <strong>${e.category}</strong>
          <span class="badge bg-${e.type === 'income' ? 'success' : 'danger'} ms-2">
            ${e.type}
          </span>
          <div class="text-muted small">${displayDate}</div>
        </div>
        <div class="d-flex align-items-center">
          <span class="me-3">${e.amount.toFixed(2)}</span>
          <button type="button" class="btn btn-sm btn-outline-primary edit-btn me-2" data-id="${e.id}">
            <i class="bi bi-pencil"></i>
          </button>
          <button type="button" class="btn btn-sm btn-outline-danger delete-btn" data-id="${e.id}">
            <i class="bi bi-trash"></i>
          </button>
        </div>
      `;
      listEl.append(li);
    });

    // ─── Attach "Delete" listeners ───
    document.querySelectorAll('.delete-btn').forEach((btn) => {
      btn.addEventListener('click', async (event) => {
        const id = event.currentTarget.getAttribute('data-id');
        if (!id) return;
        if (!confirm('Are you sure you want to delete this transaction?')) return;
        console.log(id);

        try {
          if (!navigator.onLine) throw new Error('offline');
          await deleteEntry(id);
          allEntries = allEntries.filter(x => (x.id + '') !== (id + ''));
          renderEntries(allEntries);
        } catch (err) {
          if (err.message === 'offline') {
            queueOfflineOp({ type: 'delete', id });
            // Optimistically update UI:
            allEntries = allEntries.filter(x => (x.id + '') !== (id + ''));
            renderEntries(allEntries);
            alert('Deleted offline. Will sync when online.');
          } else {
            console.error('[budget.js] Failed to delete entry:', err);
            alert(err.message || 'Error deleting transaction');
          }
        }
      });
    });

    // ─── Attach "Edit" listeners ───
    document.querySelectorAll('.edit-btn').forEach((btn) => {
      btn.addEventListener('click', (event) => {
        const id = event.currentTarget.getAttribute('data-id');
        if (!id) return;
        console.log(id);

        // Find the entry by e.id:
        const entry = allEntries.find((x) => (x.id + '') === (id + ''));
        if (!entry) {
          console.error('[budget.js] Entry not found for editing, id:', id);
          return;
        }

        // Pre-fill the modal’s fields
        editIdInput.value = entry.id;
        editTypeInput.value = entry.type;
        editAmountInput.value = entry.amount;
        editCategoryInput.value = entry.category;
        editDateInput.value = entry.date.split('T')[0] || entry.date;
        editDescInput.value = entry.description || '';
        editTxError.textContent = '';

        // Show the modal
        editModal.show();
      });
    });
  }

  // ─── 9) Initial fetch & render ───
  (async () => {
    if (navigator.onLine) {
      try {
        allEntries = await getEntries();
        renderEntries(allEntries);
      } catch (err) {
        console.error('[budget.js] Failed to load entries:', err);
        budgetError.textContent = 'Failed to load entries from server.';
        // Try to use cached
        allEntries = loadLocalEntries();
        renderEntries(allEntries);
      }
    } else {
      allEntries = loadLocalEntries();
      renderEntries(allEntries);
    }
  })();

  // ─── 10) “Add Transaction” form listener ───
  txForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    txError.textContent = '';

    const entry = {
      type:        txForm.type.value,
      amount:      parseFloat(txForm.amount.value),
      category:    txForm.category.value.trim(),
      date:        txForm.date.value,
      description: txForm.description.value.trim(),
    };

    try {
      if (!navigator.onLine) throw new Error('offline');
      await addEntry(entry);
      allEntries.push(entry);
      txForm.reset();
      // Refetch latest from server for canonical state
      getEntries()
        .then(entries => {
          allEntries = entries;
          renderEntries(allEntries);
        })
        .catch(err => {
          console.error('[budget.js] Failed to refresh after add:', err);
        });
    } catch (err) {
      if (err.message === 'offline') {
        queueOfflineOp({ type: 'add', payload: entry });
        // Optimistically update local entries
        const tempEntry = { ...entry, id: `temp-${Date.now()}` };
        allEntries.push(tempEntry);
        renderEntries(allEntries);
        txForm.reset();
        txError.textContent = 'Added offline. Will sync when online.';
      } else {
        console.error('[budget.js] Failed to add entry:', err);
        txError.textContent = err.message || 'Failed to add transaction';
      }
    }
  });

  // ─── 11) “Edit Transaction” modal form listener ───
  editTxForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    editTxError.textContent = '';

    const id = document.getElementById('edit-tx-id').value;
    const updatedEntry = {
      type:        document.getElementById('edit-tx-type').value,
      amount:      parseFloat(document.getElementById('edit-tx-amount').value),
      category:    document.getElementById('edit-tx-category').value.trim(),
      date:        document.getElementById('edit-tx-date').value,
      description: document.getElementById('edit-tx-description').value.trim(),
    };

    try {
      if (!navigator.onLine) throw new Error('offline');
      await updateEntry(id, updatedEntry);
      // Update local
      allEntries = allEntries.map(x => (x.id + '') === (id + '') ? { ...x, ...updatedEntry } : x);
      Modal.getInstance(editModalEl).hide();
      // Refetch latest from server for canonical state
      getEntries()
        .then(entries => {
          allEntries = entries;
          renderEntries(allEntries);
        })
        .catch(err => {
          console.error('[budget.js] Failed to refresh after edit:', err);
        });
    } catch (err) {
      if (err.message === 'offline') {
        queueOfflineOp({ type: 'update', id, payload: updatedEntry });
        Modal.getInstance(editModalEl).hide();
        // Optimistic UI update:
        allEntries = allEntries.map(x => (x.id + '') === (id + '') ? { ...x, ...updatedEntry } : x);
        renderEntries(allEntries);
        editTxError.textContent = 'Updated offline. Will sync when online.';
      } else {
        console.error('[budget.js] Failed to update entry:', err);
        editTxError.textContent = err.message || 'Failed to save changes';
      }
    }
  });

  // ─── 12) Budgets: variables & helper functions ───
  let allBudgets = [];

  // Grab these once; if any is missing, log and bail
  const selectEl = document.getElementById('budget-select');
  const detailsContainer = document.getElementById('budget-details');
  const budgetForm = document.getElementById('budget-form');

  if (!selectEl || !detailsContainer || !budgetForm || !budgetError) {
    console.error(
      '[budget.js] Required elements missing:',
      {
        selectElExists: !!selectEl,
        detailsContainerExists: !!detailsContainer,
        budgetFormExists: !!budgetForm,
        budgetErrorExists: !!budgetError,
      }
    );
    return;
  }

  /**
   * Populate the dropdown with one <option> per budget.
   * Clears existing options except for the placeholder.
   */
  function fillBudgetDropdown(budgets) {
    selectEl.innerHTML = '<option value="">– Choose a Budget –</option>';
    budgets.forEach((b) => {
      const idStr = b.id + '';
      const monthStr = b.month.toString().padStart(2, '0');
      const label = `${monthStr}/${b.year}`;
      const opt = document.createElement('option');
      opt.value = idStr;
      opt.textContent = label;
      selectEl.append(opt);
    });
    console.log('[budget.js] Dropdown options populated:', selectEl.innerHTML);
  }
  /**
   * Render the given budget’s details, or clear if `budget` is falsy.
   */
  function showBudgetDetails(budget) {
    if (!budget) {
      detailsContainer.innerHTML = '';
      console.log('[budget.js] showBudgetDetails(): cleared details');
      return;
    }
    console.log('[budget.js] showBudgetDetails(): rendering', budget);
    detailsContainer.innerHTML = `
      <ul class="list-group">
        <li class="list-group-item d-flex justify-content-between">
          <span><strong>Month/Year:</strong></span>
          <span>${budget.month.toString().padStart(2, '0')}/${budget.year}</span>
        </li>
        <li class="list-group-item d-flex justify-content-between">
          <span><strong>Planned Income:</strong></span>
          <span>${budget.income.toFixed(2)}</span>
        </li>
        <li class="list-group-item d-flex justify-content-between">
          <span><strong>Planned Expenses:</strong></span>
          <span>${budget.expenses.toFixed(2)}</span>
        </li>
        <li class="list-group-item d-flex justify-content-between">
          <span><strong>Actual Income:</strong></span>
          <span>${budget.actualIncome.toFixed(2)}</span>
        </li>
        <li class="list-group-item d-flex justify-content-between">
          <span><strong>Actual Expenses:</strong></span>
          <span>${budget.actualExpenses.toFixed(2)}</span>
        </li>
        <li class="list-group-item d-flex justify-content-between">
          <span><strong>Income Variance:</strong></span>
          <span>${budget.incomeVariance.toFixed(2)}</span>
        </li>
        <li class="list-group-item d-flex justify-content-between">
          <span><strong>Expenses Performance:</strong></span>
          <span>${budget.expensesPerformance.toFixed(2)}</span>
        </li>
      </ul>
    `;
  }

  /**
   * GET /api/budgets (with JWT). Returns a promise for an array of budgets.
   */
  async function fetchBudgets() {
    console.log('[budget.js] fetchBudgets(): calling GET /api/budgets');
    const res = await fetch(`${process.env.API_BASE_URL || '/api'}/budgets`, {
      headers: { 'Content-Type': 'application/json', ...authHeader() },
    });
    if (!res.ok) {
      console.error(
        `[budget.js] fetchBudgets(): server responded with ${res.status}`
      );
      throw new Error('Failed to load budgets');
    }
    return res.json();
  }

  // ─── 13) On page load: fetch all budgets and populate dropdown ───
  fetchBudgets()
    .then((budgets) => {
      console.log('[budget.js] Loaded budgets:', budgets);
      allBudgets = budgets;
      fillBudgetDropdown(allBudgets);

      // Only attach the change listener after we fill the dropdown:
      selectEl.addEventListener('change', (e) => {
        const chosenId = e.target.value;
        console.log('[budget.js] change fired, chosenId =', chosenId);

        if (!chosenId) {
          showBudgetDetails(null);
          return;
        }

        // Find by string‐coerced id (b.id)
        const selectedBudget = allBudgets.find(
          (b) => (b.id + '') === (chosenId + '')
        );
        console.log('[budget.js] find(...) returned =', selectedBudget);
        showBudgetDetails(selectedBudget);
      });
    })
    .catch((err) => {
      console.error('[budget.js] Could not load budgets:', err);
    });

  // ─── 14) Handle “Add Budget” form submission ───
  budgetForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    budgetError.textContent = '';

    const newBudget = {
      month: parseInt(budgetForm.month.value, 10),
      year: parseInt(budgetForm.year.value, 10),
      income: parseFloat(budgetForm.income.value),
      expenses: parseFloat(budgetForm.expenses.value),
    };

    try {
      if (!navigator.onLine) throw new Error('offline');
      const response = await fetch(
        `${process.env.API_BASE_URL || '/api'}/budgets`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...authHeader(),
          },
          body: JSON.stringify(newBudget),
        }
      );
      if (!response.ok) {
        const errPayload = await response.json();
        throw new Error(errPayload.message || 'Failed to add budget');
      }

      const created = await response.json();
      allBudgets.push(created);
      fillBudgetDropdown(allBudgets);
      budgetForm.reset();
    } catch (err) {
      if (err.message === 'offline') {
        budgetError.textContent = 'Offline budget add queueing is not yet implemented.';
        // You can implement offline queueing for budgets here if desired.
      } else {
        budgetError.textContent = err.message;
      }
    }
  });

  // ─── 15) “Refresh Budgets” button ───
  const refreshBtn = document.getElementById('refresh-budgets-btn');
  if (refreshBtn) {
    refreshBtn.addEventListener('click', async () => {
      try {
        const budgets = await fetchBudgets();
        allBudgets = budgets;
        fillBudgetDropdown(allBudgets);
        showBudgetDetails(null);
      } catch (err) {
        budgetError.textContent = err.message || 'Failed to refresh budgets';
      }
    });
  }

  // ─── 16) “Download Report” button ───
  const downloadBtn = document.getElementById('download-report-btn');
  if (downloadBtn) {
    downloadBtn.addEventListener('click', async () => {
      try {
        await downloadReport();
      } catch (err) {
        console.error('[budget.js] Failed to download report:', err);
      }
    });
  }

  // ─── 10) "Export" transactions button ───
  const exportBtn = document.getElementById('export-transactions-btn');
  if (exportBtn) {
    exportBtn.addEventListener('click', async () => {
      try {
        await exportTransactions();
      } catch (err) {
        console.error('[budget.js] Failed to export transactions:', err);
      }
    });
  }


  window.addEventListener("keydown", function(event) {
  // Prevent Backspace from navigating back in browser history accidentally
  if (event.key === "Enter") {
    event.preventDefault();
    window.location.href = "graphs.html";
  } else if (event.key === "r" || event.key === "R") {
    event.preventDefault();
    location.reload();
  }
  else if (event.key === "e" || event.key === "E") {
    exportTransactions();
  }

});



const publicVapidKey = 'BPI8pB6zGaqG54CzT3NYldwS8DrsxZMFxGcIdFtCogpwsV45Cfl4Est_Yd9LvwwrbhiEYZm2d4dlnOVzbwimxpw';

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      const registration = await navigator.serviceWorker.register('/service-worker.js');
      console.log('Service Worker registered:', registration.scope);

      const subscribeBtn = document.getElementById('subscribeBtn');
      if (!subscribeBtn) {
        console.error('Subscribe button not found');
        return;
      }

      subscribeBtn.addEventListener('click', async () => {
        try {
          // Check for existing subscription and unsubscribe if keys differ (optional)
          const existingSubscription = await registration.pushManager.getSubscription();
          if (existingSubscription) {
            // If needed, unsubscribe here to avoid key conflicts
            await existingSubscription.unsubscribe();
            console.log('Unsubscribed existing subscription');
          }

          const subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(publicVapidKey)
          });

          await fetch('http://localhost:4010/subscribe', {
            method: 'POST',
            body: JSON.stringify(subscription),
            headers: { 'Content-Type': 'application/json' }
          });

          console.log('Subscribed and sent to server');
        } catch (err) {
          console.error('Failed to subscribe:', err);
        }
      });

    } catch (err) {
      console.error('Service Worker registration failed:', err);
    }
  });
} else {
  console.warn('Service workers or Push messaging not supported');
}

}
