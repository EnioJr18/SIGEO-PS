import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, CheckCircle } from 'lucide-react';

export default function Cadastro({ onSubmit, registerError, registerSuccess }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'comum',
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localError, setLocalError] = useState('');

  const handleChange = (event) => {
    let { name, value } = event.target;

    // UX: Remove espaços automaticamente no username
    if (name === 'username') {
      value = value.replace(/\s/g, '');
    }

    setForm((current) => ({ ...current, [name]: value }));
    setLocalError('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (form.username.includes(' ')) {
      setLocalError('O nome de usuário não pode conter espaços. Ex: Entony_QA');
      return;
    }

    if (form.password !== form.confirmPassword) {
      setLocalError('As senhas não coincidem.');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(form);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-emerald-900 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl p-8 md:p-10">
        
        {/* Cabeçalho */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Criar conta</h2>
          <p className="text-slate-500 mt-2 text-sm">Cadastre-se para participar da rede SIGEO</p>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="space-y-5">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Usuário</label>
              <input
                name="username" type="text" value={form.username} onChange={handleChange} required placeholder="seu.usuario" autoComplete="username"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-slate-700 bg-slate-50 focus:bg-white"
              />
            </div>
            
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">E-mail</label>
              <input
                name="email" type="email" value={form.email} onChange={handleChange} required placeholder="voce@email.com" autoComplete="email"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-slate-700 bg-slate-50 focus:bg-white"
              />
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-slate-700 mb-2">Tipo de conta</label>
              <select
                name="role" value={form.role} onChange={handleChange} required
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-slate-700 bg-slate-50 focus:bg-white cursor-pointer"
              >
                <option value="comum">Participante (Quero me voluntariar)</option>
                <option value="organizador">Organizador (Quero criar eventos)</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Senha</label>
              <input
                name="password" type="password" value={form.password} onChange={handleChange} required placeholder="Crie uma senha" minLength="6"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-slate-700 bg-slate-50 focus:bg-white"
              />
            </div>
            
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Confirmar senha</label>
              <input
                name="confirmPassword" type="password" value={form.confirmPassword} onChange={handleChange} required placeholder="Repita a senha" minLength="6"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-slate-700 bg-slate-50 focus:bg-white"
              />
            </div>
          </div>

          {/* Avisos de Erro / Sucesso */}
          {(localError || registerError) && (
            <div className="p-4 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm font-medium flex items-start gap-2">
              <AlertTriangle aria-hidden="true" className="w-5 h-5 shrink-0" />
              {localError || registerError}
            </div>
          )}
          {registerSuccess && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-sm font-medium flex items-start gap-2">
              <CheckCircle aria-hidden="true" className="w-5 h-5 shrink-0" />
              {registerSuccess}
            </div>
          )}

          <button 
            type="submit" 
            disabled={isSubmitting} 
            className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-md transition-all disabled:opacity-70 mt-2"
          >
            {isSubmitting ? 'Criando conta...' : 'Criar minha conta'}
          </button>
        </form>

        {/* Links de Rodapé */}
        <div className="mt-8 text-center space-y-4">
          <p className="text-slate-500 text-sm">
            Já tem uma conta?{' '}
            <button onClick={() => navigate('/login')} className="text-emerald-600 font-bold hover:underline">
              Entrar
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
