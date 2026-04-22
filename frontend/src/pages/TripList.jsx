import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import Footer from '../components/Footer';

const STATUS_LABEL = { PLANNED: 'Planejada', IN_PROGRESS: 'Em andamento', COMPLETED: 'Concluída' };
const STATUS_COLOR = {
  PLANNED: 'bg-blue-100 text-blue-700',
  IN_PROGRESS: 'bg-amber-100 text-amber-700',
  COMPLETED: 'bg-green-100 text-green-700',
};

function formatDate(d) {
  return new Date(d + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
}

export default function TripList() {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.trips.list().then(setTrips).finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <header className="bg-indigo-600 text-white px-4 pt-12 pb-6">
        <p className="text-indigo-300 text-xs font-semibold tracking-widest uppercase mb-1">tripdan</p>
        <h1 className="text-2xl font-bold tracking-tight">Minhas Viagens</h1>
        <p className="text-indigo-200 text-sm mt-1">{trips.length} viagem{trips.length !== 1 ? 's' : ''} registrada{trips.length !== 1 ? 's' : ''}</p>
      </header>

      <div className="px-4 -mt-4">
        <Link
          to="/trips/new"
          className="flex items-center justify-center gap-2 w-full bg-white border-2 border-dashed border-indigo-300 text-indigo-600 font-semibold rounded-2xl py-4 shadow-sm active:scale-95 transition-transform"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Nova viagem
        </Link>
      </div>

      <div className="px-4 mt-4 space-y-3">
        {loading && (
          <div className="text-center py-12 text-gray-400">Carregando...</div>
        )}
        {!loading && trips.length === 0 && (
          <div className="text-center py-16 text-gray-400">
            <svg className="w-16 h-16 mx-auto mb-4 opacity-30" fill="none" stroke="currentColor" strokeWidth={1} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064" />
            </svg>
            <p className="font-medium">Nenhuma viagem ainda</p>
            <p className="text-sm mt-1">Crie sua primeira viagem acima</p>
          </div>
        )}
        {trips.map((trip) => (
          <Link
            key={trip.id}
            to={`/trips/${trip.id}`}
            className="block bg-white rounded-2xl shadow-sm border border-gray-100 p-4 active:scale-98 transition-transform"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h2 className="font-semibold text-gray-900 truncate">{trip.name}</h2>
                <p className="text-sm text-gray-500 mt-0.5 flex items-center gap-1">
                  <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {trip.destination}
                </p>
              </div>
              <span className={`shrink-0 text-xs font-medium px-2 py-1 rounded-full ${STATUS_COLOR[trip.status]}`}>
                {STATUS_LABEL[trip.status]}
              </span>
            </div>
            <div className="mt-3 flex items-center gap-1 text-xs text-gray-400">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {formatDate(trip.startDate)} → {formatDate(trip.endDate)}
            </div>
          </Link>
        ))}
      </div>
      <Footer />
    </div>
  );
}
