import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AlertTriangle, Calendar, CalendarDays, CalendarX, CheckCircle, Clock3, History, Settings, Sprout } from 'lucide-react';
import { cancelarInscricao, getPerfil, updatePerfil, deletePerfil, getMinhasInscricoes } from '../api';
import EmptyState from '../components/ui/EmptyState.jsx';
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
    const confirmacao = window.confirm(
      "Tem certeza absoluta? Essa ação apagará seu histórico de impacto e não pode ser desfeita."
    );
    if (confirmacao) {
      try {
        await deletePerfil();
        // Limpa o token do navegador (ajuste a chave do localStorage se você usar outro nome)
        localStorage.removeItem('token'); 
        alert("Conta excluída. Esperamos ver você de novo no futuro!");
        navigate('/'); // Joga o usuário de volta para a Home
      } catch {
        setMensagem({ tipo: 'erro', texto: 'Erro ao tentar excluir a conta.' });
      }
    }
  };

  useEffect(() => {
    const timer = setTimeout(carregarDados, 0);
    return () => clearTimeout(timer);
  }, []);

  const handleCancelarInscricao = async (inscricao) => {
    const confirmacao = window.confirm("Tem certeza que deseja cancelar esta inscrição?");
    if (!confirmacao) return;

    try {
      await cancelarInscricao(inscricao.evento);
      setMensagem({ tipo: 'sucesso', texto: 'Inscrição cancelada com sucesso.' });
      await carregarDados();
    } catch (error) {
      setMensagem({ tipo: 'erro', texto: error.message || 'Erro ao cancelar inscrição.' });
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
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-slate-900 mb-2">Painel do Voluntário</h1>
          <p className="text-slate-600 text-lg">Acompanhe sua agenda, seu histórico de impacto e gerencie sua conta.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Próximos eventos</span>
              <CalendarDays aria-hidden="true" className="w-5 h-5 text-emerald-600" />
            </div>
            <strong className="text-3xl font-extrabold text-slate-900">{agenda.length}</strong>
          </div>
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Histórico</span>
              <History aria-hidden="true" className="w-5 h-5 text-blue-600" />
            </div>
            <strong className="text-3xl font-extrabold text-slate-900">{historico.length}</strong>
          </div>
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Conta</span>
              <Settings aria-hidden="true" className="w-5 h-5 text-slate-600" />
            </div>
            <span className="text-sm font-semibold text-slate-600">Perfil e preferências</span>
          </div>
        </div>

        {/* Sistema de Abas (Tabs) */}
        <div className="flex flex-wrap gap-2 mb-8 border-b border-slate-200 pb-4">
          <button 
            onClick={() => setActiveTab('agenda')}
            className={`px-6 py-2.5 rounded-full font-bold transition-all ${activeTab === 'agenda' ? 'bg-emerald-600 text-white shadow-md' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'}`}
          >
            <CalendarDays aria-hidden="true" className="w-4 h-4 inline-block mr-2" />
            Minha Agenda
          </button>
          <button 
            onClick={() => setActiveTab('historico')}
            className={`px-6 py-2.5 rounded-full font-bold transition-all ${activeTab === 'historico' ? 'bg-emerald-600 text-white shadow-md' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'}`}
          >
            <History aria-hidden="true" className="w-4 h-4 inline-block mr-2" />
            Histórico de Impacto
          </button>
          <button 
            onClick={() => setActiveTab('perfil')}
            className={`px-6 py-2.5 rounded-full font-bold transition-all ${activeTab === 'perfil' ? 'bg-slate-800 text-white shadow-md' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'}`}
          >
            <Settings aria-hidden="true" className="w-4 h-4 inline-block mr-2" />
            Configurações
          </button>
        </div>

        {/* Feedback de Mensagens */}
        {mensagem.texto && (
          <div className={`mb-6 p-4 rounded-xl flex items-start gap-3 border ${mensagem.tipo === 'erro' ? 'bg-red-50 border-red-200 text-red-600' : 'bg-emerald-50 border-emerald-200 text-emerald-700'}`}>
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
          <div className="space-y-4">
            {agenda.length === 0 ? (
              <EmptyState
                icon={CalendarX}
                title="Sua agenda está livre"
                description="Você ainda não está inscrito em nenhum evento futuro."
                action={(
                  <Link to="/projetos" className="inline-block px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-full transition-colors">
                    Explorar Projetos
                  </Link>
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
                    <button
                      onClick={() => handleCancelarInscricao(insc)}
                      className="px-5 py-2.5 text-sm font-bold text-red-600 hover:bg-red-50 rounded-xl border border-red-200 transition-colors"
                    >
                      Cancelar inscrição
                    </button>
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
          <div className="space-y-4">
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
                  {/* Botão de avaliar (que implementaremos no futuro) */}
                  <button className="px-5 py-2.5 text-sm font-bold bg-amber-100 text-amber-700 hover:bg-amber-200 rounded-xl transition-colors">
                    ⭐ Avaliar Evento
                  </button>
                </div>
              ))
            )}
          </div>
        )}

        {/* =========================================
            CONTEÚDO DA ABA: PERFIL
        ========================================= */}
        {activeTab === 'perfil' && (
          <div className="space-y-8">
            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
              <h2 className="text-2xl font-bold text-slate-800 mb-6">Informações Pessoais</h2>
              
              <form onSubmit={handleSalvarPerfil}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Nome de Exibição</label>
                    <input 
                      type="text" name="first_name" value={perfil.first_name} onChange={handlePerfilChange} required
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none text-slate-700 bg-slate-50 focus:bg-white transition-all" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">E-mail de Contato</label>
                    <input 
                      type="email" name="email" value={perfil.email} onChange={handlePerfilChange} required
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none text-slate-700 bg-slate-50 focus:bg-white transition-all" 
                    />
                  </div>
                </div>
                <div className="flex justify-end">
                  <button type="submit" className="px-8 py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-full shadow-md transition-all">
                    Salvar Alterações
                  </button>
                </div>
              </form>
            </div>

            {/* Zona de Perigo (LGPD / Exclusão) */}
            <div className="bg-red-50 border border-red-200 p-8 rounded-3xl">
              <h3 className="text-xl font-bold text-red-700 mb-2">Zona de Perigo</h3>
              <p className="text-red-600/80 mb-6 max-w-xl">
                Ao excluir sua conta, todos os seus dados, histórico de inscrições e acessos serão apagados permanentemente. Isso não pode ser desfeito.
              </p>
              <button 
                onClick={handleExcluirConta}
                className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-colors shadow-sm"
              >
                Excluir minha conta permanentemente
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
