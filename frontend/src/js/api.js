// src/js/api.js

// ----- MOCK LOGIN -----
export function login(username, password) {
  return new Promise((resolve, reject) => {
    // simulate network latency
    setTimeout(() => {
      // simple stub: accept any non-empty credentials
      if (username && password) {
        resolve({
          token: 'mock-token-123',
          user: { username }
        });
      } else {
        reject(new Error('Invalid credentials'));
      }
    }, 500); // 0.5s delay
  });
}

// ----- MOCK BUDGET DATA -----
let _entries = [
  {
    id: 1,
    type: 'income',
    amount: 2000,
    category: 'Salary',
    date: '2025-05-01',
    description: 'May salary'
  },
  {
    id: 2,
    type: 'expense',
    amount: 50,
    category: 'Groceries',
    date: '2025-05-02',
    description: 'Weekly groceries'
  }
];

// simulate auto-increment ID
let _nextId = 3;

/**
 * Get all entries for the current user.
 */
export function getEntries() {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve([..._entries]);
    }, 300);
  });
}

/**
 * Add a new entry.
 * @param {object} entry - { type, amount, category, date, description }
 */
export function addEntry(entry) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (!entry.type || !entry.amount) {
        return reject(new Error('Invalid entry'));
      }
      const newEntry = { id: _nextId++, ...entry };
      _entries.push(newEntry);
      resolve(newEntry);
    }, 300);
  });
}
