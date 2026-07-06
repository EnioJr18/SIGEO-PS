import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AlertTriangle, Calendar, CalendarDays, CalendarX, CheckCircle, Clock3, History, Settings, Sprout, Star } from 'lucide-react';
import { avaliarEvento, cancelarInscricao, getPerfil, updatePerfil, deletePerfil, getMinhasInscricoes } from '../api';
import Button from '../components/ui/Button.jsx';
import ConfirmDialog from '../components/ui/ConfirmDialog.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';
import Input from '../components/ui/Input.jsx';
import LoadingState from '../components/ui/LoadingState.jsx';

const statusStyles = {
  confirmada: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  pendente: 'bg-amber-50 text-amber-700 border-amber-200',
  cancelada: 'bg-red-50 text-red-700 border-red-200',
};

function StatusBadge({ status }) {
  const label = status || 'confirmada';

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-bold capitalize ${statusStyles[label] || statusStyles.confirmada}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current" aria-hidden="true" />
      {label}
    </span>
  );
}

export default function PainelParticipante() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('agenda');
  const [loading, setLoading] = useState(true);
  const [mensagem, setMensagem] = useState({ tipo: '', texto: '' });
  const [confirmDialog, setConfirmDialog] = useState(null);
  const [isConfirmingAction, setIsConfirmingAction] = useState(false);
  const [avaliacaoEvento, setAvaliacaoEvento] = useState(null);
  const [nota, setNota] = useState(5);
  const [comentario, setComentario] = useState('');
  const [isSubmittingAvaliacao, setIsSubmittingAvaliacao] = useState(false);
  const [avaliacoesEnviadas, setAvaliacoesEnviadas] = useState(() => new Set());

  // Estados dos dados
  const [perfil, setPerfil] = useState({ first_name: '', email: '' });
  const [agenda, setAgenda] = useState([]);
  const [historico, setHistorico] = useState([]);

  const carregarDados = async () => {
    try {
      // Busca os dados do perfil e das inscrições ao mesmo tempo
      const [dadosPerfil, dadosInscricoes] = await Promise.all([
        getPerfil(),
        getMinhasInscricoes()
      ]);

      setPerfil({
        first_name: dadosPerfil.first_name || '',
        email: dadosPerfil.email || ''
      });

      // Lógica de Viagem no Tempo: Separa o Futuro (Agenda) do Passado (Histórico)
      const agora = new Date();
      const inscricoesFuturas = [];
      const inscricoesPassadas = [];

      dadosInscricoes.forEach(insc => {
        const dataEvento = new Date(insc.evento_data);
        if (dataEvento >= agora) {
          inscricoesFuturas.push(insc);
        } else {
          inscricoesPassadas.push(insc);
        }
      });

      // Ordena a agenda para o evento mais próximo aparecer primeiro
      inscricoesFuturas.sort((a, b) => new Date(a.evento_data) - new Date(b.evento_data));
      // Ordena o histórico para o evento mais recente aparecer primeiro
      inscricoesPassadas.sort((a, b) => new Date(b.evento_data) - new Date(a.evento_data));

      setAgenda(inscricoesFuturas);
      setHistorico(inscricoesPassadas);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      setMensagem({ tipo: 'erro', texto: 'Não foi possível carregar as suas informações.' });
    } finally {
      setLoading(false);
    }
  };

  const handlePerfilChange = (e) => {
    setPerfil({ ...perfil, [e.target.name]: e.target.value });
  };

  const handleSalvarPerfil = async (e) => {
    e.preventDefault();
    setMensagem({ tipo: '', texto: '' });
    try {
      await updatePerfil(perfil);
      setMensagem({ tipo: 'sucesso', texto: 'Perfil atualizado com sucesso!' });
    } catch {
      setMensagem({ tipo: 'erro', texto: 'Erro ao atualizar o perfil.' });
    }
  };

  const handleExcluirConta = async () => {
    setConfirmDialog({
      title: 'Excluir conta permanentemente?',
      description: 'Todos os seus dados, inscrições e histórico serão apagados. Essa ação não pode ser desfeita.',
      confirmLabel: 'Excluir minha conta',
      cancelLabel: 'Manter conta',
      onConfirm: async () => {
        setIsConfirmingAction(true);
      try {
        await deletePerfil();
        localStorage.clear();
        navigate('/');
      } catch {
        setMensagem({ tipo: 'erro', texto: 'Erro ao tentar excluir a conta.' });
        setConfirmDialog(null);
      } finally {
        setIsConfirmingAction(false);
      }
      },
    });
  };

  useEffect(() => {
    const timer = setTimeout(carregarDados, 0);
    return () => clearTimeout(timer);
  }, []);

  const handleCancelarInscricao = async (inscricao) => {
    setConfirmDialog({
      title: 'Cancelar inscrição?',
      description: 'Você deixará de participar deste projeto. Essa ação pode ser refeita se ainda houver vagas.',
      confirmLabel: 'Sim, cancelar',
      cancelLabel: 'Voltar',
      onConfirm: async () => {
        setIsConfirmingAction(true);

    try {
      await cancelarInscricao(inscricao.evento);
      setMensagem({ tipo: 'sucesso', texto: 'Inscrição cancelada com sucesso.' });
          setConfirmDialog(null);
      await carregarDados();
    } catch (error) {
      setMensagem({ tipo: 'erro', texto: error.message || 'Erro ao cancelar inscrição.' });
          setConfirmDialog(null);
        } finally {
          setIsConfirmingAction(false);
        }
      },
    });
  };

  const abrirModalAvaliacao = (inscricao) => {
    setAvaliacaoEvento(inscricao);
    setNota(5);
    setComentario('');
    setMensagem({ tipo: '', texto: '' });
  };

  const fecharModalAvaliacao = () => {
    if (isSubmittingAvaliacao) return;
    setAvaliacaoEvento(null);
    setComentario('');
    setNota(5);
  };

  const handleEnviarAvaliacao = async (event) => {
    event.preventDefault();
    if (!avaliacaoEvento) return;

    setIsSubmittingAvaliacao(true);
    setMensagem({ tipo: '', texto: '' });

    try {
      await avaliarEvento(avaliacaoEvento.evento, {
        nota,
        comentario,
      });
      setAvaliacoesEnviadas((current) => {
        const next = new Set(current);
        next.add(avaliacaoEvento.evento);
        return next;
      });
      setMensagem({ tipo: 'sucesso', texto: 'Avaliação enviada com sucesso.' });
      setAvaliacaoEvento(null);
      setComentario('');
      setNota(5);
    } catch (error) {
      setMensagem({ tipo: 'erro', texto: error.message || 'Não foi possível enviar sua avaliação.' });
    } finally {
      setIsSubmittingAvaliacao(false);
    }
  };

  if (loading) {
    return (
      <div className="py-16 bg-slate-50 min-h-screen flex items-center justify-center">
        <LoadingState text="Carregando seu painel..." />
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        
        {/* Cabeçalho */}
        <div className="mb-8 rounded-3xl bg-gradient-to-r from-slate-900 to-blue-900 p-6 md:p-8 text-white shadow-lg">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/15 px-3 py-1 text-xs font-bold text-blue-100 mb-4">
            <Sprout aria-hidden="true" className="w-4 h-4" />
            Área do participante
          </span>
          <h1 className="text-3xl md:text-4xl font-extrabold mb-2">Painel do Voluntário</h1>
          <p className="text-blue-100 text-lg max-w-2xl">Acompanhe sua agenda, seu histórico de impacto e gerencie sua conta.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Próximos eventos</span>
              <CalendarDays aria-hidden="true" className="w-5 h-5 text-emerald-600" />
            </div>
            <strong className="text-3xl font-extrabold text-slate-900">{agenda.length}</strong>
          </div>
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Histórico</span>
              <History aria-hidden="true" className="w-5 h-5 text-blue-600" />
            </div>
            <strong className="text-3xl font-extrabold text-slate-900">{historico.length}</strong>
          </div>
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Conta</span>
              <Settings aria-hidden="true" className="w-5 h-5 text-slate-600" />
            </div>
            <span className="text-sm font-semibold text-slate-600">Perfil e preferências</span>
          </div>
        </div>

        {/* Sistema de Abas (Tabs) */}
        <div className="flex flex-wrap gap-2 mb-8 border-b border-slate-200 pb-4" role="tablist" aria-label="Seções do painel do participante">
          <button 
            onClick={() => setActiveTab('agenda')}
            role="tab"
            aria-selected={activeTab === 'agenda'}
            className={`px-6 py-2.5 rounded-full font-bold transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${activeTab === 'agenda' ? 'bg-emerald-600 text-white shadow-md' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'}`}
          >
            <CalendarDays aria-hidden="true" className="w-4 h-4 inline-block mr-2" />
            Minha Agenda
          </button>
          <button 
            onClick={() => setActiveTab('historico')}
            role="tab"
            aria-selected={activeTab === 'historico'}
            className={`px-6 py-2.5 rounded-full font-bold transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${activeTab === 'historico' ? 'bg-emerald-600 text-white shadow-md' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'}`}
          >
            <History aria-hidden="true" className="w-4 h-4 inline-block mr-2" />
            Histórico de Impacto
          </button>
          <button 
            onClick={() => setActiveTab('perfil')}
            role="tab"
            aria-selected={activeTab === 'perfil'}
            className={`px-6 py-2.5 rounded-full font-bold transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-600 ${activeTab === 'perfil' ? 'bg-slate-800 text-white shadow-md' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'}`}
          >
            <Settings aria-hidden="true" className="w-4 h-4 inline-block mr-2" />
            Configurações
          </button>
        </div>

        {/* Feedback de Mensagens */}
        {mensagem.texto && (
          <div className={`mb-6 p-4 rounded-xl flex items-start gap-3 border ${mensagem.tipo === 'erro' ? 'bg-red-50 border-red-200 text-red-600' : 'bg-emerald-50 border-emerald-200 text-emerald-700'}`} role="status" aria-live="polite">
            {mensagem.tipo === 'erro'
              ? <AlertTriangle aria-hidden="true" className="w-5 h-5 shrink-0" />
              : <CheckCircle aria-hidden="true" className="w-5 h-5 shrink-0" />}
            <p className="text-sm font-medium">{mensagem.texto}</p>
          </div>
        )}

        {/* =========================================
            CONTEÚDO DA ABA: AGENDA
        ========================================= */}
        {activeTab === 'agenda' && (
          <div className="space-y-4" role="tabpanel">
            {agenda.length === 0 ? (
              <EmptyState
                icon={CalendarX}
                title="Sua agenda está livre"
                description="Você ainda não está inscrito em nenhum evento futuro."
                action={(
                  <Button as={Link} to="/projetos">
                    Explorar Projetos
                  </Button>
                )}
              />
            ) : (
              agenda.map((insc) => (
                <div key={insc.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:shadow-md transition-shadow">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-lg">
                        <Clock3 aria-hidden="true" className="w-3.5 h-3.5" />
                        Acontecerá em breve
                      </span>
                      <StatusBadge status={insc.status} />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800">{insc.evento_titulo}</h3>
                    <p className="text-slate-500 mt-1 flex items-center gap-2">
                      <Calendar aria-hidden="true" className="w-4 h-4" />
                      {new Date(insc.evento_data).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}
                    </p>
                  </div>
                  {insc.status !== 'cancelada' && (
                    <Button
                      onClick={() => handleCancelarInscricao(insc)}
                      variant="secondary"
                      className="border-red-200 hover:bg-red-50 text-red-600"
                    >
                      Cancelar inscrição
                    </Button>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* =========================================
            CONTEÚDO DA ABA: HISTÓRICO
        ========================================= */}
        {activeTab === 'historico' && (
          <div className="space-y-4" role="tabpanel">
            {historico.length === 0 ? (
              <EmptyState
                icon={Sprout}
                title="Seu impacto começa aqui"
                description="Quando você participar de eventos, eles ficarão salvos no seu portfólio."
              />
            ) : (
              historico.map((insc) => (
                <div key={insc.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 opacity-90 hover:opacity-100 transition-opacity">
                  <div className="min-w-0">
                    <div className="mb-2">
                      <StatusBadge status={insc.status} />
                    </div>
                    <h3 className="text-lg font-bold text-slate-800">{insc.evento_titulo}</h3>
                    <p className="text-slate-500 mt-1">Realizado em: {new Date(insc.evento_data).toLocaleDateString('pt-BR')}</p>
                  </div>
                  <Button
                    type="button"
                    variant="secondary"
                    className="bg-amber-100 text-amber-700 hover:bg-amber-200 border-amber-100"
                    onClick={() => abrirModalAvaliacao(insc)}
                    disabled={avaliacoesEnviadas.has(insc.evento)}
                  >
                    <Star aria-hidden="true" className="w-4 h-4" />
                    {avaliacoesEnviadas.has(insc.evento) ? 'Avaliado' : 'Avaliar evento'}
                  </Button>
                </div>
              ))
            )}
          </div>
        )}

        {/* =========================================
            CONTEÚDO DA ABA: PERFIL
        ========================================= */}
        {activeTab === 'perfil' && (
          <div className="space-y-8" role="tabpanel">
            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
              <h2 className="text-2xl font-bold text-slate-800 mb-6">Informações Pessoais</h2>
              
              <form onSubmit={handleSalvarPerfil}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <Input
                    label="Nome de exibição"
                    type="text"
                    name="first_name"
                    value={perfil.first_name}
                    onChange={handlePerfilChange}
                    required
                  />
                  <Input
                    label="E-mail de contato"
                    type="email"
                    name="email"
                    value={perfil.email}
                    onChange={handlePerfilChange}
                    required
                  />
                </div>
                <div className="flex justify-end">
                  <Button type="submit" variant="secondary" size="lg" className="bg-slate-800 hover:bg-slate-700 text-white border-slate-800">
                    Salvar Alterações
                  </Button>
                </div>
              </form>
            </div>

            {/* Zona de Perigo (LGPD / Exclusão) */}
            <div className="bg-red-50 border border-red-200 p-8 rounded-3xl">
              <h3 className="text-xl font-bold text-red-700 mb-2">Zona de Perigo</h3>
              <p className="text-red-600/80 mb-6 max-w-xl">
                Ao excluir sua conta, todos os seus dados, histórico de inscrições e acessos serão apagados permanentemente. Isso não pode ser desfeito.
              </p>
              <Button
                variant="danger"
                size="lg"
                onClick={handleExcluirConta}
              >
                Excluir minha conta permanentemente
              </Button>
            </div>
          </div>
        )}

      </div>
      <ConfirmDialog
        open={Boolean(confirmDialog)}
        title={confirmDialog?.title}
        description={confirmDialog?.description}
        confirmLabel={confirmDialog?.confirmLabel}
        cancelLabel={confirmDialog?.cancelLabel}
        variant="danger"
        isLoading={isConfirmingAction}
        onCancel={() => setConfirmDialog(null)}
        onConfirm={() => confirmDialog?.onConfirm()}
      />

      {avaliacaoEvento && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center bg-slate-950/70 px-4 py-6 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white shadow-2xl" role="dialog" aria-modal="true" aria-labelledby="avaliacao-evento-titulo">
            <div className="border-b border-slate-100 p-6">
              <h2 id="avaliacao-evento-titulo" className="text-2xl font-extrabold text-slate-900">
                Avaliar evento
              </h2>
              <p className="mt-2 text-sm text-slate-500">
                Conte como foi sua experiência em {avaliacaoEvento.evento_titulo}.
              </p>
            </div>

            <form onSubmit={handleEnviarAvaliacao} className="space-y-6 p-6">
              <div>
                <span className="block text-sm font-bold text-slate-700 mb-3">Nota</span>
                <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Nota do evento">
                  {[1, 2, 3, 4, 5].map((value) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setNota(value)}
                      className={`inline-flex h-11 w-11 items-center justify-center rounded-full border font-extrabold transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${
                        nota === value
                          ? 'border-amber-400 bg-amber-100 text-amber-700 shadow-sm'
                          : 'border-slate-200 bg-slate-50 text-slate-500 hover:border-amber-300'
                      }`}
                      role="radio"
                      aria-checked={nota === value}
                    >
                      {value}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label htmlFor="comentario-avaliacao" className="block text-sm font-bold text-slate-700 mb-2">
                  Comentário opcional
                </label>
                <textarea
                  id="comentario-avaliacao"
                  value={comentario}
                  onChange={(event) => setComentario(event.target.value)}
                  rows="4"
                  placeholder="Compartilhe um comentário breve sobre o projeto."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-700 placeholder-slate-400 outline-none transition-all focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
                <Button type="button" variant="ghost" onClick={fecharModalAvaliacao} disabled={isSubmittingAvaliacao}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={isSubmittingAvaliacao}>
                  {isSubmittingAvaliacao ? 'Enviando...' : 'Enviar avaliação'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
