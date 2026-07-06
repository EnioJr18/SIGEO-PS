import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ClipboardList, Edit3, Plus, Trash2, Users } from 'lucide-react';
import { getInscricoesRecebidas, deleteEvento } from '../api';
import Button from '../components/ui/Button.jsx';
import ConfirmDialog from '../components/ui/ConfirmDialog.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';
import LoadingState from '../components/ui/LoadingState.jsx';

export default function PainelOrganizador({ eventos, onEventosChanged }) {
  const [inscricoes, setInscricoes] = useState(null);
  const [eventoParaExcluir, setEventoParaExcluir] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [erroAcao, setErroAcao] = useState('');
  const navigate = useNavigate();

  // Verifica se tem token.
  const isAuthenticated = !!localStorage.getItem('accessToken') || !!localStorage.getItem('token');

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login'); // Expulsa quem não está logado
      return;
    }

    getInscricoesRecebidas()
      .then(data => {
        setInscricoes(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        setInscricoes([]);
      });
  }, [isAuthenticated, navigate]);

  // Enquanto carrega
  if (inscricoes === null) {
    return (
      <div className="min-h-screen bg-slate-50 flex justify-center items-center">
        <LoadingState text="Carregando painel..." />
      </div>
    );
  }

  // Agrupa os IDs para saber quantas pessoas estão em cada evento
  const contagemPorEvento = inscricoes.reduce((acc, inscricao) => {
    acc[inscricao.evento] = (acc[inscricao.evento] || 0) + 1;
    return acc;
  }, {});
  const totalProjetos = Object.keys(contagemPorEvento).length;
  const totalInscritos = inscricoes.length;

  const handleConfirmarExclusao = async () => {
    if (!eventoParaExcluir) return;

    setIsDeleting(true);
    setErroAcao('');

    try {
      await deleteEvento(eventoParaExcluir.id);
      await onEventosChanged?.();
      setInscricoes((current) => (
        Array.isArray(current)
          ? current.filter((inscricao) => String(inscricao.evento) !== String(eventoParaExcluir.id))
          : current
      ));
      setEventoParaExcluir(null);
    } catch (error) {
      setErroAcao(error.message || "Não foi possível excluir o projeto.");
      setEventoParaExcluir(null);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="container mx-auto px-4 max-w-6xl">
        
        {/* Cabeçalho do Dashboard */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-6 rounded-3xl bg-gradient-to-r from-slate-900 to-emerald-900 p-6 md:p-8 text-white shadow-lg">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/15 px-3 py-1 text-xs font-bold text-emerald-100 mb-4">
              <ClipboardList aria-hidden="true" className="w-4 h-4" />
              Dashboard do organizador
            </span>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-2">
              Painel de Gestão
            </h1>
            <p className="text-lg text-emerald-100 max-w-2xl">
              Gerencie seus projetos sociais e acompanhe os voluntários inscritos.
            </p>
          </div>
          <Button
            onClick={() => navigate('/criar-evento')}
            size="lg"
            className="whitespace-nowrap bg-white text-emerald-900 hover:bg-emerald-50"
          >
            <Plus aria-hidden="true" className="w-5 h-5" />
            Novo Projeto
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Projetos com inscrições</span>
              <ClipboardList aria-hidden="true" className="w-5 h-5 text-emerald-600" />
            </div>
            <strong className="text-3xl font-extrabold text-slate-900">{totalProjetos}</strong>
          </div>
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Inscritos recebidos</span>
              <Users aria-hidden="true" className="w-5 h-5 text-blue-600" />
            </div>
            <strong className="text-3xl font-extrabold text-slate-900">{totalInscritos}</strong>
          </div>
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Ação principal</span>
              <Plus aria-hidden="true" className="w-5 h-5 text-emerald-600" />
            </div>
            <button onClick={() => navigate('/criar-evento')} className="text-emerald-600 font-bold hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded">
              Publicar novo projeto
            </button>
          </div>
        </div>

        {erroAcao && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-600" role="alert">
            {erroAcao}
          </div>
        )}

        {/* Estado Vazio (Sem projetos ainda) */}
        {Object.keys(contagemPorEvento).length === 0 ? (
          <EmptyState
            icon={ClipboardList}
            title="Nenhum projeto ativo"
            description="Você ainda não recebeu inscrições ou não possui projetos ativos no momento. Que tal cadastrar uma nova iniciativa?"
            action={(
              <Button onClick={() => navigate('/criar-evento')}>
                Criar meu primeiro projeto &rarr;
              </Button>
            )}
          />
        ) : (
          /* Tabela/Lista de Projetos */
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            
            {/* Cabeçalho da Tabela (Some no mobile) */}
            <div className="hidden md:grid grid-cols-12 gap-4 bg-slate-100 p-4 font-bold text-slate-600 text-sm uppercase tracking-wider border-b border-slate-200">
              <div className="col-span-6">Projeto</div>
              <div className="col-span-2 text-center">Inscritos</div>
              <div className="col-span-4 text-center">Ações rápidas</div>
            </div>

            {/* Linhas de Dados */}
            <div className="divide-y divide-slate-100">
              {Object.entries(contagemPorEvento).map(([eventoId, total]) => {
                const eventoOriginal = eventos.find(e => String(e.id) === String(eventoId));
                const titulo = eventoOriginal ? eventoOriginal.titulo : `Projeto #${eventoId}`;
                const categoria = eventoOriginal ? eventoOriginal.categoria : `Geral`;
                
                return (
                  <div key={eventoId} className="grid grid-cols-1 md:grid-cols-12 gap-4 p-5 md:p-4 items-center hover:bg-slate-50 transition-colors">
                    
                    {/* Info do Projeto */}
                    <div className="col-span-6 flex flex-col items-start gap-1">
                      <span className="bg-emerald-100 text-emerald-800 text-[0.65rem] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                        {categoria}
                      </span>
                      <strong className="text-lg font-bold text-slate-800 leading-tight">
                        {titulo}
                      </strong>
                    </div>

                    {/* Contagem (Responsivo) */}
                    <div className="col-span-6 md:col-span-2 flex items-center md:justify-center mt-2 md:mt-0">
                      <span className="md:hidden font-bold text-slate-500 text-sm mr-2">Inscritos:</span>
                      <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-4 py-1.5 rounded-full font-bold text-sm shadow-sm flex items-center gap-2">
                        <Users aria-hidden="true" className="w-4 h-4" /> {total}
                      </span>
                    </div>

                    {/* Botões de Ação */}
                    <div className="col-span-12 md:col-span-4 flex items-center gap-2 mt-4 md:mt-0 justify-start md:justify-center">
                      <Button
                        onClick={() => navigate(`/painel/lista/${eventoId}`)}
                        size="sm"
                        className="flex-1 md:flex-none bg-slate-900 hover:bg-slate-800"
                      >
                        <Users aria-hidden="true" className="w-3.5 h-3.5" />
                        Ver inscritos
                      </Button>
                      <Button
                        onClick={() => navigate(`/editar-evento/${eventoId}`)}
                        variant="secondary"
                        size="sm"
                        className="flex-1 md:flex-none"
                      >
                        <Edit3 aria-hidden="true" className="w-3.5 h-3.5" />
                        Editar
                      </Button>
                      <Button
                        onClick={() => setEventoParaExcluir({ id: eventoId, titulo })}
                        variant="secondary"
                        size="sm"
                        className="border-red-200 hover:bg-red-50 text-red-600"
                        aria-label={`Excluir projeto ${titulo}`}
                      >
                        <Trash2 aria-hidden="true" className="w-4 h-4" />
                      </Button>
                    </div>

                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>
      <ConfirmDialog
        open={Boolean(eventoParaExcluir)}
        title="Excluir projeto?"
        description="Essa ação removerá o projeto e pode afetar inscrições vinculadas."
        confirmLabel="Excluir projeto"
        cancelLabel="Voltar"
        variant="danger"
        isLoading={isDeleting}
        onCancel={() => setEventoParaExcluir(null)}
        onConfirm={handleConfirmarExclusao}
      />
    </div>
  );
}
