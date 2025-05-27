const API_BASE = process.env.API_BASE_URL || '/api';

export async function login(email, password) {
  const res = await fetch(`${API_BASE}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || 'Login failed');
  }

  const data = await res.json();
  localStorage.setItem('token', data.token);
  return data;
}

/**
 * Helper for auth header
 */
function authHeader() {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

/**
 * Fetch all entries (transactions)
 */
export async function getEntries() {
  const res = await fetch(`${API_BASE}/transactions`, {
    headers: { 'Content-Type': 'application/json', ...authHeader() }
  });
  if (!res.ok) throw new Error('Failed to fetch entries');
  return res.json();
}

/**
 * Add a new entry
 */
export async function addEntry(entry) {
  const res = await fetch(`${API_BASE}/transactions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeader() },
    body: JSON.stringify(entry)
  });
  if (!res.ok) throw new Error('Failed to add entry');
  return res.json();
}
