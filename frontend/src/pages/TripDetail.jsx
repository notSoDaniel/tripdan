import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { api } from '../services/api';
import Footer from '../components/Footer';

const CATEGORY_ICON = {
  DOCUMENTS: '🪪', CLOTHING: '👕', HYGIENE: '🧴', ELECTRONICS: '🔌', MEDICATION: '💊', OTHER: '📦',
};
const EXPENSE_ICON = {
  TRANSPORT: '✈️', ACCOMMODATION: '🏨', FOOD: '🍽️', LEISURE: '🎭', SHOPPING: '🛍️', OTHER: '💳',
};

function formatCurrency(v) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);
}

function formatDate(d) {
  return new Date(d + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function TripDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [trip, setTrip] = useState(null);
  const [checklist, setChecklist] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [summary, setSummary] = useState(null);
  const [tab, setTab] = useState('checklist');

  const [newItem, setNewItem] = useState('');
  const [newItemCategory, setNewItemCategory] = useState('OTHER');
  const [newExpense, setNewExpense] = useState({ description: '', amount: '', category: 'OTHER', type: 'PLANNED' });

  useEffect(() => {
    api.trips.get(id).then(setTrip);
    api.checklist.list(id).then(setChecklist);
    api.expenses.list(id).then(setExpenses);
    api.expenses.summary(id).then(setSummary);
  }, [id]);

  async function deleteTrip() {
    if (!confirm('Excluir esta viagem?')) return;
    await api.trips.delete(id);
    navigate('/');
  }

  async function addItem(e) {
    e.preventDefault();
    if (!newItem.trim()) return;
    const item = await api.checklist.create(id, { description: newItem.trim(), category: newItemCategory });
    setChecklist((c) => [...c, item]);
    setNewItem('');
  }

  async function toggleItem(itemId) {
    const updated = await api.checklist.toggle(id, itemId);
    setChecklist((c) => c.map((i) => (i.id === updated.id ? updated : i)));
  }

  async function removeItem(itemId) {
    await api.checklist.delete(id, itemId);
    setChecklist((c) => c.filter((i) => i.id !== itemId));
  }

  async function addExpense(e) {
    e.preventDefault();
    if (!newExpense.description.trim() || !newExpense.amount) return;
    const exp = await api.expenses.create(id, { ...newExpense, amount: parseFloat(newExpense.amount) });
    setExpenses((prev) => [...prev, exp]);
    api.expenses.summary(id).then(setSummary);
    setNewExpense({ description: '', amount: '', category: 'OTHER', type: 'PLANNED' });
  }

  async function removeExpense(expId) {
    await api.expenses.delete(id, expId);
    setExpenses((prev) => prev.filter((e) => e.id !== expId));
    api.expenses.summary(id).then(setSummary);
  }

  const checked = checklist.filter((i) => i.checked).length;

  if (!trip) return <div className="min-h-screen flex items-center justify-center text-gray-400">Carregando...</div>;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-indigo-600 text-white px-4 pt-12 pb-6">
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => navigate('/')} className="p-2 -ml-2 rounded-xl active:bg-indigo-700">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="flex gap-2">
            <Link to={`/trips/${id}/edit`} className="p-2 rounded-xl active:bg-indigo-700">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </Link>
            <button onClick={deleteTrip} className="p-2 rounded-xl active:bg-indigo-700">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
        <p className="text-indigo-300 text-xs font-semibold tracking-widest uppercase mb-1">tripdan</p>
        <h1 className="text-2xl font-bold">{trip.name}</h1>
        <p className="text-indigo-200 text-sm mt-1 flex items-center gap-1">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          </svg>
          {trip.destination} · {formatDate(trip.startDate)} – {formatDate(trip.endDate)}
        </p>
      </div>

      {/* Summary cards */}
      <div className="px-4 -mt-2 grid grid-cols-2 gap-3 mb-4">
        <div className="bg-white rounded-2xl shadow-sm p-4">
          <p className="text-xs text-gray-400 font-medium">Checklist</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{checked}<span className="text-base font-normal text-gray-400">/{checklist.length}</span></p>
          <p className="text-xs text-gray-400 mt-0.5">itens marcados</p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm p-4">
          <p className="text-xs text-gray-400 font-medium">Orçamento</p>
          <p className="text-lg font-bold text-gray-900 mt-1 truncate">{summary ? formatCurrency(summary.planned) : '—'}</p>
          <p className="text-xs text-gray-400 mt-0.5">gasto real: {summary ? formatCurrency(summary.actual) : '—'}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-4">
        <div className="flex bg-gray-100 rounded-xl p-1 mb-4">
          {['checklist', 'expenses'].map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-colors ${tab === t ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500'}`}
            >
              {t === 'checklist' ? '✅ Checklist' : '💰 Gastos'}
            </button>
          ))}
        </div>

        {/* Checklist Tab */}
        {tab === 'checklist' && (
          <div className="space-y-2">
            <form onSubmit={addItem} className="flex gap-2 mb-4">
              <select
                value={newItemCategory}
                onChange={(e) => setNewItemCategory(e.target.value)}
                className="rounded-xl border border-gray-200 bg-white px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="DOCUMENTS">🪪</option>
                <option value="CLOTHING">👕</option>
                <option value="HYGIENE">🧴</option>
                <option value="ELECTRONICS">🔌</option>
                <option value="MEDICATION">💊</option>
                <option value="OTHER">📦</option>
              </select>
              <input
                value={newItem} onChange={(e) => setNewItem(e.target.value)}
                placeholder="Adicionar item..."
                className="flex-1 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button type="submit" className="bg-indigo-600 text-white px-4 rounded-xl font-bold active:scale-95 transition-transform">+</button>
            </form>

            {checklist.length === 0 && (
              <p className="text-center text-gray-400 text-sm py-8">Nenhum item ainda. Adicione acima.</p>
            )}
            {checklist.map((item) => (
              <div key={item.id} className="flex items-center gap-3 bg-white rounded-xl border border-gray-100 px-4 py-3">
                <button onClick={() => toggleItem(item.id)} className="shrink-0">
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${item.checked ? 'bg-green-500 border-green-500' : 'border-gray-300'}`}>
                    {item.checked && <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                  </div>
                </button>
                <span className="text-base">{CATEGORY_ICON[item.category]}</span>
                <span className={`flex-1 text-sm ${item.checked ? 'line-through text-gray-400' : 'text-gray-800'}`}>{item.description}</span>
                <button onClick={() => removeItem(item.id)} className="p-1 text-gray-300 active:text-red-500">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Expenses Tab */}
        {tab === 'expenses' && (
          <div className="space-y-2">
            <form onSubmit={addExpense} className="bg-white rounded-xl border border-gray-100 p-4 mb-4 space-y-3">
              <input
                value={newExpense.description}
                onChange={(e) => setNewExpense((p) => ({ ...p, description: e.target.value }))}
                placeholder="Descrição do gasto"
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <div className="flex gap-2">
                <input
                  type="number" min="0" step="0.01"
                  value={newExpense.amount}
                  onChange={(e) => setNewExpense((p) => ({ ...p, amount: e.target.value }))}
                  placeholder="Valor (R$)"
                  className="flex-1 rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <select
                  value={newExpense.type}
                  onChange={(e) => setNewExpense((p) => ({ ...p, type: e.target.value }))}
                  className="rounded-xl border border-gray-200 bg-white px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="PLANNED">Previsto</option>
                  <option value="ACTUAL">Real</option>
                </select>
              </div>
              <div className="flex gap-2">
                <select
                  value={newExpense.category}
                  onChange={(e) => setNewExpense((p) => ({ ...p, category: e.target.value }))}
                  className="flex-1 rounded-xl border border-gray-200 bg-white px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="TRANSPORT">✈️ Transporte</option>
                  <option value="ACCOMMODATION">🏨 Hospedagem</option>
                  <option value="FOOD">🍽️ Alimentação</option>
                  <option value="LEISURE">🎭 Lazer</option>
                  <option value="SHOPPING">🛍️ Compras</option>
                  <option value="OTHER">💳 Outro</option>
                </select>
                <button type="submit" className="bg-indigo-600 text-white px-5 rounded-xl font-bold active:scale-95 transition-transform">+</button>
              </div>
            </form>

            {/* Budget summary bar */}
            {summary && summary.planned > 0 && (
              <div className="bg-white rounded-xl border border-gray-100 p-4 mb-2">
                <div className="flex justify-between text-xs text-gray-500 mb-2">
                  <span>Previsto: {formatCurrency(summary.planned)}</span>
                  <span>Real: {formatCurrency(summary.actual)}</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${summary.actual > summary.planned ? 'bg-red-500' : 'bg-green-500'}`}
                    style={{ width: `${Math.min(100, (summary.actual / summary.planned) * 100)}%` }}
                  />
                </div>
                <p className={`text-xs mt-2 font-medium ${summary.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {summary.balance >= 0 ? `Sobram ${formatCurrency(summary.balance)}` : `Estourou ${formatCurrency(Math.abs(summary.balance))}`}
                </p>
              </div>
            )}

            {expenses.length === 0 && (
              <p className="text-center text-gray-400 text-sm py-8">Nenhum gasto registrado ainda.</p>
            )}
            {expenses.map((exp) => (
              <div key={exp.id} className="flex items-center gap-3 bg-white rounded-xl border border-gray-100 px-4 py-3">
                <span className="text-xl shrink-0">{EXPENSE_ICON[exp.category]}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{exp.description}</p>
                  <p className="text-xs text-gray-400">{exp.type === 'PLANNED' ? 'Previsto' : 'Real'}</p>
                </div>
                <p className={`text-sm font-semibold shrink-0 ${exp.type === 'ACTUAL' ? 'text-red-500' : 'text-gray-700'}`}>
                  {formatCurrency(exp.amount)}
                </p>
                <button onClick={() => removeExpense(exp.id)} className="p-1 text-gray-300 active:text-red-500 shrink-0">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
