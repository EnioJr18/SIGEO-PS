import { Calendar, MapPin, Users } from 'lucide-react';

const gradientByIndex = [
  'from-emerald-400 to-teal-600',
  'from-blue-400 to-indigo-600',
  'from-orange-400 to-rose-500',
];

function formatEventDate(value) {
  if (!value) return 'Data a definir';

  return new Date(value).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
  });
}

export default function EventCard({ evento, onDetails, tone = 'emerald' }) {
  const gradient = gradientByIndex[evento.id % gradientByIndex.length];
  const colorClass = tone === 'blue'
    ? 'text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100'
    : 'text-emerald-600 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100';
  const titleClass = tone === 'blue' ? 'group-hover:text-blue-600' : 'group-hover:text-emerald-600';
  const vagasLabel = evento.vagas ? `${evento.vagas} vagas` : 'Vagas a definir';

  return (
    <article
      id={`evento-card-${evento.id}`}
      className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl border border-slate-100 transition-all duration-300 group flex flex-col h-full hover:-translate-y-1"
    >
      <div className={`relative h-36 sm:h-40 p-4 flex items-start justify-between bg-gradient-to-br ${gradient}`}>
        <div className="rounded-2xl bg-white/15 border border-white/20 p-3 text-white shadow-sm">
          <Calendar aria-hidden="true" className="w-5 h-5" />
        </div>
        <span className="bg-white/90 backdrop-blur-sm text-slate-800 text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wider shadow-sm max-w-[70%] truncate">
          {evento.categoria || 'Geral'}
        </span>
      </div>

      <div className="p-6 flex flex-col flex-grow">
        <div className="mb-4">
          <h3 className={`text-xl font-bold text-slate-800 mb-3 ${titleClass} transition-colors leading-tight`}>
            {evento.titulo}
          </h3>
          <p className="text-slate-500 text-sm line-clamp-3 leading-relaxed">
            {evento.descricao}
          </p>
        </div>

        <div className="mt-auto pt-4 border-t border-slate-100 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-slate-500">
            <span className="flex items-center gap-1.5 min-w-0">
              <Calendar aria-hidden="true" className="w-4 h-4 shrink-0 text-slate-400" />
              <span className="truncate">{formatEventDate(evento.data_hora)}</span>
            </span>
            <span className="flex items-center gap-1.5 min-w-0">
              <MapPin aria-hidden="true" className="w-4 h-4 shrink-0 text-slate-400" />
              <span className="truncate">{evento.cidade || evento.endereco || 'Local a definir'}</span>
            </span>
            <span className="flex items-center gap-1.5 min-w-0">
              <Users aria-hidden="true" className="w-4 h-4 shrink-0 text-slate-400" />
              <span className="truncate">{vagasLabel}</span>
            </span>
          </div>

          <button
            type="button"
            onClick={() => onDetails(evento)}
            aria-label={`Ver detalhes de ${evento.titulo}`}
            className={`w-full sm:w-auto px-4 py-2.5 rounded-full transition-colors text-sm font-bold focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-emerald-500 ${colorClass}`}
          >
            Ver detalhes
          </button>
        </div>
      </div>
    </article>
  );
}
