import {
  getEntries,
  addEntry,
  authHeader,
  updateEntry,
  deleteEntry
} from './api.js';

export default function initRegister() {
    
  async function fetchTransactions() {
    console.log('[graphs.js] fetchTransactions(): calling GET /api/transactions');
    const res = await fetch(`${process.env.API_BASE_URL || '/api'}/transactions`, {
      headers: { 'Content-Type': 'application/json', ...authHeader() },
    });

    if (!res.ok) {
      console.error(`[graphs.js] fetchTransactions(): server responded with ${res.status}`);
      throw new Error('Failed to load transactions');
    }

    return res.json();
  }

  async function fetchBudgets() {
    console.log('[graphs.js] fetchBudgets(): calling GET /api/budgets');
    const res = await fetch(`${process.env.API_BASE_URL || '/api'}/budgets`, {
      headers: { 'Content-Type': 'application/json', ...authHeader() },
    });

    if (!res.ok) {
      console.error(`[graphs.js] fetchBudgets(): server responded with ${res.status}`);
      throw new Error('Failed to load budgets');
    }

    return res.json();
  }

  async function fetchData() {
    const [transactions, budgets] = await Promise.all([
      fetchTransactions(),
      fetchBudgets()
    ]);
    return { transactions, budgets };
  }

    const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      localStorage.removeItem('token');
      localStorage.removeItem('currentUser');
      window.location.href = 'login.html';
    });
  }

  function groupByDate(transactions) {
    const grouped = {};
    transactions.forEach(tx => {
      const date = new Date(tx.date).toISOString().split('T')[0];
      grouped[date] = grouped[date] || 0;
      grouped[date] += tx.type === 'income' ? tx.amount : -tx.amount;
    });

    const sorted = Object.entries(grouped).sort(([a], [b]) => new Date(a) - new Date(b));
    let balance = 0;
    const labels = [], data = [];
    sorted.forEach(([date, value]) => {
      balance += value;
      labels.push(date);
      data.push(balance);
    });
    return { labels, data };
  }

  function last7Days(transactions) {
    const today = new Date();
    const days = [...Array(7)].map((_, i) => {
      const d = new Date();
      d.setDate(today.getDate() - (6 - i));
      return d.toISOString().split('T')[0];
    });

    const income = Array(7).fill(0);
    const expenses = Array(7).fill(0);

    transactions.forEach(tx => {
      const d = new Date(tx.date).toISOString().split('T')[0];
      const idx = days.indexOf(d);
      if (idx !== -1) {
        if (tx.type === 'income') income[idx] += tx.amount;
        else expenses[idx] += tx.amount;
      }
    });

    return { labels: days, income, expenses };
  }

  function calculateTotals(transactions) {
    let income = 0, expenses = 0;
    transactions.forEach(tx => {
      if (tx.type.toLowerCase() === 'income') income += Number(tx.amount);
      else if (tx.type.toLowerCase() === 'expense') expenses += Number(tx.amount);
    });
    return { income, expenses, balance: income - expenses };
  }

  // Use totals passed in here for the "actual" values — same as donut chart
  function renderBudgets(budgets, totals) {
    const latest = budgets[0];
    const container = document.getElementById('budgetsContainer');

    const incomeProgress = latest.income > 0 ? (totals.income / latest.income) * 100 : 0;
    const expensesProgress = latest.expenses > 0 ? (totals.expenses / latest.expenses) * 100 : 0;

    container.innerHTML = `
      <div class="budget">
        Income: €${totals.income.toFixed(2)} / €${latest.income}
        <div class="progress">
          <div class="progress-bar" style="width:${Math.min(incomeProgress, 100).toFixed(0)}%; background: #6A1B9A;"></div>
        </div>
      </div>
      <div class="budget">
        Expenses: €${totals.expenses.toFixed(2)} / €${latest.expenses}
        <div class="progress">
          <div class="progress-bar" style="width:${Math.min(expensesProgress, 100).toFixed(0)}%; background: #d32f2f;"></div>
        </div>
      </div>
    `;
  }

  fetchData().then(({ transactions, budgets }) => {
    const totals = calculateTotals(transactions);
    document.getElementById('balance').textContent = `€${totals.balance.toFixed(2)}`;

    // Donut
    new Chart(document.getElementById("donutChart"), {
      type: 'doughnut',
      data: {
        labels: ["Income", "Expenses"],
        datasets: [{
          data: [totals.income, totals.expenses],
          backgroundColor: ["#8e24aa", "#ef5350"]
        }]
      },
      options: { responsive: true, plugins: { legend: { position: 'bottom' } } }
    });

    // Line Chart
    const balanceData = groupByDate(transactions);
    new Chart(document.getElementById("lineChart"), {
      type: 'line',
      data: {
        labels: balanceData.labels,
        datasets: [{
          label: "Balance",
          data: balanceData.data,
          borderColor: "#6A1B9A",
          backgroundColor: "rgba(106,27,154,0.1)",
          fill: true,
          tension: 0.4
        }]
      },
      options: { responsive: true, plugins: { legend: { display: false } } }
    });

    // Bar Chart - Last 7 Days
    const recent = last7Days(transactions);
    new Chart(document.getElementById("barChart"), {
      type: 'bar',
      data: {
        labels: recent.labels,
        datasets: [
          {
            label: "Expenses",
            data: recent.expenses,
            backgroundColor: "#d32f2f"
          },
          {
            label: "Income",
            data: recent.income,
          backgroundColor: "#6A1B9A"
          }
        ]
      },
      options: {
        responsive: true,
        plugins: { legend: { position: 'bottom' } },
        scales: { y: { beginAtZero: true } }
      }
    });

    // Cash Flow Chart
    const latestMonth = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });
    new Chart(document.getElementById("cashFlowChart"), {
      type: 'bar',
      data: {
        labels: [latestMonth],
        datasets: [{
          label: "Income",
          data: [totals.income],
          backgroundColor: "#6A1B9A"
        }, {
          label: "Expenses",
          data: [totals.expenses],
          backgroundColor: "#e53935"
        }]
      },
      options: {
        responsive: true,
        indexAxis: 'y',
        plugins: { legend: { position: 'bottom' } },
        scales: { x: { beginAtZero: true } }
      }
    });

    // Budgets using totals from calculateTotals to match donut chart
    renderBudgets(budgets, totals);

 
    let voiceActive = false;
  const voiceBtn = document.getElementById('voiceToggleBtn');

  function updateVoiceButton() {
    voiceBtn.textContent = voiceActive ? '🛑 Stop Voice Control' : '🎙️ Start Voice Control';
  }
