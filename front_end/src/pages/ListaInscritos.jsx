import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, Mail, Users } from 'lucide-react';
import { getInscricoesRecebidas } from '../api';
import Button from '../components/ui/Button.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';
import LoadingState from '../components/ui/LoadingState.jsx';

const statusStyles = {
  confirmada: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  confirmado: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  pendente: 'bg-amber-50 text-amber-700 border-amber-200',
  cancelada: 'bg-red-50 text-red-700 border-red-200',
};

function StatusBadge({ status }) {
  const normalizedStatus = String(status || 'confirmada').toLowerCase();
  const label = status || 'Confirmado';

  return (
    <span className={`inline-flex items-center gap-1.5 py-1 px-3 rounded-full text-xs font-bold border ${statusStyles[normalizedStatus] || statusStyles.confirmada}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current" aria-hidden="true" />
      {label}
    </span>
  );
}

const ListaInscritos = () => {
  const { id } = useParams(); // Pega o ID do evento na URL
  const navigate = useNavigate();
  const [inscritos, setInscritos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const carregarInscritos = async () => {
      try {
        const dados = await getInscricoesRecebidas();
        // Filtra apenas as inscrições que pertencem a este evento específico
        const inscritosNesteEvento = dados.filter(inscricao => String(inscricao.evento) === String(id));
        setInscritos(inscritosNesteEvento);
      } catch (error) {
        console.error("Erro ao carregar lista:", error);
      } finally {
        setLoading(false);
      }
    };
    carregarInscritos();
  }, [id]);

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="mb-6 rounded-3xl bg-gradient-to-r from-slate-900 to-blue-900 p-6 md:p-8 text-white shadow-lg">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/15 px-3 py-1 text-xs font-bold text-blue-100 mb-4">
                <Users aria-hidden="true" className="w-4 h-4" />
                Lista do projeto
              </span>
              <h2 className="text-2xl md:text-3xl font-extrabold">Voluntários Inscritos</h2>
              <p className="text-sm md:text-base text-blue-100 mt-2 max-w-2xl">Acompanhe participantes confirmados neste projeto.</p>
            </div>
            <Button onClick={() => navigate(-1)} variant="secondary" size="md" className="bg-white text-slate-800 hover:bg-blue-50">
              Voltar
            </Button>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-4 sm:p-6">
          <div className="flex items-center justify-between gap-4 mb-6">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total de inscritos</p>
              <strong className="text-3xl font-extrabold text-slate-900">{inscritos.length}</strong>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <Users aria-hidden="true" className="w-6 h-6" />
            </div>
          </div>

      {loading ? (
        <LoadingState text="Carregando inscritos..." />
      ) : inscritos.length === 0 ? (
        <EmptyState
          icon={Users}
          title="Nenhum participante inscrito"
          description="Ainda não há voluntários inscritos neste projeto."
          className="bg-slate-50 border-dashed shadow-none"
        />
      ) : (
        <>
        <div className="grid gap-3 md:hidden">
          {inscritos.map((insc) => (
            <div key={insc.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-lg shrink-0">
                  {insc.participante_nome ? insc.participante_nome.charAt(0).toUpperCase() : 'V'}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-slate-800 font-bold truncate">
                    {insc.participante_nome || `Inscrição #${insc.id}`}
                  </p>
                  <p className="text-slate-500 text-sm flex items-center gap-1.5 mt-1 truncate">
                    <Mail aria-hidden="true" className="w-4 h-4 shrink-0" />
                    {insc.participante_email || 'E-mail não informado'}
                  </p>
                  <p className="text-slate-500 text-sm flex items-center gap-1.5 mt-1">
                    <Calendar aria-hidden="true" className="w-4 h-4 shrink-0" />
                    {new Date(insc.data_inscricao).toLocaleDateString('pt-BR')}
                  </p>
                  <div className="mt-3">
                    <StatusBadge status={insc.status} />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="hidden md:block overflow-x-auto rounded-2xl border border-slate-200">
         <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="p-4 font-bold text-slate-600 text-sm uppercase tracking-wider">Voluntário</th>
                <th className="p-4 font-bold text-slate-600 text-sm uppercase tracking-wider hidden sm:table-cell">E-mail de contato</th>
                <th className="p-4 font-bold text-slate-600 text-sm uppercase tracking-wider text-center">Data</th>
                <th className="p-4 font-bold text-slate-600 text-sm uppercase tracking-wider text-right">Status</th>
              </tr>
            </thead>
            <tbody>
              {inscritos.map((insc, index) => (
                <tr key={index} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                  
                  {/* Coluna: Nome do Voluntário */}
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-lg">
                        {/* Pega a primeira letra, ou 'V' se não tiver */}
                        {insc.participante_nome ? insc.participante_nome.charAt(0).toUpperCase() : 'V'}
                      </div>
                      <div>
                        <p className="text-slate-800 font-bold">
                          {insc.participante_nome || `Inscrição #${insc.id}`}
                        </p>
                        <p className="text-slate-500 text-sm sm:hidden">
                          {insc.participante_email || 'E-mail não informado'}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Coluna: E-mail */}
                  <td className="p-4 text-slate-600 hidden sm:table-cell">
                    {insc.participante_email || 'Não informado'}
                  </td>

                  {/* Coluna: Data */}
                  <td className="p-4 text-slate-500 text-center">
                    {new Date(insc.data_inscricao).toLocaleDateString('pt-BR')}
                  </td>

                  {/* Coluna: Status */}
                  <td className="p-4 text-right">
                    <StatusBadge status={insc.status} />
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>
        </>
      )}
        </div>
      </div>
    </div>
  );
};

export default ListaInscritos;
