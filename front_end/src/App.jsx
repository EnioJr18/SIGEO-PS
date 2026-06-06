import { useEffect, useState } from 'react'
import { createEvento, inscreverEvento, listEventos, loginUser, registerUser, getProfile, cancelarInscricao, getMinhasInscricoes } from './api'
import AddressAutocomplete from './AddressAutocomplete.jsx'
import CreateEventPage from './CreateEventPage.jsx'
import LoginPage from './LoginPage.jsx'
import RegisterPage from './RegisterPage.jsx'
import PainelOrganizador from './PainelOrganizador.jsx'
import EventMap from './EventMap.jsx'
import DashboardImpacto from './DashboardImpacto.jsx'
import './App.css'

const CATEGORY_LABELS = {
  saude: 'Saúde',
  educacao: 'Educação',
  cultura: 'Cultura',
  esporte: 'Esporte',
  assistencia_social: 'Assistência Social',
  meio_ambiente: 'Meio Ambiente',
  tecnologia: 'Tecnologia',
  outro: 'Outro',
}

function App() {
  const [pathname, setPathname] = useState(() => window.location.pathname)
  const [eventos, setEventos] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [apiError, setApiError] = useState('')
  const [createError, setCreateError] = useState('')
  const [createSuccess, setCreateSuccess] = useState('')
  const [loginError, setLoginError] = useState('')
  const [loginSuccess, setLoginSuccess] = useState('')
  const [registerError, setRegisterError] = useState('')
  const [registerSuccess, setRegisterSuccess] = useState('')
  const [searchValue, setSearchValue] = useState('')
  const [submittedSearch, setSubmittedSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [toastMessage, setToastMessage] = useState('Selecione um projeto no mapa')
  const [address, setAddress] = useState('')
  const [eventForm, setEventForm] = useState({
    titulo: '',
    descricao: '',
    categoria: 'outro',
    vagas: '20',
    data_hora: '',
    link_comprovacao: '',
  })

  // === NOVOS ESTADOS ===
  const [mostrarApenasMinhas, setMostrarApenasMinhas] = useState(false)
  const isAuthenticated = !!localStorage.getItem('accessToken') || !!localStorage.getItem('token')
  const [userName, setUserName] = useState('')
  const [userRole, setUserRole] = useState('')

  const [inscricoesConfirmadas, setInscricoesConfirmadas] = useState([])

  useEffect(() => {
  if (isAuthenticated) {

    getProfile()
      .then((data) => {
        setUserName(data.username || data.first_name || 'Usuário')

        if (data.role === 'organizador') {
          setUserRole('Organizador')
        } else {
          setUserRole('Participante')
        }
      })
      .catch(() => {
        console.log('Erro ao carregar os dados do usuário')
      })

    getMinhasInscricoes()
      .then((data) => {

        const idsEventos = data.map(
          (inscricao) => inscricao.evento
        )

        setInscricoesConfirmadas(idsEventos)

      })
      .catch((error) => {
        console.error(
          'Erro ao carregar inscrições:',
          error
        )
      })
  }
}, [isAuthenticated])

  useEffect(() => {
    const handlePopState = () => setPathname(window.location.pathname)
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  useEffect(() => {
    let isMounted = true

    async function loadEventos() {
      setIsLoading(true)
      setApiError('')

      try {
        const data = await listEventos({
          // Removido o 'search' daqui para o React fazer a filtragem correta
          categoria: selectedCategory,
        })

        if (isMounted) {
          setEventos(Array.isArray(data) ? data : [])
        }
      } catch {
        if (isMounted) {
          setApiError('Não foi possível carregar os eventos agora.')
          setEventos([])
        }
      } finally {
        if (isMounted) setIsLoading(false)
      }
    }

    loadEventos()
    return () => { isMounted = false }
  }, [selectedCategory])

  // Filtro inteligente para a lista de eventos (abaixo do mapa)
  const eventosParaMostrar = mostrarApenasMinhas
    ? eventos.filter(e => inscricoesConfirmadas.includes(e.id))
    : eventos;

  // Filtro de pesquisa no React
  const eventosFiltrados = submittedSearch
    ? eventosParaMostrar.filter(e => 
        (e.titulo && e.titulo.toLowerCase().includes(submittedSearch.toLowerCase())) || 
        (e.descricao && e.descricao.toLowerCase().includes(submittedSearch.toLowerCase()))
      )
    : eventosParaMostrar;

  const handleSearch = (event) => {
    event.preventDefault()
    const value = searchValue.trim()
    setSubmittedSearch(value)
    setToastMessage(value ? `Buscando por: ${value}` : 'Selecione um projeto no mapa')
    document.querySelector('#eventos')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const handleCategoryFilter = (categoria) => {
    setSelectedCategory((current) => (current === categoria ? '' : categoria))
    setTimeout(() => {
      document.querySelector('#eventos')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 100)
  }

  // === NOVA FUNÇÃO DE INSCRIÇÃO COM ALERTA E CANCELAMENTO ===
  const handleParticipar = async (eventoId) => {
    if (!isAuthenticated) {
      alert('Você precisa estar logado para participar.');
      window.location.assign('/login');
      return;
    }

    const isConfirmed = inscricoesConfirmadas.includes(eventoId);

    if (isConfirmed) {
      const desejaCancelar = window.confirm("Você tem certeza que deseja cancelar sua inscrição neste projeto?");
      if (desejaCancelar) {
        try {
          await cancelarInscricao(eventoId);
          setInscricoesConfirmadas((prev) => prev.filter((id) => id !== eventoId));
          alert("Inscrição cancelada com sucesso!");
        } catch (error) {
          alert("Erro no servidor: " + error.message);
          console.error("Erro completo:", error); 
        }
      }
    } else { 
      try {
        await inscreverEvento(eventoId);
        setInscricoesConfirmadas((prev) =>prev.includes(eventoId) ? prev : [...prev, eventoId]);
        alert("Inscrição confirmada com sucesso! 🎉");
      } catch (error) {
        alert("Não foi possível realizar a inscrição. O servidor recusou (Provavelmente você já está inscrito no banco de dados).");
      }
    }
  }

  const handleCreateEvent = async (event) => {
    event.preventDefault()
    setCreateError('')
    setCreateSuccess('')

    try {
      const createdEvento = await createEvento({
        titulo: eventForm.titulo.trim(),
        descricao: eventForm.descricao.trim(),
        categoria: eventForm.categoria,
        vagas: Number(eventForm.vagas),
        data_hora: eventForm.data_hora,
        endereco: address.trim(),
        link_comprovacao: eventForm.link_comprovacao.trim(),
      })

      setEventos((current) => [createdEvento, ...current])
      setCreateSuccess('Evento cadastrado com sucesso.')
      setToastMessage('Novo evento criado.')
      setEventForm({ titulo: '', descricao: '', categoria: 'outro', vagas: '20', data_hora: '', link_comprovacao: '' })
      setAddress('')
      document.querySelector('#eventos')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    } catch (error) {
      setCreateError(error.message || 'Não foi possível cadastrar o evento. Verifique os dados.')
    }
  }

  const handleFormChange = (event) => {
    const { name, value } = event.target
    setEventForm((current) => ({ ...current, [name]: value }))
  }

  const handleLimparFiltros = (event) => {
    event.preventDefault()
    setSelectedCategory('')
    setSubmittedSearch('')
    setSearchValue('')
    setMostrarApenasMinhas(false) 
    document.querySelector('#eventos')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const handleLogout = (event) => {
    event.preventDefault()
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('token')
    localStorage.removeItem('userRole')
    window.location.assign('/')
  }

  const handleLogin = async ({ identifier, password }) => {
    setLoginError('')
    setLoginSuccess('')

    try {
      const data = await loginUser({ username: identifier.trim(), password })
      if (data?.access) localStorage.setItem('accessToken', data.access)
      if (data?.refresh) localStorage.setItem('refreshToken', data.refresh)
      if (data?.token) localStorage.setItem('token', data.token)

      setLoginSuccess('Entrada realizada com sucesso. Redirecionando...')
      setTimeout(() => window.location.assign('/'), 800)
    } catch (error) {
      setLoginError(error.message || 'Não foi possível entrar. Confira seus dados e tente novamente.')
    }
  }

  const handleRegister = async ({ username, email, password, confirmPassword, role }) => {
    setRegisterError('')
    setRegisterSuccess('')

    if (password !== confirmPassword) {
      setRegisterError('As senhas precisam ser iguais.')
      return
    }

    try {
      await registerUser({ username: username.trim(), email: email.trim(), password, role })
      setRegisterSuccess('Cadastro criado com sucesso. Agora você já pode entrar.')
      setToastMessage('Cadastro criado com sucesso.')
      setTimeout(() => window.location.assign('/login'), 1500)
    } catch (error) {
      setRegisterError(error.message || 'Não foi possível criar sua conta.')
    }
  }

  if (pathname === '/cadastrar-evento') {
    return <CreateEventPage eventForm={eventForm} onFormChange={handleFormChange} onSubmit={handleCreateEvent} createError={createError} createSuccess={createSuccess} />
  }

  if (pathname === '/login') {
    return <LoginPage onSubmit={handleLogin} loginError={loginError} loginSuccess={loginSuccess} />
  }

  if (pathname === '/cadastro') {
    return <RegisterPage onSubmit={handleRegister} registerError={registerError} registerSuccess={registerSuccess} />
  }

  if (pathname === '/dashboard') {
    return <DashboardImpacto />
  }

  return (
    <>
      <header className="site-header">
        <nav className="nav" aria-label="Navegacao principal">
          <a className="brand" href="/">
            <span className="brand-mark" aria-hidden="true">
              <svg viewBox="0 0 24 24" role="img">
                <path d="M4 19V8.5L12 4l8 4.5V19h-5v-6H9v6H4Zm7-8h2V8h-2v3Z" />
              </svg>
            </span>
            <span>SIGEO-PS</span>
          </a>

          <div className="nav-links">
            <a href="#mapa">Explorar</a>
            <a href="#categorias">Categorias</a>
            <a href="#eventos">Eventos</a>
            <a href="/dashboard" onClick={(e) => { e.preventDefault(); setPathname('/dashboard'); }}>Impacto Social</a>
            <a href="#sobre">Sobre</a>
          </div>

          <div className="nav-actions">
            {isAuthenticated ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px', whiteSpace: 'nowrap' }}>
                
                {/* --- NOVA BADGE DE GAMIFICAÇÃO --- */}
                <span style={{ 
                  background: '#fbbf24', 
                  color: '#78350f', 
                  padding: '5px 10px', 
                  borderRadius: '20px', 
                  fontSize: '0.85rem', 
                  fontWeight: 'bold', 
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}>
                  🏅 Cidadão Solidário
                </span>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', lineHeight: '1.2' }}>
                  <span style={{ fontWeight: '600', color: '#333', fontSize: '0.95rem' }}>
                    Olá, {userName}!
                  </span>
                  {userRole && (
                    <span style={{ 
                      fontSize: '0.7rem', 
                      backgroundColor: userRole === 'Organizador' ? '#ccfbf1' : '#e0f2fe', 
                      color: userRole === 'Organizador' ? '#0f766e' : '#0369a1', 
                      padding: '2px 8px', 
                      borderRadius: '12px', 
                      fontWeight: 'bold',
                      marginTop: '3px'
                    }}>
                      {userRole} {userRole === 'Participante' && ` • ${inscricoesConfirmadas.length || 0} vagas`}
                    </span>
                  )}
                </div>
                
                <a className="login-link" href="/" onClick={handleLogout} style={{ color: '#d9534f', marginLeft: '10px' }}>
                  Sair
                </a>
              </div>
            ) : (
              <>
                <a className="btn btn-light btn-small" href="/cadastro">Criar conta</a>
                <a className="login-link" href="/login">Entrar</a>
              </>
            )}
            
            <a className="btn btn-primary btn-small" href="#cadastrar-evento">
              Cadastrar projeto
            </a>
          </div>
        </nav>
      </header>

      <main>
        <section className="hero">
          <div className="hero-inner">
              <h1>Conecte-se com Impacto Social Perto de Você</h1>
            <p>Descubra e participe de projetos sociais relevantes na sua comunidade. Faça a diferença onde ela mais importa.</p>

            {/* Adicionado o botão de pesquisar na barra */}
            <form className="search" onSubmit={handleSearch} aria-label="Buscar projetos sociais" style={{ display: 'flex', gap: '10px' }}>
              <div style={{ position: 'relative', flex: 1, display: 'flex', alignItems: 'center' }}>
                <svg viewBox="0 0 24 24" aria-hidden="true" style={{ position: 'absolute', left: '15px', width: '20px', fill: '#94a3b8' }}>
                  <path d="M10.8 18a7.2 7.2 0 1 1 5.1-12.3 7.2 7.2 0 0 1 0 10.2l4.1 4.1-1.5 1.5-4.1-4.1A7.1 7.1 0 0 1 10.8 18Zm0-2.2a5 5 0 1 0 0-10 5 5 0 0 0 0 10Z" />
                </svg>
                <input 
                  type="search" 
                  placeholder="Encontre projetos sociais perto de você..." 
                  value={searchValue} 
                  onChange={(event) => setSearchValue(event.target.value)} 
                  style={{ width: '100%', paddingLeft: '45px' }}
                />
              </div>
              <button type="submit" className="btn btn-blue">
                Pesquisar
              </button>
            </form>

            <div className="hero-actions">
              <a className="btn btn-light" href="#mapa">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="m15 19-6-2.1-4 1.6V6l4-1.6 6 2.1 4-1.6v12.5L15 19Zm-5.2-4 4.4 1.5V8.4L9.8 6.9V15Z" />
                </svg>
                Explorar mapa
              </a>
              <a className="btn btn-blue" href="#cadastrar-evento">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M11 13H5v-2h6V5h2v6h6v2h-6v6h-2v-6Z" />
                </svg>
                Cadastrar projeto
              </a>
            </div>
          </div>
        </section>

        <section className="map-section" id="mapa">
          <div className="section-heading centered">
            <h2>Mapa Interativo de Projetos</h2>
            <p>Veja iniciativas de impacto social acontecendo ao seu redor.</p>
          </div>
          <div className="map-wrap">
           <EventMap 
             eventos={eventos} 
             isLoading={isLoading} 
             apiError={apiError} 
             onViewDetails={(eventoId, titulo) => {
               setToastMessage(`Lendo detalhes: ${titulo}`);
               const cardSelecionado = document.getElementById(`evento-card-${eventoId}`);
               
               if (cardSelecionado) {
                 cardSelecionado.scrollIntoView({ behavior: 'smooth', block: 'center' });
                 cardSelecionado.style.transition = 'box-shadow 0.4s';
                 cardSelecionado.style.boxShadow = '0 0 0 5px rgba(59, 130, 246, 0.5)';
                 setTimeout(() => cardSelecionado.style.boxShadow = 'none', 1500);
               } else {
                 document.querySelector('#eventos')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
               }
             }}
             onParticipar={handleParticipar}
             inscricoesConfirmadas={inscricoesConfirmadas}
           />
          </div>
        </section>

        <section className="categories-section" id="categorias">
          <div className="section-heading centered">
            <h2>Categorias de Impacto Social</h2>
            <p>Escolha a causa que mais importa para você.</p>
          </div>

          <div className="category-grid">
            <article className={`category-card ${selectedCategory === 'saude' ? 'active' : ''}`} onClick={() => handleCategoryFilter('saude')}>
              <span className="category-icon red"><svg viewBox="0 0 24 24"><path d="M12 21s-7-4.4-7-10a4.2 4.2 0 0 1 7-3.1A4.2 4.2 0 0 1 19 11c0 5.6-7 10-7 10Zm-4-9h2.3l.9-2.3 2 4.8 1-2.5H16v-2h-3.1l-.7 1.7-2-4.8L9 10H8v2Z" /></svg></span>
              <h3>Saúde</h3>
            </article>
            <article className={`category-card ${selectedCategory === 'educacao' ? 'active' : ''}`} onClick={() => handleCategoryFilter('educacao')}>
              <span className="category-icon blue"><svg viewBox="0 0 24 24"><path d="m12 4 9 5-9-5-9-5 9-5Zm-6 8.2 2 1.1V17c0 1.6 3 3 4 3s4-1.4 4-3v-3.7l2-1.1V17h2v-6l-8 4.4-8-4.4v6h2v-4.8Z" /></svg></span>
              <h3>Educação</h3>
            </article>
            <article className={`category-card ${selectedCategory === 'assistencia_social' ? 'active' : ''}`} onClick={() => handleCategoryFilter('assistencia_social')}>
              <span className="category-icon orange"><svg viewBox="0 0 24 24"><path d="M7 3h2v8a3 3 0 0 1-2 2.8V21H5v-7.2A3 3 0 0 1 3 11V3h2v7h1V3h1v7h1V3Zm9 0c2.2 0 4 1.8 4 4v5h-3v9h-2V3h1Z" /></svg></span>
              <h3>Assistência</h3>
            </article>
            <article className={`category-card ${selectedCategory === 'cultura' ? 'active' : ''}`} onClick={() => handleCategoryFilter('cultura')}>
              <span className="category-icon purple"><svg viewBox="0 0 24 24"><path d="M9 5V3h6v2h4a2 2 0 0 1 2 2v4h-7v-2h-4v2H3V7a2 2 0 0 1 2-2h4Zm2 0h2V4h-2v1ZM3 13h7v2h4v-2h7v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-5Z" /></svg></span>
              <h3>Cultura</h3>
            </article>
            <article className={`category-card ${selectedCategory === 'meio_ambiente' ? 'active' : ''}`} onClick={() => handleCategoryFilter('meio_ambiente')}>
              <span className="category-icon green"><svg viewBox="0 0 24 24"><path d="m12 3 9 8h-3v9h-5v-6h-2v6H6v-9H3l9-8Z" /></svg></span>
              <h3>Meio Ambiente</h3>
            </article>
            <article className={`category-card ${selectedCategory === 'tecnologia' ? 'active' : ''}`} onClick={() => handleCategoryFilter('tecnologia')}>
            <span className="category-icon" style={{ color: '#6366f1' }}>
              <svg viewBox="0 0 24 24">
                <path d="M20 18c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2H0v2h24v-2h-4zM4 6h16v10H4V6z" />
              </svg>
            </span>
            <h3>Tecnologia</h3>
          </article>
          </div>
        </section>

        <section className="events-section" id="eventos">
          <div className="events-head">
            <div className="section-heading">
              <h2>{mostrarApenasMinhas ? 'Minhas Inscrições' : 'Eventos Sociais em Destaque'}</h2>
              <p>{mostrarApenasMinhas ? 'Projetos que você se comprometeu a ajudar.' : 'Participe das próximas ações na sua região.'}</p>
            </div>
            
            <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
              {isAuthenticated && userRole === 'Participante' && (
                <button 
                  onClick={() => setMostrarApenasMinhas(!mostrarApenasMinhas)}
                  style={{
                    padding: '6px 15px',
                    borderRadius: '20px',
                    border: 'none',
                    background: mostrarApenasMinhas ? '#10b981' : '#e2e8f0',
                    color: mostrarApenasMinhas ? 'white' : '#475569',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  {mostrarApenasMinhas ? '🎯 Mostrando suas vagas' : '🔍 Ver minhas inscrições'}
                </button>
              )}
              
              <a href="#eventos" onClick={(e) => { handleLimparFiltros(e); setMostrarApenasMinhas(false); }} style={{ cursor: 'pointer', color: '#0066cc' }}>
                Ver todos os eventos
              </a>
            </div>
          </div>

          {apiError && <p className="events-feedback">{apiError}</p>}
          {isLoading && <p className="events-feedback">Carregando eventos...</p>}
          {!isLoading && !apiError && eventosFiltrados.length === 0 && (
            <p className="events-feedback">Nenhum evento encontrado para este filtro.</p>
          )}

          {!isLoading && !apiError && eventosFiltrados.length > 0 && (
            <div className="event-grid">
              {eventosFiltrados.map((evento, index) => {
                const isConfirmed = inscricoesConfirmadas.includes(evento.id)
                
                const dataEvento = new Date(evento.data_hora);
                const dataHoje = new Date();
                const eventoEncerrado = dataEvento < dataHoje;
                
                // Só bloqueia se o evento acabou ou cancelou. Se estiver inscrito, continua clicável para poder cancelar.
                const isDisabled = evento.cancelado || eventoEncerrado;

                return (
                  <article className="event-card" key={evento.id} id={`evento-card-${evento.id}`}>
                    <div className={`event-image ${index % 3 === 0 ? 'image-health' : index % 3 === 1 ? 'image-education' : 'image-food'}`}></div>
                    <div className="event-body">
                      
                      <div className="event-status-badges" style={{ marginBottom: '10px' }}>
                        {evento.cancelado && (
                          <span style={{ background: '#fee2e2', color: '#991b1b', padding: '4px 10px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 'bold' }}>
                            🔴 Cancelado
                          </span>
                        )}
                        
                        {!evento.cancelado && eventoEncerrado && (
                          <span style={{ background: '#f3f4f6', color: '#4b5563', padding: '4px 10px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 'bold' }}>
                            ⚪ Encerrado
                          </span>
                        )}

                        {!evento.cancelado && !eventoEncerrado && (
                          <span style={{ background: '#dcfce7', color: '#166534', padding: '4px 10px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 'bold' }}>
                            🟢 Ativo
                          </span>
                        )}
                      </div>

                      <div className="event-meta">
                        <span>{CATEGORY_LABELS[evento.categoria] || evento.categoria || 'Categoria'}</span>

                        <small>
                          👥 {evento.inscritos || 0}/{evento.vagas} vagas
                        </small>

                        <small>
                          {new Date(evento.data_hora).toLocaleDateString('pt-BR')}
                        </small>
                      </div>
                      <h3>{evento.titulo}</h3>
                      <p>{evento.descricao}</p>

                      {evento.link_comprovacao && (
                        <a 
                          href={evento.link_comprovacao} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          style={{ display: 'inline-block', marginBottom: '15px', fontSize: '0.9rem', color: '#0066cc', textDecoration: 'none', fontWeight: 'bold' }}
                        >
                          🔗 Ver página oficial
                        </a>
                      )}
                      
                      <button 
                        className={`btn ${isConfirmed ? 'btn-light' : 'btn-primary'} btn-wide`} 
                        type="button" 
                        onClick={() => handleParticipar(evento.id)}
                        disabled={isDisabled}
                        style={{
                          ...(isDisabled ? { opacity: 0.7, cursor: 'not-allowed' } : {}),
                          ...(isConfirmed && !isDisabled ? { color: '#dc2626', borderColor: '#dc2626' } : {})
                        }}
                      >
                        {isConfirmed && !isDisabled ? 'Cancelar Inscrição ❌' : (evento.cancelado || eventoEncerrado) ? 'Inscrições Indisponíveis' : 'Participar'}
                      </button>

                      {/* --- NOVO BOTÃO DE AVALIAÇÃO MOCKADO --- */}
                      <button 
                        onClick={() => alert("⭐ A avaliação estará disponível no seu perfil após a data de encerramento do evento. (Funcionalidade em desenvolvimento - Sprint 3)")}
                        style={{ 
                          background: '#f8fafc', 
                          color: '#475569', 
                          border: '1px solid #cbd5e1',
                          padding: '8px 15px', 
                          borderRadius: '8px', 
                          cursor: 'pointer', 
                          fontWeight: 'bold',
                          width: '100%',
                          marginTop: '10px',
                          transition: 'all 0.2s'
                        }}
                        onMouseOver={(e) => e.target.style.background = '#f1f5f9'}
                        onMouseOut={(e) => e.target.style.background = '#f8fafc'}
                      >
                        ⭐ Avaliar Evento
                      </button>
                      
                    </div>
                  </article>
                )
              })}
            </div>
          )}
        </section>

       <PainelOrganizador eventos={eventos} />

        <section className="cta" id="sobre">
          <div className="cta-inner">
            <h2>Sobre o SIGEO</h2>
            <p>O SIGEO é uma plataforma que conecta voluntários a projetos sociais, promovendo o engajamento e o impacto positivo nas comunidades.</p>
            <h2>Pronto para Fazer a Diferença?</h2>
            <p>Junte-se a voluntários e organizações que fortalecem comunidades todos os dias.</p>
            <div className="cta-actions">
              <a className="btn btn-light" href="#mapa">Encontrar projetos</a>
              <a className="btn btn-dark-green" href="#cadastrar-evento">Criar novo projeto</a>
            </div>
          </div>
        </section>

        <section className="create-event-section" id="cadastrar-evento">
          <div className="section-heading centered create-event-header">
            <h2>Cadastrar Evento</h2>
            <p>Preencha os dados abaixo para publicar um novo evento social no mapa.</p>
          </div>

          <div className="create-event-grid">
            <form className="event-form" onSubmit={handleCreateEvent}>
              <div className="form-grid">
                <label>
                  <span>Título</span>
                  <input name="titulo" type="text" value={eventForm.titulo} onChange={handleFormChange} placeholder="Feira de Saúde Comunitária" required />
                </label>
                <label>
                  <span>Categoria</span>
                  <select name="categoria" value={eventForm.categoria} onChange={handleFormChange} required>
                    <option value="saude">Saúde</option>
                    <option value="educacao">Educação</option>
                    <option value="cultura">Cultura</option>
                    <option value="esporte">Esporte</option>
                    <option value="assistencia_social">Assistência Social</option>
                    <option value="meio_ambiente">Meio Ambiente</option>
                    <option value="tecnologia">Tecnologia</option>
                    <option value="outro">Outro</option>
                  </select>
                </label>
                <label className="form-span-2">
                  <span>Descrição</span>
                  <textarea name="descricao" value={eventForm.descricao} onChange={handleFormChange} placeholder="Descreva o objetivo, público e o que será oferecido no evento." rows="5" required></textarea>
                </label>
                <label>
                  <span>Vagas</span>
                  <input name="vagas" type="number" min="1" step="1" value={eventForm.vagas} onChange={handleFormChange} required />
                </label>
                <label>
                  <span>Data e hora</span>
                  <input name="data_hora" type="datetime-local" value={eventForm.data_hora} onChange={handleFormChange} required />
                </label>
                <label className="form-span-2">
                  <span>Endereço</span>
                  <AddressAutocomplete value={address} onChange={setAddress} />
                </label>
              </div>

              <label className="form-span-2">
                  <span>Link de Comprovacao (Rede Social ou Site Oficial)</span>
                  <input name="link_comprovacao" type="url" value={eventForm.link_comprovacao} onChange={handleFormChange} placeholder="https://instagram.com/sua_ong" required />
                </label>

              {createError && <p className="form-feedback error">{createError}</p>}
              {createSuccess && <p className="form-feedback success">{createSuccess}</p>}

              <div className="event-form-actions">
                <a className="btn btn-light" href="#eventos">Ver eventos</a>
                <button className="btn btn-primary" type="submit">Publicar evento</button>
              </div>
            </form>
          </div>
        </section>
      </main>

      <footer className="footer">
        <div className="footer-grid">
          <div>
            <a className="brand footer-brand" href="/">
              <span className="brand-mark" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M4 19V8.5L12 4l8 4.5V19h-5v-6H9v6H4Zm7-8h2V8h-2v3Z" /></svg></span>
              <span>SIGEO-PS</span>
            </a>
            <p>Conectando comunidades por tecnologia para criar impacto social real.</p>
          </div>
          <div>
            <h3>Plataforma</h3>
            <a href="#mapa">Explorar projetos</a>
            <a href="#cadastrar-evento">Criar projeto</a>
            <a href="/login">Entrar na comunidade</a>
          </div>
          <div>
            <h3>Suporte</h3>
            <a href="#">Central de ajuda</a>
            <a href="#">Contato</a>
            <a href="#">Privacidade</a>
          </div>
        </div>
        {/* Adicionado style={{ textAlign: 'center' }} para alinhar os direitos autorais */}
        <p className="copyright" style={{ textAlign: 'center' }}>© 2026 SIGEO-PS. Todos os direitos reservados.</p>
      </footer>
    </>
  )
}

export default App