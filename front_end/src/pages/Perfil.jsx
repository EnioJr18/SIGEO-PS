import { useState, useEffect } from 'react';
import { AlertTriangle, CheckCircle, ShieldCheck, UserRound } from 'lucide-react';
import { getPerfil, updatePerfil, deletePerfil } from '../api';
import Button from '../components/ui/Button.jsx';
import Input from '../components/ui/Input.jsx';
import LoadingState from '../components/ui/LoadingState.jsx';

export default function Perfil() {
  const [loading, setLoading] = useState(true);
  const [mensagem, setMensagem] = useState({ tipo: '', texto: '' });
  const [perfil, setPerfil] = useState({ first_name: '', email: '' });

  const carregarDados = async () => {
    try {
      const dados = await getPerfil();
      setPerfil({
        first_name: dados.first_name || '',
        email: dados.email || ''
      });
    } catch {
      setMensagem({ tipo: 'erro', texto: 'Não foi possível carregar suas informações.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(carregarDados, 0);
    return () => clearTimeout(timer);
  }, []);

  const handlePerfilChange = (e) => {
    setPerfil({ ...perfil, [e.target.name]: e.target.value });
  };

  const handleSalvarPerfil = async (e) => {
    e.preventDefault();
    setMensagem({ tipo: '', texto: '' });
    try {
      await updatePerfil(perfil);
      setMensagem({ tipo: 'sucesso', texto: 'Perfil atualizado com sucesso!' });
      
      // Atualiza o nome no navegador para a Navbar mudar na mesma hora
      localStorage.setItem("userName", perfil.first_name);
      
      // Um pequeno delay e recarregamos a página para o React puxar o nome novo lá em cima
      setTimeout(() => window.location.reload(), 1000);
    } catch {
      setMensagem({ tipo: 'erro', texto: 'Erro ao atualizar o perfil.' });
    }
  };

  const handleExcluirConta = async () => {
    const confirmacao = window.confirm(
      "Tem certeza absoluta? Essa ação apagará todos os seus dados e não pode ser desfeita."
    );
    if (confirmacao) {
      try {
        await deletePerfil();
        // Limpa a memória e joga pra fora do sistema
        localStorage.clear();
        alert("Conta excluída. Esperamos ver você de novo no futuro!");
        window.location.assign('/'); 
      } catch {
        setMensagem({ tipo: 'erro', texto: 'Erro ao tentar excluir a conta.' });
      }
    }
  };

  if (loading) {
    return (
      <div className="py-16 bg-slate-50 min-h-screen flex items-center justify-center">
        <LoadingState text="Carregando seu perfil..." />
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen py-12">
      <div className="container mx-auto px-4 max-w-3xl">
        
        <div className="mb-8 rounded-3xl bg-gradient-to-r from-slate-900 to-emerald-900 p-6 md:p-8 text-white shadow-lg">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/15 px-3 py-1 text-xs font-bold text-emerald-100 mb-4">
            <UserRound aria-hidden="true" className="w-4 h-4" />
            Minha conta
          </span>
          <h1 className="text-3xl md:text-4xl font-extrabold mb-2">Configurações da Conta</h1>
          <p className="text-emerald-100 text-lg max-w-2xl">Gerencie suas informações pessoais e credenciais de acesso.</p>
        </div>

        {mensagem.texto && (
          <div className={`mb-6 p-4 rounded-xl flex items-start gap-3 border ${mensagem.tipo === 'erro' ? 'bg-red-50 border-red-200 text-red-600' : 'bg-emerald-50 border-emerald-200 text-emerald-700'}`} role="status" aria-live="polite">
            {mensagem.tipo === 'erro'
              ? <AlertTriangle aria-hidden="true" className="w-5 h-5 shrink-0" />
              : <CheckCircle aria-hidden="true" className="w-5 h-5 shrink-0" />}
            <p className="text-sm font-medium">{mensagem.texto}</p>
          </div>
        )}

        <div className="space-y-8">
          {/* Cartão de Edição */}
          <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-sm">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                <ShieldCheck aria-hidden="true" className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-800">Informações Pessoais</h2>
                <p className="text-sm text-slate-500 mt-1">Esses dados aparecem nas áreas internas do sistema.</p>
              </div>
            </div>
            
            <form onSubmit={handleSalvarPerfil}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <Input
                  label="Nome de Exibição"
                  type="text"
                  name="first_name"
                  value={perfil.first_name}
                  onChange={handlePerfilChange}
                  required
                />
                <Input
                  label="E-mail de Contato"
                  type="email"
                  name="email"
                  value={perfil.email}
                  onChange={handlePerfilChange}
                  required
                />
              </div>
              <div className="flex flex-col sm:flex-row sm:justify-end gap-3 pt-4 border-t border-slate-100">
                <Button type="submit" variant="secondary" size="lg" className="bg-slate-800 hover:bg-slate-700 text-white border-slate-800">
                  Salvar Alterações
                </Button>
              </div>
            </form>
          </div>

          {/* Zona de Perigo (LGPD) */}
          <div className="bg-red-50 border border-red-200 p-6 md:p-8 rounded-3xl">
            <h3 className="text-xl font-bold text-red-700 mb-2">Zona de Perigo</h3>
            <p className="text-red-600/80 mb-6 max-w-xl text-sm">
              Ao excluir sua conta, todos os seus dados e histórico de acessos serão apagados permanentemente. Isso não pode ser desfeito.
            </p>
            <Button
              variant="danger"
              size="lg"
              onClick={handleExcluirConta}
              className="w-full sm:w-auto"
            >
              Excluir minha conta permanentemente
            </Button>
          </div>
        </div>

      </div>
    </div>
  );
}
