import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, CheckCircle, Home } from 'lucide-react';

export default function Login({ onSubmit, loginError, loginSuccess }) {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit({ identifier, password });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-emerald-900 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl p-8 md:p-10">
        
        {/* Cabeçalho do Card */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <span className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center">
              <Home aria-hidden="true" className="w-7 h-7" />
            </span>
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Bem-vindo de volta</h2>
          <p className="text-slate-500 mt-2 text-sm">Entre para acompanhar projetos perto de você</p>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">E-mail ou usuário</label>
            <input
              type="text"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="você@email.com"
              autoComplete="username"
              required
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all text-slate-700 bg-slate-50 focus:bg-white"
            />
          </div>
          
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Senha</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Digite sua senha"
              autoComplete="current-password"
              required
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all text-slate-700 bg-slate-50 focus:bg-white"
            />
          </div>

          {/* Feedbacks de Erro e Sucesso */}
          {loginError && (
            <div className="p-4 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm font-medium flex items-start gap-2">
              <AlertTriangle aria-hidden="true" className="w-5 h-5 shrink-0" />
              {loginError}
            </div>
          )}
          {loginSuccess && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-sm font-medium flex items-start gap-2">
              <CheckCircle aria-hidden="true" className="w-5 h-5 shrink-0" />
              {loginSuccess}
            </div>
          )}

          <button 
            type="submit" 
            disabled={isSubmitting} 
            className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-md transition-all disabled:opacity-70 mt-2"
          >
            {isSubmitting ? 'Entrando...' : 'Entrar na plataforma'}
          </button>
        </form>

        {/* Links de Rodapé */}
        <div className="mt-8 text-center space-y-4">
          <p className="text-slate-500 text-sm">
            Não tem uma conta?{' '}
            <button onClick={() => navigate('/cadastro')} className="text-emerald-600 font-bold hover:underline">
              Criar conta
            </button>
          </p>
          <button onClick={() => navigate('/')} className="text-slate-400 text-sm hover:text-slate-600 transition-colors font-medium">
            &larr; Voltar para o início
          </button>
        </div>

      </div>
    </div>
  );
}
