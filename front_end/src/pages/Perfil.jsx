import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPerfil, updatePerfil, deletePerfil } from '../api';

export default function Perfil() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [mensagem, setMensagem] = useState({ tipo: '', texto: '' });
  const [perfil, setPerfil] = useState({ first_name: '', email: '' });

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    try {
      const dados = await getPerfil();
      setPerfil({
        first_name: dados.first_name || '',
        email: dados.email || ''
      });
    } catch (error) {
      setMensagem({ tipo: 'erro', texto: 'Não foi possível carregar suas informações.' });
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
      
      // Atualiza o nome no navegador para a Navbar mudar na mesma hora
      localStorage.setItem("userName", perfil.first_name);
      
      // Um pequeno delay e recarregamos a página para o React puxar o nome novo lá em cima
      setTimeout(() => window.location.reload(), 1000);
    } catch (error) {
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
      } catch (error) {
        setMensagem({ tipo: 'erro', texto: 'Erro ao tentar excluir a conta.' });
      }
    }
  };

  if (loading) {
    return (
      <div className="py-16 bg-slate-50 min-h-screen flex items-center justify-center">
        <p className="text-xl font-bold text-slate-500">Carregando seu perfil...</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen py-12">
      <div className="container mx-auto px-4 max-w-2xl">
        
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-slate-900 mb-2">Configurações da Conta</h1>
          <p className="text-slate-600 text-lg">Gerencie suas informações pessoais e credenciais de acesso.</p>
        </div>

        {mensagem.texto && (
          <div className={`mb-6 p-4 rounded-xl flex items-start gap-3 border ${mensagem.tipo === 'erro' ? 'bg-red-50 border-red-200 text-red-600' : 'bg-emerald-50 border-emerald-200 text-emerald-700'}`}>
            <span aria-hidden="true" className="text-lg">{mensagem.tipo === 'erro' ? '⚠️' : '✅'}</span>
            <p className="text-sm font-medium">{mensagem.texto}</p>
          </div>
        )}

        <div className="space-y-8">
          {/* Cartão de Edição */}
          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
            <h2 className="text-xl font-bold text-slate-800 mb-6">Informações Pessoais</h2>
            
            <form onSubmit={handleSalvarPerfil}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
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
              <div className="flex justify-end pt-4 border-t border-slate-100">
                <button type="submit" className="px-8 py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-full shadow-md transition-all hover:-translate-y-0.5">
                  Salvar Alterações
                </button>
              </div>
            </form>
          </div>

          {/* Zona de Perigo (LGPD) */}
          <div className="bg-red-50 border border-red-200 p-8 rounded-3xl">
            <h3 className="text-xl font-bold text-red-700 mb-2">Zona de Perigo</h3>
            <p className="text-red-600/80 mb-6 max-w-xl text-sm">
              Ao excluir sua conta, todos os seus dados e histórico de acessos serão apagados permanentemente. Isso não pode ser desfeito.
            </p>
            <button 
              onClick={handleExcluirConta}
              className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-colors shadow-sm"
            >
              Excluir minha conta permanentemente
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}