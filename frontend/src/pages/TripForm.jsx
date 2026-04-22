import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../services/api';
import Footer from '../components/Footer';
import Logo from '../components/Logo';

export default function TripForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [form, setForm] = useState({ name: '', destination: '', startDate: '', endDate: '', status: 'PLANNED' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isEdit) api.trips.get(id).then(setForm);
  }, [id, isEdit]);

  function handleChange(e) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      if (isEdit) {
        await api.trips.update(id, form);
      } else {
        await api.trips.create(form);
      }
      navigate('/');
    } catch {
      setError('Erro ao salvar. Verifique os dados e tente novamente.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <header className="bg-gradient-to-br from-blue-500 to-blue-700 text-white px-4 py-4 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-xl active:bg-blue-800">
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <Logo size={28} />
        <div>
          <p className="text-xs text-blue-200 font-black tracking-widest uppercase leading-none">TRIPDAN</p>
          <h1 className="text-lg font-semibold text-white leading-tight">{isEdit ? 'Editar viagem' : 'Nova viagem'}</h1>
        </div>
      </header>

      <form onSubmit={handleSubmit} className="px-4 pt-6 space-y-4">
        {error && <p className="text-sm text-red-600 bg-red-50 rounded-xl px-4 py-3">{error}</p>}

        <label className="block">
          <span className="text-sm font-medium text-gray-700">Nome da viagem</span>
          <input
            name="name" value={form.name} onChange={handleChange} required
            placeholder="Ex: Férias em Portugal"
            className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-gray-700">Destino</span>
          <input
            name="destination" value={form.destination} onChange={handleChange} required
            placeholder="Ex: Lisboa, Portugal"
            className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </label>

        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="text-sm font-medium text-gray-700">Data de início</span>
            <input
              type="date" name="startDate" value={form.startDate} onChange={handleChange} required
              className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-gray-700">Data de fim</span>
            <input
              type="date" name="endDate" value={form.endDate} onChange={handleChange} required
              className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </label>
        </div>

        <label className="block">
          <span className="text-sm font-medium text-gray-700">Status</span>
          <select
            name="status" value={form.status} onChange={handleChange}
            className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="PLANNED">Planejada</option>
            <option value="IN_PROGRESS">Em andamento</option>
            <option value="COMPLETED">Concluída</option>
          </select>
        </label>

        <button
          type="submit" disabled={saving}
          className="w-full bg-blue-600 text-white font-semibold rounded-xl py-4 mt-2 active:scale-95 transition-transform disabled:opacity-60"
        >
          {saving ? 'Salvando...' : isEdit ? 'Salvar alterações' : 'Criar viagem'}
        </button>
      </form>
      <Footer />
    </div>
  );
}
