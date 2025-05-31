// src/js/budget.js
import { getEntries, addEntry, authHeader } from './api.js';
import { downloadReport, exportTransactions } from './download-files.js';

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

  // ─── 3) Transactions: fetch & render ───
  const listEl = document.getElementById('entries-list');
  const txForm = document.getElementById('entry-form');
  const txError = document.createElement('p');
  txError.className = 'text-danger mt-2';
  txForm.appendChild(txError);

  function renderEntries(entries) {
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
          <span class="badge bg-${e.type === 'income' ? 'success' : 'danger'
        } ms-2">${e.type}</span>
          <div class="text-muted small">${displayDate}</div>
        </div>
        <span>${e.amount.toFixed(2)}</span>
      `;
      listEl.append(li);
    });
  }

  getEntries()
    .then(renderEntries)
    .catch((err) => {
      console.error('[budget.js] Failed to load entries:', err);
      listEl.innerHTML =
        '<li class="list-group-item text-danger">Failed to load entries</li>';
    });

  txForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    txError.textContent = '';

    const entry = {
      type: txForm.type.value,
      amount: parseFloat(txForm.amount.value),
      category: txForm.category.value.trim(),
      date: txForm.date.value,
      description: txForm.description.value.trim(),
    };

    try {
      await addEntry(entry);
      txForm.reset();
      getEntries().then(renderEntries);
    } catch (err) {
      console.error('[budget.js] Failed to add entry:', err);
      txError.textContent = err.message || 'Failed to add transaction';
    }
  });

  // ─── 4) Budgets: variables & helper functions ───
  let allBudgets = [];

  // Grab these once; if any is missing, log and bail
  const selectEl = document.getElementById('budget-select');
  const detailsContainer = document.getElementById('budget-details');
  const budgetForm = document.getElementById('budget-form');
  const budgetError = document.getElementById('budget-error');

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
      const idStr = b.id + '';               // <-- use b.id, not b._id
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
          <span>${budget.month.toString().padStart(2, '0')}/${budget.year
      }</span>
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
          <span><strong>Actual Expenses Expenses:</strong></span>
          <span>${budget.actualExpenses.toFixed(2)}</span>
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

  // ─── 5) On page load: fetch all budgets and populate dropdown ───
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

        // Find by string‐coerced id (b.id), not b._id:
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

  // ─── 6) Handle “Add Budget” form submission ───
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
      console.log('[budget.js] Submitting new budget:', newBudget);
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
        console.error(
          '[budget.js] POST /api/budgets failed with payload:',
          errPayload
        );
        throw new Error(errPayload.message || 'Failed to add budget');
      }

      const created = await response.json();
      console.log('[budget.js] Created new budget:', created);

      allBudgets.push(created);
      fillBudgetDropdown(allBudgets);
      budgetForm.reset();
    } catch (err) {
      console.error('[budget.js] Failed to add budget:', err);
      budgetError.textContent = err.message;
    }
  });

  // ─── 8) “Refresh Budgets” button ───
  const refreshBtn = document.getElementById('refresh-budgets-btn');

  if (refreshBtn) {
    refreshBtn.addEventListener('click', async () => {
      try {
        const budgets = await fetchBudgets();

        allBudgets = budgets;

        fillBudgetDropdown(allBudgets);
        showBudgetDetails(null);
      } catch (err) {
        console.error('[budget.js] Failed to refresh budgets:', err);
        budgetError.textContent = err.message || 'Failed to refresh budgets';
      }
    });
  }

  // ─── 9) “Download Report” button ───
  const downloadBtn = document.getElementById('download-report-btn');
  if (downloadBtn) {
    downloadBtn.addEventListener('click', async () => {
      try {
        await downloadReport();
      } catch (err) {
        console.error('[budget.js] Failed to download report:', err);
        alert('Could not download the report. Please try again.');
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
        alert('Could not export transactions. Please try again.');
      }
    });
  }
}
