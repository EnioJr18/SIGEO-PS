import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Filter, Link as LinkIcon, MapPin, Search, SearchX, Users, X } from 'lucide-react';
import EventCard from '../components/events/EventCard.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';
import LoadingState from '../components/ui/LoadingState.jsx';

const categoryOptions = [
  { value: '', label: 'Todas as causas' },
  { value: 'educacao', label: 'Educação' },
  { value: 'saude', label: 'Saúde' },
  { value: 'tecnologia', label: 'Tecnologia' },
  { value: 'meio_ambiente', label: 'Meio Ambiente' },
  { value: 'assistencia_social', label: 'Assistência Social' },
  { value: 'cultura', label: 'Cultura' },
  { value: 'outro', label: 'Outros' },
];

export default function Projetos({ eventos, handleParticipar, inscricoesConfirmadas = [], isLoading = false }) {
  // Estado local para controlar o Modal nesta página
  const [eventoSelecionado, setEventoSelecionado] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const filteredEventos = eventos.filter((evento) => {
    const search = searchTerm.trim().toLowerCase();
    const matchesSearch = !search || [evento.titulo, evento.descricao, evento.cidade, evento.endereco]
      .filter(Boolean)
      .some((value) => String(value).toLowerCase().includes(search));
    const matchesCategory = !selectedCategory || evento.categoria === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="py-16 bg-slate-50 min-h-screen">
      <div className="container mx-auto px-4 max-w-6xl">
        
        {/* Cabeçalho da Página */}
        <div className="mb-10 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-4 tracking-tight">
            Todos os Projetos
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Explore oportunidades de voluntariado e use a busca para encontrar iniciativas por nome, causa ou local.
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-3xl shadow-sm p-4 md:p-5 mb-8 grid grid-cols-1 md:grid-cols-[1fr_auto] gap-3">
          <label className="relative flex items-center">
            <Search aria-hidden="true" className="absolute left-4 w-5 h-5 text-slate-400" />
            <input
              type="search"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Buscar por nome, descrição ou local..."
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-12 pr-4 text-slate-700 outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
            />
          </label>

          <label className="relative flex items-center md:min-w-64">
            <Filter aria-hidden="true" className="absolute left-4 w-5 h-5 text-slate-400" />
            <select
              value={selectedCategory}
              onChange={(event) => setSelectedCategory(event.target.value)}
              className="w-full appearance-none rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-12 pr-4 text-slate-700 outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
              aria-label="Filtrar projetos por categoria"
            >
              {categoryOptions.map((option) => (
                <option key={option.value || 'all'} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        {/* Verificação se a lista está vazia */}
        {isLoading ? (
          <LoadingState text="Carregando projetos..." />
        ) : filteredEventos.length === 0 ? (
          <EmptyState
            icon={SearchX}
            title="Nenhum projeto encontrado"
            description="Não encontramos nenhuma iniciativa para os filtros selecionados."
            action={(
              <Link to="/" className="text-blue-600 font-bold hover:text-blue-800 hover:underline">
                &larr; Voltar para a tela inicial
              </Link>
            )}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredEventos.map((evento) => (
              <EventCard
                key={evento.id}
                evento={evento}
                onDetails={setEventoSelecionado}
                tone="blue"
              />
            ))}
          </div>
        )}

        {/* Botão extra de voltar no final da lista */}
        {!isLoading && filteredEventos.length > 0 && (
          <div className="mt-16 text-center">
             <Link to="/" className="text-slate-500 hover:text-slate-800 font-medium hover:underline transition-all">
              &larr; Voltar para a tela inicial
            </Link>
          </div>
        )}
      </div>

      {/* ========================================= */}
      {/* MODAL DE DETALHES                         */}
      {/* ========================================= */}
      {eventoSelecionado && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]" role="dialog" aria-modal="true" aria-labelledby="projeto-detalhes-titulo">
            
            <div className="flex justify-between items-center p-6 border-b border-slate-100 bg-slate-50">
              <span className="bg-blue-100 text-blue-800 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                {eventoSelecionado.categoria}
              </span>
              <button 
                onClick={() => setEventoSelecionado(null)}
                className="text-slate-400 hover:text-slate-600 bg-white hover:bg-slate-200 p-2 rounded-full transition-colors"
                aria-label="Fechar detalhes do projeto"
              >
                <X aria-hidden="true" className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto">
              <h3 id="projeto-detalhes-titulo" className="text-2xl font-extrabold text-slate-900 mb-4">{eventoSelecionado.titulo}</h3>
              <p className="text-slate-600 mb-6 leading-relaxed">
                {eventoSelecionado.descricao}
              </p>
              
              <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="flex items-start gap-3">
                    <MapPin aria-hidden="true" className="w-6 h-6 text-slate-500" />
                    <div>
                      <p className="text-[0.65rem] text-slate-400 font-bold uppercase tracking-wider mb-0.5">Localização</p>
                      <p className="font-semibold text-slate-700 text-sm">{eventoSelecionado.endereco || eventoSelecionado.cidade || "Local a definir"}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Calendar aria-hidden="true" className="w-6 h-6 text-slate-500" />
                    <div>
                      <p className="text-[0.65rem] text-slate-400 font-bold uppercase tracking-wider mb-0.5">Data e Hora</p>
                      <p className="font-semibold text-slate-700 text-sm">
                        {eventoSelecionado.data_hora ? new Date(eventoSelecionado.data_hora).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' }) : "Data não informada"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Users aria-hidden="true" className="w-6 h-6 text-slate-500" />
                    <div>
                      <p className="text-[0.65rem] text-slate-400 font-bold uppercase tracking-wider mb-0.5">Vagas</p>
                      <p className="font-semibold text-slate-700 text-sm">{eventoSelecionado.vagas || "Ilimitado"}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <LinkIcon aria-hidden="true" className="w-6 h-6 text-slate-500" />
                    <div>
                      <p className="text-[0.65rem] text-slate-400 font-bold uppercase tracking-wider mb-0.5">Comprovação</p>
                      <a href={eventoSelecionado.link_comprovacao || "#"} target="_blank" rel="noreferrer" className="font-semibold text-sm text-blue-600 hover:text-blue-800 hover:underline transition-colors line-clamp-1">
                        {eventoSelecionado.link_comprovacao ? "Acessar formulário" : "Nenhum link exigido"}
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-slate-100 bg-white flex justify-end gap-3">
              <button 
                onClick={() => setEventoSelecionado(null)}
                className="px-6 py-3 rounded-full font-bold text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                Voltar
              </button>
              <button 
                onClick={() => {
                  if (handleParticipar) handleParticipar(eventoSelecionado.id);
                  setEventoSelecionado(null);
                }}
                className={`px-6 py-3 rounded-full font-bold text-white shadow-md transition-all hover:-translate-y-0.5 ${
                  inscricoesConfirmadas.some(insc => insc.evento === eventoSelecionado.id)
                    ? 'bg-red-500 hover:bg-red-600'
                    : 'bg-blue-600 hover:bg-blue-500'
                }`}
              >
                {inscricoesConfirmadas.some(insc => insc.evento === eventoSelecionado.id)
                  ? "Cancelar Inscrição"
                  : "Confirmar Inscrição"}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
