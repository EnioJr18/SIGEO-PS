import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  BarChart3,
  CalendarDays,
  ClipboardList,
  MapPin,
  PieChart,
  Star,
  TrendingUp,
  Users,
} from 'lucide-react';
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

function formatNumber(value) {
  return Number(value || 0).toLocaleString('pt-BR');
}

function formatRating(value) {
  if (value === null || value === undefined) {
    return 'Sem avaliações';
  }

  return Number(value).toLocaleString('pt-BR', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });
}

function formatDate(value) {
  if (!value) {
    return 'Data não informada';
  }

  return new Date(value).toLocaleString('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  });
}

function MetricCard({ icon: Icon, label, value, tone = 'emerald', helper }) {
  const toneClass = {
    emerald: 'border-emerald-400/20 bg-emerald-400/10 text-emerald-200',
    blue: 'border-blue-400/20 bg-blue-400/10 text-blue-200',
    amber: 'border-amber-400/20 bg-amber-400/10 text-amber-200',
    slate: 'border-slate-400/20 bg-slate-400/10 text-slate-200',
  }[tone];

  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.06] p-6 shadow-xl shadow-slate-950/10 transition-all hover:-translate-y-0.5 hover:bg-white/[0.08]">
      <div className="mb-5 flex items-center justify-between gap-4">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">{label}</span>
        <div className={`flex h-11 w-11 items-center justify-center rounded-2xl border ${toneClass}`}>
          <Icon aria-hidden="true" className="h-5 w-5" />
        </div>
      </div>
      <p className="text-4xl font-extrabold tracking-tight text-white">{value}</p>
      {helper && <p className="mt-2 text-sm font-medium text-slate-400">{helper}</p>}
    </div>
  );
}

