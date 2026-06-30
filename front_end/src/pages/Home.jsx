import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  BookOpen,
  Brain,
  Calendar,
  CircleDot,
  Code2,
  Compass,
  HandHeart,
  HeartPulse,
  Leaf,
  Link as LinkIcon,
  Map,
  MapPin,
  Palette,
  PawPrint,
  Plus,
  Search,
  SearchX,
  ShieldCheck,
  Users,
  X,
} from 'lucide-react';
import EventMap from '../EventMap.jsx'; // Importando da pasta pai
import EventCard from '../components/events/EventCard.jsx';
import Button from '../components/ui/Button.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';
import Input from '../components/ui/Input.jsx';
import LoadingState from '../components/ui/LoadingState.jsx';

const valueHighlights = [
  { icon: Compass, label: 'Projetos no mapa' },
  { icon: Calendar, label: 'Agenda organizada' },
  { icon: Users, label: 'Inscrição simplificada' },
  { icon: Brain, label: 'Apoio de IA' },
];

const categories = [
  { value: '', label: 'Todas', icon: CircleDot },
  { value: 'educacao', label: 'Educação', icon: BookOpen },
  { value: 'saude', label: 'Saúde', icon: HeartPulse },
  { value: 'tecnologia', label: 'Tecnologia', icon: Code2 },
  { value: 'meio_ambiente', label: 'Meio Ambiente', icon: Leaf },
  { value: 'causa_animal', label: 'Causa Animal', icon: PawPrint },
  { value: 'assistencia_social', label: 'Assistência Social', icon: HandHeart },
  { value: 'cultura', label: 'Cultura', icon: Palette },
  { value: 'outro', label: 'Outros', icon: ShieldCheck },
];

