import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Filter, Link as LinkIcon, MapPin, Search, SearchX, Users, X } from 'lucide-react';
import EventCard from '../components/events/EventCard.jsx';
import Button from '../components/ui/Button.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';
import Input from '../components/ui/Input.jsx';
import LoadingState from '../components/ui/LoadingState.jsx';

const categoryOptions = [
  { value: '', label: 'Todas as causas' },
  { value: 'educacao', label: 'Educação' },
  { value: 'saude', label: 'Saúde' },
  { value: 'tecnologia', label: 'Tecnologia' },
  { value: 'meio_ambiente', label: 'Meio Ambiente' },
  { value: 'causa_animal', label: 'Causa Animal' },
  { value: 'assistencia_social', label: 'Assistência Social' },
  { value: 'cultura', label: 'Cultura' },
  { value: 'outro', label: 'Outros' },
];

export default function Projetos({ eventos, handleParticipar, inscricoesConfirmadas = [], isLoading = false }) {
  // Estado local para controlar o Modal nesta página
  const [eventoSelecionado, setEventoSelecionado] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const hasActiveFilters = Boolean(searchTerm.trim() || selectedCategory);

  const filteredEventos = eventos.filter((evento) => {
    const search = searchTerm.trim().toLowerCase();
    const matchesSearch = !search || [evento.titulo, evento.descricao, evento.cidade, evento.endereco]
      .filter(Boolean)
      .some((value) => String(value).toLowerCase().includes(search));
    const matchesCategory = !selectedCategory || evento.categoria === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
  };

  return (
    <div className="py-12 md:py-16 bg-slate-50 min-h-screen">
      <div className="container mx-auto px-4 max-w-6xl">
        
        {/* Cabeçalho da Página */}
        <div className="mb-10 text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-blue-50 border border-blue-100 px-4 py-2 text-sm font-bold text-blue-700 mb-5">
            <Search aria-hidden="true" className="w-4 h-4" />
            Busca local por nome, descrição ou local
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-4 tracking-tight">
            Todos os Projetos
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Explore oportunidades de voluntariado e use a busca para encontrar iniciativas por nome, causa ou local.
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-3xl shadow-sm p-4 md:p-5 mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_18rem_auto] gap-3">
            <Input
              id="projetos-search"
              type="search"
              icon={Search}
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Buscar por nome, descrição ou local..."
              inputClassName="rounded-2xl focus:border-blue-500 focus:ring-blue-500"
              aria-label="Buscar projetos por nome, descrição ou local"
            />

            <label className="relative flex items-center">
              <span className="sr-only">Filtrar projetos por categoria</span>
              <Filter aria-hidden="true" className="absolute left-4 w-5 h-5 text-slate-400" />
              <select
                value={selectedCategory}
                onChange={(event) => setSelectedCategory(event.target.value)}
                className="w-full appearance-none rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-12 pr-4 text-slate-700 outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500"
                aria-label="Filtrar projetos por categoria"
              >
                {categoryOptions.map((option) => (
                  <option key={option.value || 'all'} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <Button
              type="button"
              variant="ghost"
              size="md"
              onClick={clearFilters}
              disabled={!hasActiveFilters}
              className="rounded-2xl text-slate-600 hover:text-slate-900"
            >
              <X aria-hidden="true" className="w-4 h-4" />
              Limpar filtros
            </Button>
          </div>

          <div className="mt-4 flex flex-col gap-2 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
            <p>
              {filteredEventos.length} {filteredEventos.length === 1 ? 'projeto encontrado' : 'projetos encontrados'}
            </p>
            {hasActiveFilters && (
              <p className="text-blue-700 font-semibold">
                Filtros ativos
              </p>
            )}
          </div>
        </div>

        {/* Verificação se a lista está vazia */}
        {isLoading ? (
          <LoadingState text="Carregando projetos..." />
        ) : filteredEventos.length === 0 ? (
          <EmptyState
            icon={SearchX}
            title={eventos.length === 0 ? "Nenhum projeto cadastrado" : "Nenhum projeto encontrado"}
            description={eventos.length === 0 ? "Assim que novos projetos forem publicados, eles aparecerão nesta página." : "Ajuste a busca, troque a categoria ou limpe os filtros para ver mais iniciativas."}
            action={(
              hasActiveFilters ? (
                <Button type="button" variant="secondary" onClick={clearFilters}>
                  Limpar filtros
                </Button>
              ) : (
                <Link to="/" className="text-blue-600 font-bold hover:text-blue-800 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded">
                  &larr; Voltar para a tela inicial
                </Link>
              )
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
             <Link to="/" className="text-slate-500 hover:text-slate-800 font-medium hover:underline transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded">
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
                className="text-slate-400 hover:text-slate-600 bg-white hover:bg-slate-200 p-2 rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
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
                      {eventoSelecionado.link_comprovacao ? (
                        <a href={eventoSelecionado.link_comprovacao} target="_blank" rel="noreferrer" className="font-semibold text-sm text-blue-600 hover:text-blue-800 hover:underline transition-colors line-clamp-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded">
                          Acessar formulário
                        </a>
                      ) : (
                        <span className="font-semibold text-sm text-slate-500">Nenhum link exigido</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-slate-100 bg-white flex flex-col sm:flex-row sm:justify-end gap-3">
              <button 
                onClick={() => setEventoSelecionado(null)}
                className="px-6 py-3 rounded-full font-bold text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              >
                Voltar
              </button>
              <button 
                onClick={() => {
                  if (handleParticipar) handleParticipar(eventoSelecionado.id);
                  setEventoSelecionado(null);
                }}
                className={`px-6 py-3 rounded-full font-bold text-white shadow-md transition-all hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
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