function CategoryChart({ categorias }) {
  const totalCategorias = categorias.reduce((sum, item) => sum + Number(item.total || 0), 0);
  const maxCategoria = Math.max(...categorias.map((item) => Number(item.total || 0)), 0);

  if (categorias.length === 0 || totalCategorias === 0) {
    return (
      <EmptyState
        icon={PieChart}
        title="Sem categorias registradas"
        description="Quando houver projetos cadastrados, a distribuição por categoria aparecerá aqui."
      />
    );
  }

  return (
    <div className="space-y-5">
      {categorias.map((item) => {
        const total = Number(item.total || 0);
        const percentOfTotal = totalCategorias ? Math.round((total / totalCategorias) * 100) : 0;
        const barWidth = maxCategoria ? Math.max((total / maxCategoria) * 100, total > 0 ? 8 : 0) : 0;
        const label = categoryLabels[item.categoria] || item.categoria || 'Outro';

        return (
          <div key={item.categoria || label}>
            <div className="mb-2 flex flex-wrap items-end justify-between gap-2">
              <span className="max-w-full text-sm font-bold text-slate-100">{label}</span>
              <span className="text-xs font-semibold text-slate-400">
                {formatNumber(total)} projetos • {percentOfTotal}%
              </span>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-slate-800" aria-label={`${label}: ${formatNumber(total)} projetos, ${percentOfTotal}% do total`}>
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-blue-400"
                style={{ width: `${barWidth}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function RatingsBlock({ media, total }) {
  const rating = Number(media || 0);
  const totalAvaliacoes = Number(total || 0);
  const percent = Math.min(Math.max((rating / 5) * 100, 0), 100);

  return (
    <section className="rounded-3xl border border-white/10 bg-white/[0.06] p-6 shadow-xl shadow-slate-950/10 md:p-8 lg:col-span-2">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h2 className="flex items-center gap-3 text-2xl font-bold text-white">
            <Star aria-hidden="true" className="h-6 w-6 text-amber-300" />
            Avaliações
          </h2>
          <p className="mt-2 text-sm text-slate-400">Média calculada a partir das avaliações registradas.</p>
        </div>
        <span className="rounded-full border border-amber-300/20 bg-amber-300/10 px-3 py-1 text-xs font-bold text-amber-200">
          {formatNumber(totalAvaliacoes)} no total
        </span>
      </div>

      {totalAvaliacoes === 0 ? (
        <p className="rounded-2xl border border-white/10 bg-slate-950/40 p-4 text-sm font-medium text-slate-300">
          Ainda não há avaliações suficientes.
        </p>
      ) : (
        <div>
          <div className="mb-4 flex items-end gap-3">
            <strong className="text-5xl font-extrabold tracking-tight text-white">{formatRating(media)}</strong>
            <span className="pb-2 text-sm font-semibold text-slate-400">de 5</span>
          </div>
          <div className="mb-3 flex gap-1" aria-label={`Avaliação média ${formatRating(media)} de 5`}>
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                aria-hidden="true"
                className={`h-5 w-5 ${rating >= star ? 'fill-amber-300 text-amber-300' : 'text-slate-600'}`}
              />
            ))}
          </div>
          <div className="h-3 overflow-hidden rounded-full bg-slate-800">
            <div className="h-full rounded-full bg-gradient-to-r from-amber-300 to-emerald-300" style={{ width: `${percent}%` }} />
          </div>
        </div>
      )}
    </section>
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
  const totalAvaliacoes = Number(data?.total_avaliacoes || 0);
  const hasAnyData = data && (
    Number(data.total_projetos || 0) > 0 ||
    Number(data.total_inscricoes_confirmadas || 0) > 0 ||
    Number(data.participantes_unicos || 0) > 0 ||
    totalAvaliacoes > 0 ||
    categorias.length > 0 ||
    proximosEventos.length > 0
  );

  return (
    <div className="min-h-screen bg-slate-950 py-12 text-slate-100 md:py-16">
      <div className="container mx-auto max-w-6xl px-4">
        <div className="mb-10 rounded-3xl border border-white/10 bg-gradient-to-r from-slate-900 via-blue-950 to-emerald-950 p-6 text-white shadow-2xl shadow-slate-950/40 md:p-8">
          <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-bold text-emerald-100">
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
            <div className="mb-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5">
              <MetricCard
                icon={ClipboardList}
                label="Projetos sociais"
                value={formatNumber(data.total_projetos)}
                tone="emerald"
                helper="Iniciativas cadastradas"
              />
              <MetricCard
                icon={Users}
                label="Inscrições confirmadas"
                value={formatNumber(data.total_inscricoes_confirmadas)}
                tone="blue"
                helper="Participações confirmadas"
              />
              <MetricCard
                icon={Users}
                label="Participantes únicos"
                value={formatNumber(data.participantes_unicos)}
                tone="slate"
                helper="Pessoas alcançadas"
              />
              <MetricCard
                icon={Star}
                label="Avaliação média"
                value={formatRating(data.media_avaliacao)}
                tone="amber"
                helper={`${formatNumber(totalAvaliacoes)} avaliações`}
              />
              <MetricCard
                icon={TrendingUp}
                label="Eventos realizados"
                value={formatNumber(data.eventos_realizados)}
                tone="emerald"
                helper="Projetos já ocorridos"
              />
            </div>

            <div className="mb-10 grid grid-cols-1 gap-8 lg:grid-cols-5">
              <section className="rounded-3xl border border-white/10 bg-white/[0.06] p-6 shadow-xl shadow-slate-950/10 md:p-8 lg:col-span-3">
                <div className="mb-6">
                  <h2 className="flex items-center gap-3 text-2xl font-bold text-white">
                    <PieChart aria-hidden="true" className="h-6 w-6 text-blue-300" />
                    Distribuição por categoria
                  </h2>
                  <p className="mt-2 text-sm text-slate-400">Participação de cada categoria no conjunto de projetos cadastrados.</p>
                </div>
                <CategoryChart categorias={categorias} />
              </section>

              <RatingsBlock media={data.media_avaliacao} total={totalAvaliacoes} />
            </div>

            <section className="mb-10 rounded-3xl border border-white/10 bg-white/[0.06] p-6 shadow-xl shadow-slate-950/10 md:p-8">
              <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h2 className="flex items-center gap-3 text-2xl font-bold text-white">
                    <CalendarDays aria-hidden="true" className="h-6 w-6 text-emerald-300" />
                  Próximos projetos
                  </h2>
                  <p className="mt-2 text-sm text-slate-400">Projetos futuros publicados no sistema.</p>
                </div>
                <span className="text-sm font-semibold text-slate-400">{formatNumber(proximosEventos.length)} listados</span>
              </div>
              {proximosEventos.length === 0 ? (
                <EmptyState
                  icon={CalendarDays}
                  title="Nenhum projeto futuro"
                  description="Quando novos projetos forem publicados, eles aparecerão nesta área."
                />
              ) : (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {proximosEventos.map((evento) => (
                    <article key={evento.id} className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">
                      <div className="mb-3 flex flex-wrap items-center gap-2">
                        <span className="rounded-full border border-emerald-300/20 bg-emerald-300/10 px-2.5 py-1 text-xs font-bold text-emerald-200">
                          {categoryLabels[evento.categoria] || evento.categoria || 'Outro'}
                        </span>
                        <span className="text-xs font-semibold text-slate-400">{formatDate(evento.data_hora)}</span>
                      </div>
                      <h3 className="text-base font-extrabold text-white">{evento.titulo || 'Projeto sem título'}</h3>
                      {evento.endereco_texto && (
                        <p className="mt-3 flex items-start gap-2 text-sm text-slate-400">
                          <MapPin aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-blue-300" />
                          <span>{evento.endereco_texto}</span>
                        </p>
                      )}
                    </article>
                  ))}
                </div>
              )}
            </section>
          </>
        )}

        <div className="text-center">
          <Button onClick={() => navigate('/')} variant="ghost" size="lg" className="bg-white/10 text-white hover:bg-white/15">
            <ArrowLeft aria-hidden="true" className="h-5 w-5" />
            Voltar para o início
          </Button>
        </div>
      </div>
    </div>
  );
}
