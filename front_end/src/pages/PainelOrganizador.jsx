import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ClipboardList, Edit3, Plus, Trash2, Users } from 'lucide-react';
import { getInscricoesRecebidas, deleteEvento } from '../api';
import EmptyState from '../components/ui/EmptyState.jsx';
import LoadingState from '../components/ui/LoadingState.jsx';

export default function PainelOrganizador({ eventos }) {
  const [inscricoes, setInscricoes] = useState(null);
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

  // Lógica de Exclusão Segura
  const handleExcluir = async (eventoId, titulo) => {
    const confirmacao = window.confirm(`ATENÇÃO: Tem certeza que deseja excluir o projeto "${titulo}"?\nEssa ação não tem volta e apagará todas as inscrições.`);
    
    if (confirmacao) {
      try {
        await deleteEvento(eventoId);
        // Recarrega a página de forma rápida para atualizar tudo
        window.location.reload();
      } catch (error) {
        alert(error.message || "Não foi possível excluir o evento.");
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="container mx-auto px-4 max-w-6xl">
        
        {/* Cabeçalho do Dashboard */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6 border-b border-slate-200 pb-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight mb-2">
              Painel de Gestão
            </h1>
            <p className="text-lg text-slate-600">
              Gerencie seus projetos sociais e acompanhe os voluntários inscritos.
            </p>
          </div>
          <button 
            onClick={() => navigate('/criar-evento')}
            className="inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 px-6 rounded-xl shadow-md transition-all hover:-translate-y-0.5 whitespace-nowrap"
          >
            <Plus aria-hidden="true" className="w-5 h-5" />
            Novo Projeto
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Projetos com inscrições</span>
              <ClipboardList aria-hidden="true" className="w-5 h-5 text-emerald-600" />
            </div>
            <strong className="text-3xl font-extrabold text-slate-900">{totalProjetos}</strong>
          </div>
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Inscritos recebidos</span>
              <Users aria-hidden="true" className="w-5 h-5 text-blue-600" />
            </div>
            <strong className="text-3xl font-extrabold text-slate-900">{totalInscritos}</strong>
          </div>
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Ação principal</span>
              <Plus aria-hidden="true" className="w-5 h-5 text-emerald-600" />
            </div>
            <button onClick={() => navigate('/criar-evento')} className="text-emerald-600 font-bold hover:underline">
              Publicar novo projeto
            </button>
          </div>
        </div>

        {/* Estado Vazio (Sem projetos ainda) */}
        {Object.keys(contagemPorEvento).length === 0 ? (
          <EmptyState
            icon={ClipboardList}
            title="Nenhum projeto ativo"
            description="Você ainda não recebeu inscrições ou não possui projetos ativos no momento. Que tal cadastrar uma nova iniciativa?"
            action={(
              <button onClick={() => navigate('/criar-evento')} className="text-emerald-600 font-bold hover:underline">
                Criar meu primeiro projeto &rarr;
              </button>
            )}
          />
        ) : (
          /* Tabela/Lista de Projetos */
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            
            {/* Cabeçalho da Tabela (Some no mobile) */}
            <div className="hidden md:grid grid-cols-12 gap-4 bg-slate-100 p-4 font-bold text-slate-600 text-sm uppercase tracking-wider border-b border-slate-200">
              <div className="col-span-6">Projeto</div>
              <div className="col-span-2 text-center">Inscritos</div>
              <div className="col-span-4 text-center">Ações Rápidas</div>
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
                      <button 
                        onClick={() => navigate(`/painel/lista/${eventoId}`)}
                        className="flex-1 md:flex-none px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg transition-colors"
                      >
                        Ver Lista
                      </button>
                      <button 
                        onClick={() => navigate(`/editar-evento/${eventoId}`)}
                        className="flex-1 md:flex-none px-3 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-lg transition-colors inline-flex items-center justify-center gap-1.5"
                      >
                        <Edit3 aria-hidden="true" className="w-3.5 h-3.5" />
                        Editar
                      </button>
                      <button 
                        onClick={() => handleExcluir(eventoId, titulo)}
                        className="px-3 py-2 bg-white border border-red-200 hover:bg-red-50 text-red-600 rounded-lg transition-colors"
                        aria-label="Excluir projeto"
                      >
                        <Trash2 aria-hidden="true" className="w-4 h-4" />
                      </button>
                    </div>

                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
