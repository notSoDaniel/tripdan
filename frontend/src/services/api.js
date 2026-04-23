const BASE = (import.meta.env.VITE_API_URL ?? '') + '/api';

async function request(path, options = {}) {
  const token = localStorage.getItem('token');
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${BASE}${path}`, { headers, ...options });

  if (res.status === 401) {
    window.dispatchEvent(new CustomEvent('auth:unauthorized'));
    throw new Error('HTTP 401');
  }
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  if (res.status === 204) return null;
  return res.json();
}

export const api = {
  auth: {
    login: (email, password) =>
      request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
    register: (email, password) =>
      request('/auth/register', { method: 'POST', body: JSON.stringify({ email, password }) }),
    bootstrap: (email, password) =>
      request('/auth/bootstrap', { method: 'POST', body: JSON.stringify({ email, password }) }),
  },
  admin: {
    users: () => request('/admin/users'),
    setRole: (id, role) => request(`/admin/users/${id}/role`, { method: 'PUT', body: JSON.stringify({ role }) }),
    deleteUser: (id) => request(`/admin/users/${id}`, { method: 'DELETE' }),
    trips: () => request('/admin/trips'),
  },
  trips: {
    list: () => request('/trips'),
    get: (id) => request(`/trips/${id}`),
    create: (data) => request('/trips', { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => request(`/trips/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id) => request(`/trips/${id}`, { method: 'DELETE' }),
  },
  checklist: {
    list: (tripId) => request(`/trips/${tripId}/checklist`),
    create: (tripId, data) => request(`/trips/${tripId}/checklist`, { method: 'POST', body: JSON.stringify(data) }),
    toggle: (tripId, itemId) => request(`/trips/${tripId}/checklist/${itemId}/toggle`, { method: 'PATCH' }),
    delete: (tripId, itemId) => request(`/trips/${tripId}/checklist/${itemId}`, { method: 'DELETE' }),
  },
  expenses: {
    list: (tripId) => request(`/trips/${tripId}/expenses`),
    summary: (tripId) => request(`/trips/${tripId}/expenses/summary`),
    create: (tripId, data) => request(`/trips/${tripId}/expenses`, { method: 'POST', body: JSON.stringify(data) }),
    delete: (tripId, expId) => request(`/trips/${tripId}/expenses/${expId}`, { method: 'DELETE' }),
  },
};
