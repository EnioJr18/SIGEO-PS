import { useEffect, useState } from "react";
import { Home as HomeIcon, Menu, Sparkles, X } from "lucide-react";
import { Routes, Route, useNavigate } from "react-router-dom"; 

import "./App.css";

import {
  inscreverEvento,
  listEventos,
  loginUser,
  registerUser,
  getProfile,
  cancelarInscricao,
  getMinhasInscricoes,
} from "./api";

// Importando as Páginas
import Home from "./pages/Home.jsx";
import Projetos from "./pages/Projetos.jsx";
import CriarEvento from "./pages/CriarEvento.jsx";
import Login from "./pages/Login.jsx";
import Cadastro from "./pages/Cadastro.jsx";
import DashboardImpacto from "./pages/DashboardImpacto.jsx";
import PainelOrganizador from "./pages/PainelOrganizador.jsx";
import ListaInscritos from './pages/ListaInscritos';
import PainelParticipante from './pages/PainelParticipante';
import Perfil from './pages/Perfil';
import Chatbot from './Chatbot';

export default function App() {
  const navigate = useNavigate(); 
  
  // ==========================================
  // ESTADOS GERAIS DA APLICAÇÃO
  // ==========================================
  const [eventos, setEventos] = useState([]);
  const [isLoadingEventos, setIsLoadingEventos] = useState(true);
  const [searchValue, setSearchValue] = useState("");
  const [toastMessage, setToastMessage] = useState("");
  const [eventoSelecionado, setEventoSelecionado] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // ==========================================
  // ESTADOS DE AUTENTICAÇÃO E USUÁRIO
  // ==========================================
  const isAuthenticated = !!(localStorage.getItem("accessToken") || localStorage.getItem("token"));
  const [userName, setUserName] = useState(localStorage.getItem("userName") || "");
  const [userRole, setUserRole] = useState(localStorage.getItem("userRole") || "");
  const [inscricoesConfirmadas, setInscricoesConfirmadas] = useState([]);

  // Estados de erro/sucesso dos formulários
  const [loginError, setLoginError] = useState("");
  const [loginSuccess, setLoginSuccess] = useState("");
  const [registerError, setRegisterError] = useState("");
  const [registerSuccess, setRegisterSuccess] = useState("");

  // ==========================================
  // EFEITOS (CARREGAMENTO INICIAL)
  // ==========================================
  useEffect(() => {
    if (isAuthenticated) {
      getMinhasInscricoes()
        .then(data => setInscricoesConfirmadas(Array.isArray(data) ? data : []))
        .catch(error => console.error("Erro ao puxar inscrições:", error));
    }
  }, [isAuthenticated]);

  useEffect(() => {
    const fetchEventos = async () => {
      try {
        setIsLoadingEventos(true);
        const data = await listEventos(); 
        setEventos(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Erro ao buscar projetos:", error);
      } finally {
        setIsLoadingEventos(false);
      }
    };
    fetchEventos();
  }, []);

  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(""), 3500);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  // ==========================================
  // FUNÇÕES DE NAVEGAÇÃO E INTERAÇÃO
  // ==========================================
  const toggleMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  const handleCategoryFilter = async (categoria) => {
    try {
      setIsLoadingEventos(true);
      const paramCategoria = (categoria === 'todas' || categoria === 'Todos') ? '' : categoria;
      const data = await listEventos({ categoria: paramCategoria });
      setEventos(Array.isArray(data) ? data : []);
      setTimeout(() => document.getElementById('eventos')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
    } catch (error) {
      console.error("Erro ao filtrar projetos:", error);
    } finally {
      setIsLoadingEventos(false);
    }
  };

  const handleSearch = async (event) => {
    if (event) event.preventDefault();
    try {
      setIsLoadingEventos(true);
      const data = await listEventos({ search: searchValue });
      setEventos(Array.isArray(data) ? data : []);
      setTimeout(() => document.getElementById('eventos')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 200);
    } catch (error) {
      console.error("Erro ao buscar projetos:", error);
    } finally {
      setIsLoadingEventos(false);
    }
  };

  const handleParticipar = async (eventoId) => {
    if (!isAuthenticated) {
      setToastMessage("Você precisa entrar na sua conta!");
      setTimeout(() => navigate("/login"), 1500);
      return;
    }
    try {
      const jaInscrito = inscricoesConfirmadas.some(inscricao => inscricao.evento === eventoId);
      if (jaInscrito) {
        await cancelarInscricao(eventoId);
        setToastMessage("Inscrição cancelada com sucesso.");
      } else {
        await inscreverEvento(eventoId);
        setToastMessage("Inscrição confirmada com sucesso! 🎉");
      }
      const atualizadas = await getMinhasInscricoes();
      setInscricoesConfirmadas(Array.isArray(atualizadas) ? atualizadas : []);
    } catch (error) {
      setToastMessage(error.message || "Erro ao processar sua solicitação.");
    }
  };

  // ==========================================
  // AUTENTICAÇÃO (LOGIN, REGISTRO E LOGOUT)
  // ==========================================
  const handleLogout = (event) => {
    if (event) event.preventDefault();
    localStorage.clear();
    navigate("/"); 
  };

  const handleLogin = async ({ identifier, password }) => {
    setLoginError("");
    setLoginSuccess("");
    try {
      const data = await loginUser({ username: identifier.trim(), password });
      if (data?.access) localStorage.setItem("accessToken", data.access);
      if (data?.token) localStorage.setItem("token", data.token);

      try {
        const profileInfo = await getProfile();
        const profileName = profileInfo.username || profileInfo.first_name || identifier;
        const roleFormatado = profileInfo.role === "organizador" ? "Organizador" : "Participante";
        localStorage.setItem("userName", profileName);
        localStorage.setItem("userRole", roleFormatado);
        setUserName(profileName);
        setUserRole(roleFormatado);
      } catch {
         localStorage.setItem("userName", identifier);
         localStorage.setItem("userRole", "Participante");
         setUserName(identifier);
         setUserRole("Participante");
      }

      setLoginSuccess("Entrada realizada com sucesso. Redirecionando...");
      setTimeout(() => navigate("/"), 800);
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
      await registerUser({ username: username.trim(), email: email.trim(), password, role });
      setRegisterSuccess("Cadastro criado com sucesso. Agora você já pode entrar.");
      setToastMessage("Cadastro criado com sucesso.");
      setTimeout(() => navigate("/login"), 1500);
    } catch (error) {
      setRegisterError(error.message || "Não foi possível criar sua conta.");
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      
      {/* ==========================================
          CABEÇALHO (NAVBAR MINIMALISTA UNIVERSAL)
      ========================================== */}
      <header className="sticky top-0 z-50 bg-slate-900 text-white shadow-md transition-all">
        <nav className="container mx-auto px-4 py-3 flex items-center justify-between">
          <button onClick={() => { navigate("/"); setIsMobileMenuOpen(false); }} className="flex items-center gap-2 text-xl font-bold tracking-tight hover:text-blue-400 transition-colors">
            <HomeIcon aria-hidden="true" className="w-6 h-6 text-blue-500" />
            <span>SIGEO-PS</span>
          </button>

          <div className="flex items-center gap-2 sm:gap-4">
            <button onClick={() => navigate("/criar-evento")} className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-md transition-all flex items-center justify-center whitespace-nowrap">
              <span className="hidden sm:inline">Cadastrar projeto</span>
              <span className="sm:hidden">+ Criar</span>
            </button>

            <button className="text-slate-300 hover:text-white p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg" onClick={toggleMenu} aria-label="Abrir Menu">
              {isMobileMenuOpen ? (
                <X aria-hidden="true" className="w-7 h-7" />
              ) : (
                <Menu aria-hidden="true" className="w-7 h-7" />
              )}
            </button>
          </div>
        </nav>

        {isMobileMenuOpen && (
          <div className="absolute top-full right-0 w-full lg:w-96 lg:right-4 bg-slate-900 border-t lg:border border-slate-800 shadow-2xl lg:rounded-b-2xl flex flex-col px-6 py-6 gap-2 transition-all">
            {isAuthenticated && (
              <div className="flex items-center justify-between pb-6 mb-2 border-b border-slate-800">
                <div>
                  <p className="text-base font-bold text-white">Olá, {userName}!</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full inline-block mt-1 ${userRole === "Organizador" ? "bg-teal-900 text-teal-300" : "bg-sky-900 text-sky-300"}`}>
                    {userRole}
                  </span>
                </div>
              </div>
            )}

            <button onClick={() => { navigate("/"); toggleMenu(); }} className="text-left text-slate-300 hover:text-white font-medium py-3 border-b border-slate-800/50">Início</button>
            <button onClick={() => { navigate("/projetos"); toggleMenu(); }} className="text-left text-slate-300 hover:text-white font-medium py-3 border-b border-slate-800/50">Eventos</button>
            <button onClick={() => { navigate("/dashboard"); toggleMenu(); }} className="text-left text-slate-300 hover:text-white font-medium py-3 border-b border-slate-800/50">Impacto Social</button>

            <div className="flex flex-col gap-4 pt-6 mt-2 border-t border-slate-800">
              {isAuthenticated ? (
                <>
                  {userRole === "Organizador" ? (
                    <button onClick={() => { navigate('/painel'); toggleMenu(); }} className="text-emerald-400 font-bold text-lg text-center">Meu Painel de Eventos</button>
                  ) : (
                    <button onClick={() => { navigate('/agenda'); toggleMenu(); }} className="text-emerald-400 font-bold text-lg text-center">Minha Agenda</button>
                  )}
                  <button onClick={() => { navigate('/perfil'); toggleMenu(); }} className="text-blue-400 font-bold text-lg text-center">Configurações do Perfil</button>
                  <button onClick={(e) => { toggleMenu(); handleLogout(e); }} className="text-center text-red-400 hover:text-red-300 font-bold py-2 mt-2 transition-colors">Sair da conta</button>
                </>
              ) : (
                <>
                  <button onClick={() => { navigate("/login"); toggleMenu(); }} className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-white text-center font-bold rounded-xl transition-colors">Entrar</button>
                  <button onClick={() => { navigate("/cadastro"); toggleMenu(); }} className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white text-center font-bold rounded-xl shadow-md transition-colors">Criar conta</button>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      {/* ==========================================
          CORPO PRINCIPAL / ROTAS
      ========================================== */}
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Home eventos={eventos} isLoading={isLoadingEventos} searchValue={searchValue} setSearchValue={setSearchValue} handleSearch={handleSearch} handleParticipar={handleParticipar} inscricoesConfirmadas={inscricoesConfirmadas} setToastMessage={setToastMessage} eventoSelecionado={eventoSelecionado} setEventoSelecionado={setEventoSelecionado} handleCategoryFilter={handleCategoryFilter} />} />
          <Route path="/projetos" element={<Projetos eventos={eventos} isLoading={isLoadingEventos} handleParticipar={handleParticipar} inscricoesConfirmadas={inscricoesConfirmadas} />} />
          <Route path="/dashboard" element={<DashboardImpacto />} />
          
          {/* Rotas de Organização e Participação */}
          <Route path="/painel" element={<PainelOrganizador eventos={eventos} />} />
          <Route path="/painel/lista/:id" element={<ListaInscritos />} />
          <Route path="/agenda" element={<PainelParticipante />} />
          <Route path="/perfil" element={<Perfil />} />
          
          <Route path="/criar-evento" element={<CriarEvento />} />
          <Route path="/cadastrar-evento" element={<CriarEvento />} />
          <Route path="/editar-evento/:id" element={<CriarEvento />} />
          
          <Route path="/login" element={<Login onSubmit={handleLogin} loginError={loginError} loginSuccess={loginSuccess} />} />
          <Route path="/cadastro" element={<Cadastro onSubmit={handleRegister} registerError={registerError} registerSuccess={registerSuccess} />} />
        </Routes>

        <Chatbot />

        {toastMessage && (
          <div className="fixed bottom-10 left-1/2 transform -translate-x-1/2 z-[200]">
            <div className="bg-slate-900 text-white px-6 py-3.5 rounded-full shadow-2xl flex items-center gap-3 border border-slate-700">
              <Sparkles aria-hidden="true" className="w-5 h-5 text-emerald-400" />
              <span className="font-bold text-sm tracking-wide">{toastMessage}</span>
            </div>
          </div>
        )}
      </main>

      {/* ==========================================
          RODAPÉ
      ========================================== */}
      <footer className="footer bg-slate-950 text-slate-400 px-4 border-t border-slate-800">
        <div className="container mx-auto max-w-6xl py-10 md:py-12">
          <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
            <div className="max-w-md">
              <button
                type="button"
                onClick={() => navigate("/")}
                className="inline-flex items-center gap-2 text-lg font-extrabold text-white hover:text-blue-300 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 rounded-md"
                aria-label="Voltar para a página inicial do SIGEO-PS"
              >
                <HomeIcon aria-hidden="true" className="w-5 h-5 text-blue-400" />
                <span>SIGEO-PS</span>
              </button>
              <p className="footer-description mt-3 text-sm leading-6 text-slate-400">
                Sistema de Informação Geográfica para conectar projetos sociais, participantes e organizadores.
              </p>
            </div>

            <nav className="grid grid-cols-2 gap-x-10 gap-y-3 text-sm md:text-right" aria-label="Links do rodapé">
              <button type="button" onClick={() => navigate("/")} className="text-left md:text-right text-slate-400 hover:text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 rounded">
                Início
              </button>
              <button type="button" onClick={() => navigate("/projetos")} className="text-left md:text-right text-slate-400 hover:text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 rounded">
                Projetos
              </button>
              <button type="button" onClick={() => navigate("/dashboard")} className="text-left md:text-right text-slate-400 hover:text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 rounded">
                Impacto Social
              </button>
              <button type="button" onClick={() => navigate(isAuthenticated ? "/perfil" : "/login")} className="text-left md:text-right text-slate-400 hover:text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 rounded">
                {isAuthenticated ? "Perfil" : "Entrar"}
              </button>
            </nav>
          </div>

          <div className="footer-bottom mt-8 pt-5 border-t border-slate-800 flex flex-col gap-2 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
            <p>© 2026 SIGEO-PS. Todos os direitos reservados.</p>
            <p>Projetos sociais com dados, localização e participação cidadã.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
