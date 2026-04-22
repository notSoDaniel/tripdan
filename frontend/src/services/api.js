const BASE = (import.meta.env.VITE_API_URL ?? '') + '/api';

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  if (res.status === 204) return null;
  return res.json();
}

export const api = {
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
    delete: (tripId, expenseId) => request(`/trips/${tripId}/expenses/${expenseId}`, { method: 'DELETE' }),
  },
};
