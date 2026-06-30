import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function DashboardImpacto() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 py-16">
      <div className="container mx-auto px-4 max-w-6xl">
        
        {/* Cabeçalho do Dashboard */}
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-5xl font-extrabold text-slate-900 tracking-tight mb-4">
            Módulo de Impacto Social
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Visão geral do engajamento e transformação nas comunidades (Visão Estratégica)
          </p>
        </div>

        {/* Cartões de Métricas Principais */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          
          {/* Card 1: Voluntários */}
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 relative overflow-hidden group hover:shadow-md transition-shadow">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-500"></div>
            <h3 className="text-slate-500 font-bold uppercase tracking-wider text-xs mb-2">Voluntários Ativos</h3>
            <p className="text-4xl font-extrabold text-slate-900 mb-2">1.248</p>
            <div className="flex items-center gap-1.5 text-sm font-semibold text-emerald-600 bg-emerald-50 w-fit px-2.5 py-1 rounded-full">
              <span>↑</span> 12% este mês
            </div>
          </div>

          {/* Card 2: Ações */}
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 relative overflow-hidden group hover:shadow-md transition-shadow">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-emerald-500"></div>
            <h3 className="text-slate-500 font-bold uppercase tracking-wider text-xs mb-2">Ações Concluídas</h3>
            <p className="text-4xl font-extrabold text-slate-900 mb-2">342</p>
            <div className="flex items-center gap-1.5 text-sm font-semibold text-emerald-600 bg-emerald-50 w-fit px-2.5 py-1 rounded-full">
              <span>↑</span> 8% este mês
            </div>
          </div>

          {/* Card 3: Vidas */}
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 relative overflow-hidden group hover:shadow-md transition-shadow">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-violet-500"></div>
            <h3 className="text-slate-500 font-bold uppercase tracking-wider text-xs mb-2">Vidas Impactadas (Est.)</h3>
            <p className="text-4xl font-extrabold text-slate-900 mb-2">+15k</p>
            <div className="flex items-center gap-1.5 text-sm font-medium text-slate-400">
              Baseado em relatórios
            </div>
          </div>

        </div>

        {/* Seção de Rankings e Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          
          {/* Ranking de Cidades */}
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
            <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3">
              <span className="text-3xl" aria-hidden="true">🏆</span> 
              Ranking Cidades Solidárias
            </h2>
            
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-slate-200 transition-colors">
                <div className="flex items-center gap-4">
                  <span className="text-3xl drop-shadow-sm">🥇</span>
                  <span className="font-extrabold text-slate-800 text-lg">Maceió</span>
                </div>
                <span className="bg-blue-100 text-blue-800 px-4 py-1.5 rounded-full text-sm font-bold shadow-sm">
                  84 eventos
                </span>
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-slate-200 transition-colors">
                <div className="flex items-center gap-4">
                  <span className="text-3xl drop-shadow-sm">🥈</span>
                  <span className="font-extrabold text-slate-800 text-lg">Arapiraca</span>
                </div>
                <span className="bg-blue-100 text-blue-800 px-4 py-1.5 rounded-full text-sm font-bold shadow-sm">
                  56 eventos
                </span>
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-slate-200 transition-colors">
                <div className="flex items-center gap-4">
                  <span className="text-3xl drop-shadow-sm">🥉</span>
                  <span className="font-extrabold text-slate-800 text-lg">São Miguel dos Campos</span>
                </div>
                <span className="bg-blue-100 text-blue-800 px-4 py-1.5 rounded-full text-sm font-bold shadow-sm">
                  42 eventos
                </span>
              </div>
            </div>
          </div>

          {/* Categorias Mais Atendidas */}
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
            <h2 className="text-2xl font-bold text-slate-900 mb-8 flex items-center gap-3">
              <span className="text-3xl" aria-hidden="true">📊</span> 
              Categorias em Destaque
            </h2>
            
            <div className="flex flex-col gap-8">
              {/* Educação */}
              <div>
                <div className="flex justify-between items-end mb-2">
                  <span className="font-bold text-slate-700">Educação</span>
                  <span className="font-bold text-slate-400 text-sm">45%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden shadow-inner">
                  <div className="bg-blue-500 h-full rounded-full transition-all duration-1000 ease-out" style={{ width: '45%' }}></div>
                </div>
              </div>

              {/* Assistência Social */}
              <div>
                <div className="flex justify-between items-end mb-2">
                  <span className="font-bold text-slate-700">Assistência Social</span>
                  <span className="font-bold text-slate-400 text-sm">30%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden shadow-inner">
                  <div className="bg-orange-500 h-full rounded-full transition-all duration-1000 ease-out" style={{ width: '30%' }}></div>
                </div>
              </div>

              {/* Saúde */}
              <div>
                <div className="flex justify-between items-end mb-2">
                  <span className="font-bold text-slate-700">Saúde</span>
                  <span className="font-bold text-slate-400 text-sm">15%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden shadow-inner">
                  <div className="bg-red-500 h-full rounded-full transition-all duration-1000 ease-out" style={{ width: '15%' }}></div>
                </div>
              </div>
            </div>
          </div>

        </div>
        
        {/* Ação de Voltar */}
        <div className="text-center">
          <button 
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 px-8 rounded-full shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all"
          >
            <ArrowLeft aria-hidden="true" className="w-5 h-5" />
            Voltar para o Início
          </button>
        </div>

      </div>
    </div>
  );
}
