import { useEffect, useState } from 'react';
import { api } from '../services/api';
import AppHeader from '../components/AppHeader';
import Footer from '../components/Footer';

const ROLE_LABEL = { USER: 'Usuário', ADMIN: 'Admin' };
const ROLE_COLOR = {
  USER: 'bg-gray-100 text-gray-600',
  ADMIN: 'bg-yellow-100 text-yellow-700',
};

function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
}

function formatTripDate(d) {
  if (!d) return '—';
  return new Date(d + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
}

function ConfirmButton({ label, confirmLabel = 'Confirmar', className, onConfirm }) {
  const [confirming, setConfirming] = useState(false);

  if (confirming) {
    return (
      <div className="flex gap-1">
        <button
          onClick={() => { setConfirming(false); onConfirm(); }}
          className="text-xs px-2 py-1 bg-red-500 text-white rounded-lg font-medium"
        >
          {confirmLabel}
        </button>
        <button
          onClick={() => setConfirming(false)}
          className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-lg"
        >
          Não
        </button>
      </div>
    );
  }

  return (
    <button onClick={() => setConfirming(true)} className={className}>
      {label}
    </button>
  );
}

function UsersTab() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.admin.users()
      .then(setUsers)
      .catch(() => setError('Erro ao carregar usuários'))
      .finally(() => setLoading(false));
  }, []);

  async function handleToggleRole(user) {
    const newRole = user.role === 'ADMIN' ? 'USER' : 'ADMIN';
    await api.admin.setRole(user.id, newRole);
    setUsers(prev => prev.map(u => u.id === user.id ? { ...u, role: newRole } : u));
  }

  async function handleDelete(user) {
    await api.admin.deleteUser(user.id);
    setUsers(prev => prev.filter(u => u.id !== user.id));
  }

  if (loading) return <div className="text-center py-12 text-gray-400">Carregando...</div>;
  if (error) return <div className="text-center py-12 text-red-400">{error}</div>;

  return (
    <div className="space-y-3">
      {users.length === 0 && (
        <div className="text-center py-12 text-gray-400">Nenhum usuário encontrado</div>
      )}
      {users.map(user => (
        <div key={user.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="font-medium text-gray-900 truncate text-sm">{user.email}</p>
              <p className="text-xs text-gray-400 mt-0.5">{formatDate(user.createdAt)}</p>
            </div>
            <span className={`shrink-0 text-xs font-semibold px-2 py-1 rounded-full ${ROLE_COLOR[user.role]}`}>
              {ROLE_LABEL[user.role]}
            </span>
          </div>
          <div className="mt-3 flex gap-2">
            <button
              onClick={() => handleToggleRole(user)}
              className="flex-1 text-xs font-medium py-2 rounded-xl bg-indigo-50 text-indigo-600 active:bg-indigo-100 transition-colors"
            >
              {user.role === 'ADMIN' ? 'Rebaixar para User' : 'Promover a Admin'}
            </button>
            <ConfirmButton
              label="Deletar"
              confirmLabel="Sim, deletar"
              className="text-xs font-medium px-3 py-2 rounded-xl bg-red-50 text-red-500 active:bg-red-100 transition-colors"
              onConfirm={() => handleDelete(user)}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function TripsTab() {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.admin.trips()
      .then(setTrips)
      .catch(() => setError('Erro ao carregar viagens'))
      .finally(() => setLoading(false));
  }, []);

  async function handleDelete(trip) {
    await api.trips.delete(trip.id);
    setTrips(prev => prev.filter(t => t.id !== trip.id));
  }

  if (loading) return <div className="text-center py-12 text-gray-400">Carregando...</div>;
  if (error) return <div className="text-center py-12 text-red-400">{error}</div>;

  return (
    <div className="space-y-3">
      {trips.length === 0 && (
        <div className="text-center py-12 text-gray-400">Nenhuma viagem encontrada</div>
      )}
      {trips.map(trip => (
        <div key={trip.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="font-semibold text-gray-900 truncate">{trip.name}</p>
              <p className="text-sm text-gray-500 mt-0.5 flex items-center gap-1">
                <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {trip.destination}
              </p>
              <p className="text-xs text-gray-400 mt-1">{trip.userEmail ?? `ID ${trip.userId}`}</p>
            </div>
            <ConfirmButton
              label="Deletar"
              confirmLabel="Sim, deletar"
              className="shrink-0 text-xs font-medium px-3 py-2 rounded-xl bg-red-50 text-red-500 active:bg-red-100 transition-colors"
              onConfirm={() => handleDelete(trip)}
            />
          </div>
          <div className="mt-2 flex items-center gap-1 text-xs text-gray-400">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {formatTripDate(trip.startDate)} → {formatTripDate(trip.endDate)}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function AdminPage() {
  const [tab, setTab] = useState('users');

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <AppHeader>
        <h1 className="text-2xl font-bold tracking-tight">Painel Admin</h1>
        <p className="text-blue-100 text-sm mt-1">Gerenciamento de usuários e viagens</p>
      </AppHeader>

      <div className="px-4 -mt-4 relative z-10">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex overflow-hidden">
          <button
            onClick={() => setTab('users')}
            className={`flex-1 py-3 text-sm font-semibold transition-colors ${
              tab === 'users' ? 'bg-indigo-600 text-white' : 'text-gray-500 hover:bg-gray-50'
            }`}
          >
            Usuários
          </button>
          <button
            onClick={() => setTab('trips')}
            className={`flex-1 py-3 text-sm font-semibold transition-colors ${
              tab === 'trips' ? 'bg-indigo-600 text-white' : 'text-gray-500 hover:bg-gray-50'
            }`}
          >
            Viagens
          </button>
        </div>
      </div>

      <div className="px-4 mt-4">
        {tab === 'users' ? <UsersTab /> : <TripsTab />}
      </div>

      <Footer />
    </div>
  );
}
