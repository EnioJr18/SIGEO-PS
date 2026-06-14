import { useEffect, useState } from "react";
// IMPORTANTE: Importando o Roteador do React
import { Routes, Route, useNavigate } from "react-router-dom"; 

import {
  createEvento,
  inscreverEvento,
  listEventos,
  loginUser,
  registerUser,
  getProfile,
  cancelarInscricao,
  getMinhasInscricoes,
} from "./api";
// Importando as nossas páginas da pasta correta (pages)
import Home from "./pages/Home.jsx";
import Projetos from "./pages/Projetos.jsx";
import CriarEvento from "./pages/CriarEvento.jsx";
import Login from "./pages/Login.jsx";
import Cadastro from "./pages/Cadastro.jsx";
import DashboardImpacto from "./pages/DashboardImpacto.jsx";
import PainelOrganizador from "./pages/PainelOrganizador.jsx";
import ListaInscritos from './pages/ListaInscritos';
import Chatbot from './Chatbot';
import "./App.css";

const CATEGORY_LABELS = {
  saude: "Saúde",
  educacao: "Educação",
  cultura: "Cultura",
  esporte: "Esporte",
  assistencia_social: "Assistência Social",
  meio_ambiente: "Meio Ambiente",
  tecnologia: "Tecnologia",
  outro: "Outro",
};

