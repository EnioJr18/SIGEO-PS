import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, BarChart3, CalendarDays, ClipboardList, Star, Users } from 'lucide-react';
import { getImpactoSocial } from '../api';
import Button from '../components/ui/Button.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';
import LoadingState from '../components/ui/LoadingState.jsx';

const categoryLabels = {
  saude: 'Saúde',
  educacao: 'Educação',
  cultura: 'Cultura',
  esporte: 'Esporte',
  assistencia_social: 'Assistência Social',
  meio_ambiente: 'Meio Ambiente',
  tecnologia: 'Tecnologia',
  causa_animal: 'Causa Animal',
  outro: 'Outro',
};

function MetricCard({ icon: Icon, label, value, tone = 'emerald', helper }) {
  const toneClass = {
    emerald: 'bg-emerald-50 text-emerald-700',
    blue: 'bg-blue-50 text-blue-700',
    amber: 'bg-amber-50 text-amber-700',
    slate: 'bg-slate-100 text-slate-700',
  }[tone];

  return (
    <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
      <div className="mb-5 flex items-center justify-between gap-4">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-500">{label}</span>
        <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${toneClass}`}>
          <Icon aria-hidden="true" className="h-5 w-5" />
        </div>
      </div>
      <p className="text-4xl font-extrabold text-slate-900">{value}</p>
      {helper && <p className="mt-2 text-sm font-medium text-slate-500">{helper}</p>}
    </div>
  );
}

export default function DashboardImpacto() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;

    getImpactoSocial()
      .then((payload) => {
        if (mounted) setData(payload);
      })
      .catch((err) => {
        if (mounted) setError(err.message || 'Não foi possível carregar os dados de impacto.');
      })
      .finally(() => {
        if (mounted) setIsLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const categorias = data?.categorias || [];
  const proximosEventos = data?.proximos_eventos || [];
  const hasAnyData = data && (
    data.total_projetos > 0 ||
    data.total_inscricoes_confirmadas > 0 ||
    categorias.length > 0
  );

  return (
    <div className="min-h-screen bg-slate-50 py-12 md:py-16">
      <div className="container mx-auto max-w-6xl px-4">
        <div className="mb-10 rounded-3xl bg-gradient-to-r from-slate-900 to-blue-900 p-6 text-white shadow-lg md:p-8">
          <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-bold text-blue-100">
            <BarChart3 aria-hidden="true" className="h-4 w-4" />
            Dados reais do sistema
          </span>
          <h1 className="mb-2 text-3xl font-extrabold tracking-tight md:text-5xl">
            Impacto Social
          </h1>
          <p className="max-w-2xl text-lg text-blue-100">
            Visão geral de projetos, inscrições, participantes e avaliações registradas no SIGEO-PS.
          </p>
        </div>

        {isLoading ? (
          <LoadingState text="Carregando dados de impacto..." />
        ) : error ? (
          <EmptyState
            icon={BarChart3}
            title="Não foi possível carregar o impacto"
            description={error}
          />
        ) : !hasAnyData ? (
          <EmptyState
            icon={ClipboardList}
            title="Ainda não há dados de impacto"
            description="Quando projetos e inscrições forem registrados, os indicadores aparecerão aqui."
          />
        ) : (
          <>
            <div className="mb-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              <MetricCard icon={ClipboardList} label="Projetos sociais" value={data.total_projetos} tone="emerald" />
              <MetricCard icon={Users} label="Inscrições confirmadas" value={data.total_inscricoes_confirmadas} tone="blue" />
              <MetricCard icon={Users} label="Participantes únicos" value={data.participantes_unicos} tone="slate" />
              <MetricCard
                icon={Star}
                label="Avaliação média"
                value={data.media_avaliacao ?? '-'}
                tone="amber"
                helper={`${data.total_avaliacoes || 0} avaliações`}
              />
            </div>

            <div className="mb-10 grid grid-cols-1 gap-8 lg:grid-cols-2">
              <section className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm md:p-8">
                <h2 className="mb-6 flex items-center gap-3 text-2xl font-bold text-slate-900">
                  <BarChart3 aria-hidden="true" className="h-6 w-6 text-blue-600" />
                  Distribuição por categoria
                </h2>
                {categorias.length === 0 ? (
                  <p className="text-sm text-slate-500">Nenhuma categoria registrada ainda.</p>
                ) : (
                  <div className="space-y-5">
                    {categorias.map((item) => (
                      <div key={item.categoria}>
                        <div className="mb-2 flex items-end justify-between gap-3">
                          <span className="font-bold text-slate-700">
                            {categoryLabels[item.categoria] || item.categoria}
                          </span>
                          <span className="text-sm font-bold text-slate-400">{item.total} projetos</span>
                        </div>
                        <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                          <div
                            className="h-full rounded-full bg-blue-500"
                            style={{ width: `${Math.max(item.percentual, 8)}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              <section className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm md:p-8">
                <h2 className="mb-6 flex items-center gap-3 text-2xl font-bold text-slate-900">
                  <CalendarDays aria-hidden="true" className="h-6 w-6 text-emerald-600" />
                  Próximos projetos
                </h2>
                {proximosEventos.length === 0 ? (
                  <p className="text-sm text-slate-500">Nenhum projeto futuro publicado no momento.</p>
                ) : (
                  <div className="space-y-3">
                    {proximosEventos.map((evento) => (
                      <div key={evento.id} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                        <p className="font-extrabold text-slate-800">{evento.titulo}</p>
                        <p className="mt-1 text-sm text-slate-500">
                          {new Date(evento.data_hora).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </div>
          </>
        )}

        <div className="text-center">
          <Button onClick={() => navigate('/')} variant="ghost" size="lg" className="bg-slate-900 text-white hover:bg-slate-800">
            <ArrowLeft aria-hidden="true" className="h-5 w-5" />
            Voltar para o início
          </Button>
        </div>
      </div>
    </div>
  );
}