export default function Home({
  eventos,
  isLoading,
  apiError,
  searchValue,
  setSearchValue,
  handleSearch,
  handleParticipar,
  inscricoesConfirmadas,
  setToastMessage,
  eventoSelecionado,
  setEventoSelecionado,
  handleCategoryFilter,
}) {
    const navigate = useNavigate();
  return (
    <>
      {/* ========================================= */}
      {/* HERO SECTION                              */}
      {/* ========================================= */}
      <section className="bg-gradient-to-b from-slate-950 via-slate-900 to-emerald-900 py-16 md:py-24 px-4 text-center shadow-inner">
        <div className="container mx-auto max-w-5xl">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/15 px-4 py-2 text-sm font-semibold text-emerald-100 mb-6">
            <ShieldCheck aria-hidden="true" className="w-4 h-4 text-emerald-300" />
            Eventos sociais com localização, inscrição e apoio inteligente
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white tracking-tight mb-6 max-w-5xl mx-auto leading-tight">
            Encontre projetos sociais <span className="text-emerald-400">perto de você</span>
          </h1>
          <p className="text-lg md:text-xl text-emerald-100 mb-10 max-w-3xl mx-auto leading-relaxed">
            Descubra eventos sociais por geolocalização, inscreva-se com poucos cliques e conte com a IA para encontrar oportunidades alinhadas ao seu perfil.
          </p>

          <form onSubmit={handleSearch} aria-label="Buscar projetos sociais" className="flex flex-col sm:flex-row gap-3 max-w-3xl mx-auto mb-8">
            <Input
              id="home-search"
              type="search"
              icon={Search}
              placeholder="Busque por nome, causa ou local..."
              value={searchValue}
              onChange={(event) => setSearchValue(event.target.value)}
              className="flex-1"
              inputClassName="rounded-full bg-white py-4 text-slate-800 shadow-lg focus:ring-4 focus:ring-emerald-500/50"
              aria-label="Buscar projetos por nome, causa ou local"
            />
            <Button type="submit" size="lg" className="bg-emerald-500 hover:bg-emerald-400 text-emerald-950 whitespace-nowrap">
              Pesquisar
            </Button>
          </form>

          <div className="flex flex-wrap items-center justify-center gap-4 mb-10">
            <Button as={Link} to="/projetos" size="lg" className="bg-emerald-500 hover:bg-emerald-400 text-emerald-950">
              <ArrowRight aria-hidden="true" className="w-5 h-5" />
              Ver projetos
            </Button>
            <Button as="a" href="#mapa" variant="secondary" size="lg" className="bg-emerald-800/50 hover:bg-emerald-700/50 text-white border-emerald-500/30 shadow-sm backdrop-blur-sm">
              <Map aria-hidden="true" className="w-5 h-5" />
              Explorar mapa
            </Button>
            <Button as={Link} to="/criar-evento" variant="secondary" size="lg" className="bg-white hover:bg-slate-100 text-emerald-900">
              <Plus aria-hidden="true" className="w-5 h-5" />
              Cadastrar projeto
            </Button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-4xl mx-auto">
            {valueHighlights.map(({ icon: Icon, label }) => (
              <div key={label} className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-emerald-50 backdrop-blur-sm">
                <Icon aria-hidden="true" className="w-5 h-5 mx-auto mb-2 text-emerald-300" />
                <span className="text-sm font-semibold">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================= */}
      {/* MAPA SECTION                              */}
      {/* ========================================= */}
      <section id="mapa" className="py-16 md:py-24 bg-white">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-10 md:mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4 tracking-tight">
              Mapa Interativo de Projetos
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Veja no mapa onde as iniciativas acontecem e escolha projetos próximos da sua rotina.
            </p>
          </div>
          
          <div className="bg-slate-200 rounded-3xl shadow-xl border border-slate-200 overflow-hidden h-[450px] md:h-[550px] lg:h-[650px] relative z-0">
            <div className="w-full h-full relative z-10">
              <EventMap 
                eventos={eventos} 
                isLoading={isLoading} 
                apiError={apiError} 
                onViewDetails={(eventoId, titulo) => {
                  setToastMessage(`Lendo detalhes: ${titulo}`);
                  const cardSelecionado = document.getElementById(`evento-card-${eventoId}`);
                  if (cardSelecionado) {
                    cardSelecionado.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    cardSelecionado.style.transition = 'box-shadow 0.4s';
                    cardSelecionado.style.boxShadow = '0 0 0 5px rgba(59, 130, 246, 0.5)';
                    setTimeout(() => cardSelecionado.style.boxShadow = 'none', 1500);
                  } else {
                    document.querySelector('#eventos')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }
                }}
                onParticipar={handleParticipar}
                inscricoesConfirmadas={inscricoesConfirmadas}
              />
            </div>
          </div>
        </div>
      </section>

      {/* ========================================= */}
      {/* CATEGORIAS SECTION                        */}
      {/* ========================================= */}
      <section id="categorias" className="py-12 bg-slate-50">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-slate-800 tracking-tight">
                Explore por causas
              </h2>
              <p className="text-slate-500 mt-2">
                Filtre rapidamente por áreas de atuação social.
              </p>
            </div>
          </div>

          <div className="flex overflow-x-auto pb-6 pt-2 -mx-4 px-4 md:mx-0 md:px-0 md:grid md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 snap-x snap-mandatory" style={{ scrollbarWidth: 'none' }}>
            {categories.map(({ value, label, icon: Icon, active }) => (
              <button
                key={value || 'todas'}
                onClick={() => handleCategoryFilter(value)}
                type="button"
                className={`snap-start shrink-0 w-36 md:w-auto flex flex-col items-center justify-center p-5 rounded-2xl border shadow-sm hover:shadow-md hover:-translate-y-1 transition-all ${
                  active
                    ? 'bg-emerald-600 text-white border-emerald-600'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-emerald-300 hover:text-emerald-600'
                }`}
              >
                <Icon aria-hidden="true" className="w-6 h-6 mb-3" />
                <span className="font-semibold text-sm text-center">{label}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================= */}
      {/* DESTAQUES SECTION                         */}
      {/* ========================================= */}
      <section id="eventos" className="py-16 bg-white">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
            <div>
              <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight mb-2">
                Projetos em Destaque
              </h2>
              <p className="text-lg text-slate-600">
                Iniciativas recentes para participar, acompanhar ou divulgar.
              </p>
            </div>
            <button onClick={() => navigate("/projetos")} className="hidden md:inline-flex items-center gap-2 text-blue-600 font-bold hover:text-blue-700 hover:underline underline-offset-4 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded">
              Explorar todos
              <ArrowRight aria-hidden="true" className="w-5 h-5" />
            </button>
          </div>

          {isLoading ? (
            <LoadingState text="Carregando projetos..." />
          ) : eventos.length === 0 ? (
            <EmptyState
              icon={SearchX}
              title="Nenhum projeto encontrado"
              description="Tente buscar por outro termo ou explorar todas as causas disponíveis."
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {eventos.slice(0, 6).map((evento) => (
                <EventCard
                  key={evento.id}
                  evento={evento}
                  onDetails={setEventoSelecionado}
                  tone="emerald"
                />
              ))}
            </div>
          )}

          {!isLoading && eventos.length > 0 && (
          <div className="mt-12 text-center">
            <Button onClick={() => navigate("/projetos")} variant="ghost" size="lg" className="bg-slate-900 hover:bg-slate-800 text-white shadow-lg hover:shadow-xl hover:-translate-y-1">
              Ver todos os projetos
              <ArrowRight aria-hidden="true" className="w-5 h-5" />
            </Button>
          </div>
          )}
        </div>
      </section>

      {/* ========================================= */}
      {/* MODAL DE DETALHES                         */}
      {/* ========================================= */}
      {eventoSelecionado && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]" role="dialog" aria-modal="true" aria-labelledby="evento-detalhes-titulo">
            
            {/* Cabeçalho do Modal */}
            <div className="flex justify-between items-center p-6 border-b border-slate-100 bg-slate-50">
              <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">
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

            {/* Corpo do Modal */}
            <div className="p-6 overflow-y-auto">
              <h3 id="evento-detalhes-titulo" className="text-2xl font-extrabold text-slate-900 mb-4">{eventoSelecionado.titulo}</h3>
              <p className="text-slate-600 mb-6 leading-relaxed">
                {eventoSelecionado.descricao}
              </p>
              
              {/* Informações Dinâmicas puxando do Banco */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-slate-50 p-6 rounded-2xl border border-slate-100">
                
                <div className="flex items-start gap-4">
                  <MapPin aria-hidden="true" className="w-6 h-6 text-slate-500 drop-shadow-sm" />
                  <div>
                    <span className="block text-xs font-bold text-slate-400 mb-1 tracking-wider uppercase">Localização</span>
                    <span className="font-semibold text-slate-700">{eventoSelecionado.endereco || eventoSelecionado.cidade || "Local a definir"}</span>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <Calendar aria-hidden="true" className="w-6 h-6 text-slate-500 drop-shadow-sm" />
                  <div>
                    <span className="block text-xs font-bold text-slate-400 mb-1 tracking-wider uppercase">Data e Hora</span>
                    <span className="font-semibold text-slate-700">
                      {eventoSelecionado.data_hora ? new Date(eventoSelecionado.data_hora).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' }) : "Data não informada"}
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <Users aria-hidden="true" className="w-6 h-6 text-slate-500 drop-shadow-sm" />
                  <div>
                    <span className="block text-xs font-bold text-slate-400 mb-1 tracking-wider uppercase">Vagas</span>
                    <span className="font-semibold text-slate-700">{eventoSelecionado.vagas || "Ilimitado"}</span>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <LinkIcon aria-hidden="true" className="w-6 h-6 text-slate-500 drop-shadow-sm" />
                  <div>
                    <span className="block text-xs font-bold text-slate-400 mb-1 tracking-wider uppercase">Comprovação</span>
                    {eventoSelecionado.link_comprovacao ? (
                      <a href={eventoSelecionado.link_comprovacao} target="_blank" rel="noopener noreferrer" className="font-bold text-blue-600 hover:text-blue-700 hover:underline">
                        Acessar link
                      </a>
                    ) : (
                      <span className="font-semibold text-slate-500">Nenhum link exigido</span>
                    )}
                  </div>
                </div>

              </div>
            </div>

            {/* Rodapé do Modal com Botões */}
            <div className="p-6 border-t border-slate-100 bg-white flex flex-col sm:flex-row justify-end gap-3">
              <button 
                onClick={() => setEventoSelecionado(null)}
                className="px-6 py-3 rounded-full font-bold text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors w-full sm:w-auto text-center"
              >
                Voltar
              </button>
              
              {/* O Botão Mágico que muda de estado */}
              <button 
                onClick={() => {
                  if (handleParticipar) handleParticipar(eventoSelecionado.id);
                  // Removemos o setEventoSelecionado(null) daqui para o modal não fechar na cara do usuário!
                }}
                className={`px-6 py-3 rounded-full font-bold text-white shadow-md transition-all hover:-translate-y-0.5 w-full sm:w-auto text-center ${
                  inscricoesConfirmadas?.some(insc => insc.evento === eventoSelecionado.id)
                    ? "bg-red-500 hover:bg-red-600" // Se já tá inscrito, fica vermelho para cancelar
                    : "bg-emerald-600 hover:bg-emerald-500" // Se não tá, fica verde para inscrever
                }`}
              >
                {inscricoesConfirmadas?.some(insc => insc.evento === eventoSelecionado.id)
                  ? "Cancelar Inscrição"
                  : "Confirmar Inscrição"}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* ========================================= */}
      {/* SOBRE / CTA SECTION                       */}
      {/* ========================================= */}
      <section id="sobre" className="py-20 bg-gradient-to-b from-slate-900 to-emerald-900 text-white text-center shadow-inner">
        <div className="container mx-auto px-4 max-w-3xl">
          
          <h2 className="text-3xl md:text-4xl font-extrabold mb-6">Sobre o SIGEO</h2>
          <p className="text-lg md:text-xl text-emerald-100 mb-16 leading-relaxed">
            O SIGEO é uma plataforma que conecta voluntários a projetos sociais, promovendo o engajamento e o impacto positivo nas comunidades.
          </p>
          
          <div className="w-16 h-1 bg-emerald-500/30 mx-auto mb-16 rounded-full"></div>

          <h2 className="text-2xl md:text-3xl font-bold mb-4">Pronto para Fazer a Diferença?</h2>
          <p className="text-emerald-200 mb-10">
            Junte-se a voluntários e organizações que fortalecem a nossa região todos os dias.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button as="a" href="#mapa" variant="secondary" size="lg" className="w-full sm:w-auto bg-white text-emerald-950 hover:bg-slate-100">
              Encontrar projetos
            </Button>
            <Button as={Link} to="/criar-evento" size="lg" className="w-full sm:w-auto bg-emerald-500 hover:bg-emerald-400 text-emerald-950">
              Criar novo projeto
            </Button>
          </div>

        </div>
      </section>
    </>
  );
}