function App() {
  const navigate = useNavigate(); // Hook do react-router para navegação programática
  const [eventos, setEventos] = useState([]);
  const [isLoadingEventos, setIsLoadingEventos] = useState(true);
  const [apiError, setApiError] = useState("");
  const [createError, setCreateError] = useState("");
  const [createSuccess, setCreateSuccess] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loginSuccess, setLoginSuccess] = useState("");
  const [registerError, setRegisterError] = useState("");
  const [registerSuccess, setRegisterSuccess] = useState("");
  const [searchValue, setSearchValue] = useState("");
  const [submittedSearch, setSubmittedSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [toastMessage, setToastMessage] = useState("Selecione um projeto no mapa");
  
  // Estado para o Modal da Home
  const [eventoSelecionado, setEventoSelecionado] = useState(null);
  
  const [address, setAddress] = useState("");
  const [eventForm, setEventForm] = useState({
    titulo: "",
    descricao: "",
    categoria: "outro",
    vagas: "20",
    data_hora: "",
    link_comprovacao: "",
  });

const [mostrarApenasMinhas, setMostrarApenasMinhas] = useState(false);
  const isAuthenticated = !!localStorage.getItem("accessToken") || !!localStorage.getItem("token");
  
  // Agora o React puxa o nome e a função da memória assim que a página carrega!
  const [userName, setUserName] = useState(localStorage.getItem("userName") || "");
  const [userRole, setUserRole] = useState(localStorage.getItem("userRole") || "");
  const [inscricoesConfirmadas, setInscricoesConfirmadas] = useState([]);

  // ... (seus estados iniciais aqui)

useEffect(() => {
    const token = localStorage.getItem("accessToken") || localStorage.getItem("token");
    if (token) {
      // Como o isAuthenticated já se vira sozinho, só precisamos puxar os dados e inscrições!
      setUserName(localStorage.getItem("userName") || "Usuário");
      setUserRole(localStorage.getItem("userRole") || "Participante");

      // Puxa as inscrições do usuário
      getMinhasInscricoes()
        .then(data => {
          setInscricoesConfirmadas(Array.isArray(data) ? data : []);
        })
        .catch(error => {
          console.error("Erro ao puxar inscrições do usuário:", error);
          setInscricoesConfirmadas([]);
        });
    }
  }, []);


  useEffect(() => {
    const fetchEventos = async () => {
      try {
        setIsLoadingEventos(true);
        // Usa a função do seu api.js para buscar no backend
        const data = await listEventos(); 
        setEventos(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Erro ao buscar projetos:", error);
        setEventos([]);
      } finally {
        setIsLoadingEventos(false);
      }
    };

    fetchEventos();
  }, []);

  // -----------------------------------------------------
  // TEMPORIZADOR DO ALERTA (TOAST)
  // -----------------------------------------------------
  useEffect(() => {
    if (toastMessage) {
      // Se tiver uma mensagem, esconde ela depois de 3.5 segundos
      const timer = setTimeout(() => {
        setToastMessage("");
      }, 3500);
      
      // Limpeza de segurança do React
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  const eventosParaMostrar = mostrarApenasMinhas
    ? eventos.filter((e) => inscricoesConfirmadas.includes(e.id))
    : eventos;

  const eventosFiltrados = submittedSearch
    ? eventosParaMostrar.filter(
        (e) =>
          (e.titulo && e.titulo.toLowerCase().includes(submittedSearch.toLowerCase())) ||
          (e.descricao && e.descricao.toLowerCase().includes(submittedSearch.toLowerCase())),
      )
    : eventosParaMostrar;

  // -----------------------------------------------------
  // FILTRO POR CATEGORIA (Direto do Banco de Dados)
  // -----------------------------------------------------
  const handleCategoryFilter = async (categoria) => {
    try {
      setIsLoadingEventos(true);
      
      const paramCategoria = (categoria === 'todas' || categoria === 'Todos') ? '' : categoria;
      const data = await listEventos({ categoria: paramCategoria });
      
      setEventos(Array.isArray(data) ? data : []);

      // NOVIDADE: Rola suavemente até a seção de eventos após filtrar
      setTimeout(() => {
        document.getElementById('eventos')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);

    } catch (error) {
      console.error("Erro ao filtrar projetos por categoria:", error);
      setEventos([]);
    } finally {
      setIsLoadingEventos(false);
    }
  };

  // -----------------------------------------------------
  // BUSCA POR TEXTO (Barra de Pesquisa)
  // -----------------------------------------------------
  const handleSearch = async (event) => {
    if (event) event.preventDefault();
    
    try {
      setIsLoadingEventos(true);
      
      const data = await listEventos({ search: searchValue });
      setEventos(Array.isArray(data) ? data : []);

      // NOVIDADE: Rola suavemente até a seção de eventos após pesquisar
      setTimeout(() => {
        document.getElementById('eventos')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 200);

    } catch (error) {
      console.error("Erro ao buscar projetos:", error);
      setEventos([]);
    } finally {
      setIsLoadingEventos(false);
    }
  };

// -----------------------------------------------------
  // INSCRIÇÃO E CANCELAMENTO EM PROJETOS
  // -----------------------------------------------------
  const handleParticipar = async (eventoId) => {
    if (!isAuthenticated) {
      if (typeof setToastMessage === 'function') setToastMessage("Você precisa entrar na sua conta!");
      setTimeout(() => window.location.assign("/login"), 1500);
      return;
    }

    try {
      // Verifica se o usuário já está inscrito no evento
      const jaInscrito = inscricoesConfirmadas.some(inscricao => inscricao.evento === eventoId);

      if (jaInscrito) {
        // Se já está inscrito, faz o cancelamento
        await cancelarInscricao(eventoId);
        if (typeof setToastMessage === 'function') setToastMessage("Inscrição cancelada com sucesso.");
      } else {
        // Se não está, faz a inscrição
        await inscreverEvento(eventoId);
        if (typeof setToastMessage === 'function') setToastMessage("Inscrição confirmada com sucesso! 🎉");
      }

      // Atualiza a lista local na mesma hora
      const atualizadas = await getMinhasInscricoes();
      setInscricoesConfirmadas(Array.isArray(atualizadas) ? atualizadas : []);

    } catch (error) {
      if (typeof setToastMessage === 'function') {
        setToastMessage(error.message || "Erro ao processar sua solicitação.");
      } else {
        alert(error.message || "Erro ao processar sua solicitação.");
      }
    }
  };

  const handleCreateEvent = async (event) => {
    event.preventDefault();
    setCreateError("");
    setCreateSuccess("");

    try {
      // 1. Junta os dados do formulário com o endereço do Autocomplete
      const payload = {
        ...eventForm,
        endereco: address // Certifique-se de que o backend espera o campo "endereco"
      };

      // 2. Dispara para a API
      await createEvento(payload);
      
      setCreateSuccess("Projeto publicado com sucesso!");
      
      // 3. Limpa o formulário
      setEventForm({ titulo: '', categoria: 'saude', vagas: '', data_hora: '', link_comprovacao: '', descricao: '' });
      setAddress('');
      
      // 4. Recarrega a lista de eventos para o mapa e a tela de projetos atualizarem na hora
      const updatedEventos = await listEventos();
      setEventos(Array.isArray(updatedEventos) ? updatedEventos : []);

      // 5. Manda o usuário de volta para a tela de projetos
      setTimeout(() => navigate("/projetos"), 1500);
      
    } catch (error) {
      setCreateError(error.message || "Erro ao publicar o projeto. Verifique os dados.");
    }
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setEventForm((current) => ({ ...current, [name]: value }));
  };

  const handleLogout = (event) => {
    event.preventDefault();
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("token");
    localStorage.removeItem("userRole");
    window.location.assign("/"); // Limpa o estado real do navegador no logout
  };

const handleLogin = async ({ identifier, password }) => {
    setLoginError("");
    setLoginSuccess("");
    
    try {
      // 1. Faz o login e pega os Tokens[cite: 5]
      const data = await loginUser({ username: identifier.trim(), password });
      
      if (data?.access) localStorage.setItem("accessToken", data.access);
      if (data?.refresh) localStorage.setItem("refreshToken", data.refresh);
      if (data?.token) localStorage.setItem("token", data.token);

      // 2. COMBO OBRIGATÓRIO: Buscar os dados do usuário para saber o "role"[cite: 5]
      try {
        const profileInfo = await getProfile();
        
        // Salva o nome para a Navbar
        localStorage.setItem("userName", profileInfo.username || profileInfo.first_name || identifier);
        
        // Formata o papel do usuário (role). 
        // O backend normalmente retorna "organizador" ou "comum"[cite: 5].
        const roleRaw = profileInfo.role || "comum";
        const roleFormatado = roleRaw === "organizador" ? "Organizador" : "Participante";
        localStorage.setItem("userRole", roleFormatado);
        
      } catch (profileError) {
         console.warn("Aviso: Token recebido, mas não foi possível buscar o perfil completo.", profileError);
         // Define um padrão seguro caso a rota /me falhe
         localStorage.setItem("userName", identifier);
         localStorage.setItem("userRole", "Participante");
      }

      setLoginSuccess("Entrada realizada com sucesso. Redirecionando...");
      
      // Forçamos o reload da página para que o App.jsx leia o localStorage novamente
      // e monte as rotas corretamente (liberando o /painel se for Organizador)
      setTimeout(() => window.location.assign("/"), 800);
      
    } catch (error) {
      setLoginError(error.message || "Não foi possível entrar. Confira seus dados.");
    }
  };

  const handleRegister = async ({ username, email, password, confirmPassword, role }) => {
    setRegisterError("");
    setRegisterSuccess("");

    if (password !== confirmPassword) {
      setRegisterError("As senhas precisam ser iguais.");
      return;
    }

    try {
      // Cria a conta enviando os dados limpos para a API[cite: 5]
      await registerUser({ username: username.trim(), email: email.trim(), password, role });
      
      setRegisterSuccess("Cadastro criado com sucesso. Agora você já pode entrar.");
      
      // Caso você tenha uma função global de Toast, a mantemos aqui
      if (typeof setToastMessage === 'function') {
        setToastMessage("Cadastro criado com sucesso.");
      }
      
      // Troquei o window.location.assign pelo navigate (se disponível no App.jsx) 
      // ou mantemos o window.location dependendo de como está o escopo. 
      // Usando window.location para garantir que não dê erro de hook fora de escopo.
      setTimeout(() => window.location.assign("/login"), 1500);
      
    } catch (error) {
      setRegisterError(error.message || "Não foi possível criar sua conta.");
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <header className="sticky top-0 z-50 bg-slate-900 text-white shadow-md transition-all">
        <nav className="container mx-auto px-4 py-3 flex items-center justify-between" aria-label="Navegacao principal">
          <button onClick={() => navigate("/")} className="flex items-center gap-2 text-xl font-bold tracking-tight hover:text-blue-400 transition-colors">
            <span aria-hidden="true" className="w-6 h-6 fill-current text-blue-500">
              <svg viewBox="0 0 24 24" role="img"><path d="M4 19V8.5L12 4l8 4.5V19h-5v-6H9v6H4Zm7-8h2V8h-2v3Z" /></svg>
            </span>
            <span>SIGEO-PS</span>
          </button>

          <div className="hidden lg:flex items-center gap-6 text-sm font-medium text-slate-300">
            <button onClick={() => navigate("/")} className="hover:text-white hover:underline underline-offset-4 transition-all">Início</button>
            <button onClick={() => navigate("/projetos")} className="hover:text-white hover:underline underline-offset-4 transition-all">Eventos</button>
            <button onClick={() => navigate("/dashboard")} className="hover:text-white hover:underline underline-offset-4 transition-all">Impacto Social</button>
            <button onClick={() => {navigate("/");setTimeout(() => document.getElementById('sobre')?.scrollIntoView({behavior: 'smooth'}), 100);}} className="hover:text-white hover:underline underline-offset-4 transition-all">Sobre</button>
          </div>

          {/* --- AÇÕES (Perfil, Login, Botão de Cadastro) --- */}
          <div className="flex items-center gap-3 md:gap-4">
            {isAuthenticated ? (
              <div className="flex items-center gap-3 md:gap-4 whitespace-nowrap">
                <span className="hidden md:flex items-center gap-1 bg-amber-400 text-amber-900 px-3 py-1 rounded-full text-xs font-bold shadow-sm">
                  🏅 Cidadão Solidário
                </span>
                
                <div className="flex flex-col items-end leading-tight">
                  <span className="font-semibold text-slate-100 text-sm">Olá, {userName}!</span>
                  {userRole && (
                    <span className={`text-[0.65rem] px-2 py-0.5 rounded-full font-bold mt-0.5 ${userRole === "Organizador" ? "bg-teal-900 text-teal-300" : "bg-sky-900 text-sky-300"}`}>
                      {userRole} {userRole === "Participante" && ` • ${inscricoesConfirmadas.length || 0} vagas`}
                    </span>
                  )}
                </div>

                {/* Botão Meu Painel (Aparece só para Organizador) */}
                {userRole === "Organizador" && (
                  <button onClick={() => navigate('/painel')} className="text-emerald-400 hover:text-emerald-300 text-sm font-medium ml-2 mr-2 transition-colors">
                    Meu Painel
                  </button>
                )}

                <button onClick={handleLogout} className="text-red-400 hover:text-red-300 text-sm font-medium ml-1 transition-colors">Sair</button>
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-4">
                <button onClick={() => navigate("/cadastro")} className="text-sm font-medium text-slate-300 hover:text-white transition-colors">Criar conta</button>
                <button onClick={() => navigate("/login")} className="text-sm font-medium text-white hover:text-blue-400 transition-colors">Entrar</button>
              </div>
            )}
            
            <button onClick={() => navigate("/cadastrar-evento")} className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-md transition-all flex items-center justify-center whitespace-nowrap">
              <span className="hidden sm:inline">Cadastrar projeto</span>
              <span className="sm:hidden">+ Criar</span>
            </button>
          </div>
        </nav>
      </header>

      <main className="flex-grow">
        {/* O CORAÇÃO DA APLICAÇÃO: O ROTEADOR */}
        <Routes>
          {/* Página Inicial */}
          <Route path="/" element={
            <Home 
              eventos={eventos} 
              isLoading={isLoadingEventos}
              apiError={apiError}
              searchValue={searchValue}
              setSearchValue={setSearchValue}
              handleSearch={handleSearch}
              handleParticipar={handleParticipar}
              inscricoesConfirmadas={inscricoesConfirmadas}
              setToastMessage={setToastMessage}
              eventoSelecionado={eventoSelecionado}
              setEventoSelecionado={setEventoSelecionado}
              handleCategoryFilter={handleCategoryFilter}
            />
          } />

          {/* Página de Lista de Projetos Completa */}
          <Route path="/projetos" element={
            <Projetos 
              eventos={eventosFiltrados} 
              handleParticipar={handleParticipar}
              inscricoesConfirmadas={inscricoesConfirmadas}
            />
          } />

          {/* Outras Páginas isoladas */}
          <Route path="/dashboard" element={<DashboardImpacto />} />

          {/* NOSSA NOVA ROTA DO PAINEL */}
          <Route path="/painel" element={<PainelOrganizador eventos={eventos} />} />

          {/* Rotas do Organizador */}
          <Route path="/painel/lista/:id" element={<ListaInscritos />} />

          <Route path="/criar-evento" element={<CriarEvento />} />
          
          <Route path="/editar-evento/:id" element={<CriarEvento />} />
          
          <Route path="/login" element={
            <Login onSubmit={handleLogin} loginError={loginError} loginSuccess={loginSuccess} />
          } />
          
          <Route path="/cadastro" element={
            <Cadastro onSubmit={handleRegister} registerError={registerError} registerSuccess={registerSuccess} />
          } />
          
          
        </Routes>
      {/* ========================================= */}
      {/* ASSISTENTE DE IA (CHATBOT FLUTUANTE)      */}
      {/* ========================================= */}
      <Chatbot />

      
      {/* ========================================= */}
      {/* ALERTA FLUTUANTE (TOAST)                    */}
      {/* ========================================= */}
      {toastMessage && (
        <div className="fixed bottom-10 left-1/2 transform -translate-x-1/2 z-[200]">
          <div className="bg-slate-900 text-white px-6 py-3.5 rounded-full shadow-2xl flex items-center gap-3 border border-slate-700 animate-[bounce_0.3s_ease-out_1]">
            <span className="text-emerald-400 text-xl" aria-hidden="true">✨</span>
            <span className="font-bold text-sm tracking-wide">{toastMessage}</span>
            <button 
              onClick={() => setToastMessage("")}
              className="text-slate-400 hover:text-white ml-2 transition-colors focus:outline-none"
              aria-label="Fechar alerta"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
            </button>
          </div>
        </div>
      )}
      </main>

      <footer className="footer bg-slate-950 text-slate-400 pt-16 pb-8 px-4 border-t border-slate-800">
        <div className="container mx-auto max-w-6xl grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          
          {/* Coluna 1: Logo (Ocupa 2 espaços no desktop) */}
          <div className="md:col-span-2 flex flex-col items-start">
            <button onClick={() => navigate("/")} className="flex items-center gap-2 text-xl font-bold tracking-tight text-white mb-4 hover:text-emerald-400 transition-colors">
              <span aria-hidden="true" className="w-6 h-6 fill-current text-emerald-500">
                <svg viewBox="0 0 24 24"><path d="M4 19V8.5L12 4l8 4.5V19h-5v-6H9v6H4Zm7-8h2V8h-2v3Z" /></svg>
              </span>
              <span>SIGEO-PS</span>
            </button>
            <p className="text-sm max-w-xs text-left leading-relaxed">
              Conectando comunidades por tecnologia para criar impacto social real.
            </p>
          </div>
          
          {/* Coluna 2: Plataforma */}
          <div className="flex flex-col items-start">
            <h3 className="text-white font-bold mb-6 uppercase text-xs tracking-wider">Plataforma</h3>
            <div className="flex flex-col items-start gap-3 text-sm">
              <button onClick={() => navigate("/projetos")} className="hover:text-emerald-400 transition-colors text-left">Explorar projetos</button>
              <button onClick={() => navigate("/cadastrar-evento")} className="hover:text-emerald-400 transition-colors text-left">Criar projeto</button>
            </div>
          </div>
          
          {/* Coluna 3: Suporte */}
          <div className="flex flex-col items-start">
            <h3 className="text-white font-bold mb-6 uppercase text-xs tracking-wider">Suporte</h3>
            <div className="flex flex-col items-start gap-3 text-sm">
              <button className="hover:text-emerald-400 transition-colors text-left">Central de ajuda</button>
              <button className="hover:text-emerald-400 transition-colors text-left">Contato</button>
            </div>
          </div>
        </div>
        
        {/* Direitos Autorais alinhados */}
        <div className="container mx-auto max-w-6xl border-t border-slate-800 pt-8 flex flex-col md:flex-row items-center justify-between text-xs">
          <p>© 2026 SIGEO-PS. Todos os direitos reservados.</p>
          <div className="flex gap-6 mt-4 md:mt-0">
            <button className="hover:text-white transition-colors">Privacidade</button>
            <button className="hover:text-white transition-colors">Termos de Uso</button>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;