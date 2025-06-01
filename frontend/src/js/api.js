// src/js/api.js
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

export async function register(email, username, password) {
  const res = await fetch(`${API_BASE}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, username, password })
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || 'Registration failed');
  }

  const data = await res.json();
  
  localStorage.setItem('token', data.token);
  return data;
}

export function authHeader() {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

/**
 * Fetch all entries (transactions)
 */
export async function getEntries() {

  try {
    const res = await fetch(`${API_BASE}/transactions`, {
      headers: { 'Content-Type': 'application/json', ...authHeader() }
    });
    if (!res.ok) throw new Error('Failed to fetch entries');
    return res.json();
  } catch (err) {
    // If offline or server down, Workbox’s NetworkFirst will attempt cache first.
    // But any outright network errors will be caught here—just rethrow so budget.js can show UI fallback.
    console.warn('[api.js] getEntries() network failed, falling back to cached data', err);
    throw err;
  }
}

/**
 * Add a new entry (will be queued automatically if offline)
 */
export async function addEntry(entry) {
  try {
    const res = await fetch(`${API_BASE}/transactions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeader() },
      body: JSON.stringify(entry)
    });
    if (!res.ok) {
      const payload = await res.json().catch(() => ({}));
      throw new Error(payload.message || 'Failed to add entry');
    }
    return res.json();
  } catch (err) {
    // If offline, Workbox backgroundSync will queue the request automatically.
    console.warn('[api.js] addEntry() failed; queued for background sync', err);
    // Return a locally‐created object so the UI can still show the new transaction immediately:
    return {
      id: `temp-${Date.now()}`,   // a temporary client‐side ID
      ...entry,
      _offline: true
    };
  }
}

/**
 * Update an existing entry (queued if offline)
 */
export async function updateEntry(id, entry) {
  try {
    const res = await fetch(`${API_BASE}/transactions/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...authHeader() },
      body: JSON.stringify(entry),
    });
    if (!res.ok) {
      const payload = await res.json().catch(() => ({}));
      throw new Error(payload.message || 'Failed to update entry');
    }
    return res.json();
  } catch (err) {
    console.warn('[api.js] updateEntry() failed; queued for background sync', err);
    return { id, ...entry, _offline: true };
  }
}

/**
 * DELETE /api/transactions/:id
 * If offline, Workbox will queue this automatically.
 */
export async function deleteEntry(id) {
  try {
    const res = await fetch(`${API_BASE}/transactions/${id}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json', ...authHeader() },
    });
    if (!res.ok) {
      const payload = await res.json().catch(() => ({}));
      throw new Error(payload.message || 'Failed to delete entry');
    }
    return;
  } catch (err) {
    console.warn('[api.js] deleteEntry() failed; queued for background sync', err);
    // We return here so that budgeting UI can remove the item locally.
    return;
  }
}