const commandsToggleBtn = document.getElementById('commandsToggleBtn');
const voiceCommandsList = document.getElementById('voiceCommandsList');

if (commandsToggleBtn && voiceCommandsList) {
  commandsToggleBtn.addEventListener('click', () => {
    const isVisible = voiceCommandsList.style.display === 'block';
    voiceCommandsList.style.display = isVisible ? 'none' : 'block';
    commandsToggleBtn.textContent = isVisible ? '🧾 Show Voice Commands' : '❌ Hide Voice Commands';
  });
}
  if (window.annyang && voiceBtn) {
    const commands = {
      'show totals': () => {
        alert(`Income: €${totals.income.toFixed(2)}, Expenses: €${totals.expenses.toFixed(2)}, Balance: €${totals.balance.toFixed(2)}`);
      },
      'refresh data': () => {
        window.location.reload();
      },
      'log out': () => {
        localStorage.clear();
        window.location.href = 'login.html';
      },
      'go to *page': (page) => {
        const map = {
          'home': 'budget.html'
        };
        const route = map[page.toLowerCase()];
        if (route) window.location.href = route;
        else alert(`Unknown page: ${page}`);
      }
    };

    annyang.addCommands(commands);

    voiceBtn.addEventListener('click', () => {
      if (!voiceActive) {
        annyang.start({ autoRestart: false, continuous: true });
        console.log('[voice] Voice control started');
      } else {
        annyang.abort();
        console.log('[voice] Voice control stopped');
      }
      voiceActive = !voiceActive;
      updateVoiceButton();
    });

    updateVoiceButton();
  } else {
    console.warn('[voice] Voice control not available');
    if (voiceBtn) voiceBtn.disabled = true;
  }



window.addEventListener("keydown", function(event) {
  // Prevent Backspace from navigating back in browser history accidentally
 if (event.key === "r" || event.key === "R") {
    event.preventDefault();
    location.reload();
  }

  
});
  });
}