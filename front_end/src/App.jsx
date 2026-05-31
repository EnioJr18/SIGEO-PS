import { useEffect, useMemo, useState } from 'react'
import { createEvento, inscreverEvento, listEventos, loginUser, registerUser } from './api'
import CreateEventPage from './CreateEventPage.jsx'
import LoginPage from './LoginPage.jsx'
import RegisterPage from './RegisterPage.jsx'
import PainelOrganizador from './PainelOrganizador.jsx';
import './App.css'

const CATEGORY_LABELS = {
  saude: 'Saude',
  educacao: 'Educacao',
  cultura: 'Cultura',
  esporte: 'Esporte',
  assistencia_social: 'Assistencia Social',
  meio_ambiente: 'Meio Ambiente',
  outro: 'Outro',
}

function App() {
  const [pathname, setPathname] = useState(() => window.location.pathname)
  const [eventos, setEventos] = useState([])
  const [inscricoesConfirmadas, setInscricoesConfirmadas] = useState([]) // NOVO: Rastreia onde o usuário clicou em participar
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
  const [eventForm, setEventForm] = useState({
    titulo: '',
    descricao: '',
    categoria: 'outro',
    vagas: '20',
    data_hora: '',
    latitude: '-9.648139',
    longitude: '-35.708949',
  })
  const [address, setAddress] = useState('')
  const [geoStatus, setGeoStatus] = useState('')

  // NOVO: Verifica se o usuário está logado lendo o localStorage
  const isAuthenticated = !!localStorage.getItem('accessToken') || !!localStorage.getItem('token')

  const categoriasDisponiveis = useMemo(() => {
    return Array.from(new Set(eventos.map((evento) => evento.categoria).filter(Boolean)))
  }, [eventos])

  useEffect(() => {
    const handlePopState = () => setPathname(window.location.pathname)
    window.addEventListener('popstate', handlePopState)
    return () => {
      window.removeEventListener('popstate', handlePopState)
    }
  }, [])

  useEffect(() => {
    let isMounted = true

    async function loadEventos() {
      setIsLoading(true)
      setApiError('')

      try {
        const data = await listEventos({
          search: submittedSearch,
          categoria: selectedCategory,
        })

        if (isMounted) {
          setEventos(Array.isArray(data) ? data : [])
        }
      } catch (error) {
        if (isMounted) {
          setApiError('Nao foi possivel carregar os eventos agora.')
          setEventos([])
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadEventos()

    return () => {
      isMounted = false
    }
  }, [selectedCategory, submittedSearch])

  const handleSearch = (event) => {
    event.preventDefault()
    const value = searchValue.trim()
    setSubmittedSearch(value)
    setToastMessage(value ? `Buscando por: ${value}` : 'Selecione um projeto no mapa')
    document.querySelector('#eventos')?.scrollIntoView({ behavior: 'smooth', block: 'start' }) // Desce para os eventos
  }

  const handlePinClick = (projectName) => {
    setToastMessage(projectName)
  }

  const handleCategoryFilter = (categoria) => {
    setSelectedCategory((current) => (current === categoria ? '' : categoria))
    // NOVO: Rola a tela suavemente até os eventos após clicar na categoria
    setTimeout(() => {
      document.querySelector('#eventos')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 100)
  }

  const handleParticipar = async (eventoId) => {
    if (!isAuthenticated) {
      setToastMessage('Voce precisa estar logado para participar.')
      window.location.href = '/login' // Força ida pro login
      return
    }

    try {
      await inscreverEvento(eventoId)
      setToastMessage('Inscricao enviada com sucesso!')
      // NOVO: Adiciona o ID na lista local para mudar o botão na hora
      setInscricoesConfirmadas((prev) => [...prev, eventoId]) 
    } catch {
      setToastMessage('Erro ao se inscrever. Talvez voce ja esteja inscrito.')
    }
  }

  // NOVO: Limpa tudo e rola para a lista
  const handleLimparFiltros = (e) => {
    e.preventDefault()
    setSelectedCategory('')
    setSubmittedSearch('')
    setSearchValue('')
    document.querySelector('#eventos')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  // NOVO: Função de Logout básico
  const handleLogout = (e) => {
    e.preventDefault()
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('token')
    window.location.href = '/'
  }

  const handleFormChange = (event) => {
    const { name, value } = event.target
    setEventForm((current) => ({
      ...current,
      [name]: value,
    }))
  }

  const useMyLocation = () => {
    setGeoStatus('Obtendo localizacao...')
    if (!navigator.geolocation) {
      setGeoStatus('Geolocalizacao nao suportada pelo navegador.')
      return
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = String(pos.coords.latitude)
        const lon = String(pos.coords.longitude)
        handleFormChange({ target: { name: 'latitude', value: lat } })
        handleFormChange({ target: { name: 'longitude', value: lon } })
        setGeoStatus('Localizacao atual definida')
      },
      (err) => {
        setGeoStatus('Erro ao obter localizacao: ' + (err.message || 'desconhecido'))
      },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }

  const geocodeAddress = async () => {
    const q = address.trim()
    if (!q) {
      setGeoStatus('Digite um endereco para buscar.')
      return
    }

    setGeoStatus('Buscando endereco...')
    try {
      const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=1`
      const res = await fetch(url, { headers: { 'Accept-Language': 'pt-BR' } })
      const data = await res.json()

      if (Array.isArray(data) && data.length > 0) {
        const item = data[0]
        handleFormChange({ target: { name: 'latitude', value: String(item.lat) } })
        handleFormChange({ target: { name: 'longitude', value: String(item.lon) } })
        setGeoStatus('Endereco encontrado e coordenadas preenchidas')
      } else {
        setGeoStatus('Endereco nao encontrado')
      }
    } catch (e) {
      setGeoStatus('Erro ao buscar endereco')
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
        latitude: Number(eventForm.latitude),
        longitude: Number(eventForm.longitude),
      })

      setEventos((current) => [createdEvento, ...current])
      setCreateSuccess('Evento cadastrado com sucesso.')
      setToastMessage('Novo evento criado.')
      setEventForm((current) => ({
        ...current,
        titulo: '',
        descricao: '',
        vagas: '20',
        data_hora: '',
      }))
      document.querySelector('#eventos')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    } catch {
      setCreateError('Nao foi possivel cadastrar o evento. Verifique se voce esta autenticado como Organizador.')
    }
  }

  const handleLogin = async ({ identifier, password }) => {
    setLoginError('')
    setLoginSuccess('')

    try {
      const data = await loginUser({
        username: identifier.trim(),
        password,
      })

      if (data?.access) localStorage.setItem('accessToken', data.access)
      if (data?.refresh) localStorage.setItem('refreshToken', data.refresh)
      if (data?.token) localStorage.setItem('token', data.token)

      setLoginSuccess('Entrada realizada com sucesso. Redirecionando...')
      
      // NOVO: Força o recarregamento da página inicial autenticada
      setTimeout(() => {
        window.location.href = '/'
      }, 800)

    } catch (error) {
      setLoginError(error.message || 'Nao foi possivel entrar. Confira seus dados e tente novamente.')
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
      await registerUser({
        username: username.trim(),
        email: email.trim(),
        password,
        role,
      })

      setRegisterSuccess('Cadastro criado com sucesso. Agora voce ja pode entrar.')
      setToastMessage('Cadastro criado com sucesso.')
      
      setTimeout(() => {
        window.location.href = '/login'
      }, 1500)

    } catch (error) {
      setRegisterError(error.message || 'Nao foi possivel criar sua conta.')
    }
  }

  if (pathname === '/cadastrar-evento') {
    return (
      <CreateEventPage
        eventForm={eventForm}
        onFormChange={handleFormChange}
        onSubmit={handleCreateEvent}
        createError={createError}
        createSuccess={createSuccess}
      />
    )
  }

  if (pathname === '/login') {
    return (
      <LoginPage
        onSubmit={handleLogin}
        loginError={loginError}
        loginSuccess={loginSuccess}
      />
    )
  }

  if (pathname === '/cadastro') {
    return (
      <RegisterPage
        onSubmit={handleRegister}
        registerError={registerError}
        registerSuccess={registerSuccess}
      />
    )
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
            <a href="#sobre">Sobre</a>
          </div>

          <div className="nav-actions">
            {isAuthenticated ? (
              // Mostra Sair se estiver logado
              <a className="login-link" href="/" onClick={handleLogout} style={{ color: '#d9534f' }}>
                Sair
              </a>
            ) : (
              // Mostra Entrar se não estiver logado
              <a className="login-link" href="/login">
                Entrar
              </a>
            )}
            
            <a className="btn btn-primary btn-small" href="#cadastrar-evento">
              Cadastrar projeto
            </a>
          </div>
        </nav>
      </header>

      <main>
        {/* HERO SECTION... MANTIDO IGUAL */}
        <section className="hero">
          <div className="hero-inner">
            <h1>Conecte-se com Impacto Social Perto de Voce</h1>
            <p>
              Descubra e participe de projetos sociais relevantes na sua comunidade.
              Faca a diferenca onde ela mais importa.
            </p>

            <form className="search" onSubmit={handleSearch} aria-label="Buscar projetos sociais">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M10.8 18a7.2 7.2 0 1 1 5.1-12.3 7.2 7.2 0 0 1 0 10.2l4.1 4.1-1.5 1.5-4.1-4.1A7.1 7.1 0 0 1 10.8 18Zm0-2.2a5 5 0 1 0 0-10 5 5 0 0 0 0 10Z" />
              </svg>
              <input
                type="search"
                placeholder="Encontre projetos sociais perto de voce..."
                value={searchValue}
                onChange={(event) => setSearchValue(event.target.value)}
              />
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

        {/* MAPA MANTIDO IGUAL... */}
        <section className="map-section" id="mapa">
          {/* ... Código do mapa não alterado ... */}
          <div className="section-heading centered">
            <h2>Mapa Interativo de Projetos</h2>
            <p>Veja iniciativas de impacto social acontecendo ao seu redor</p>
          </div>
          <div className="map-wrap">
             {/* Mantive a estrutura do Kelven para não quebrar o CSS */}
             <div className="map-card" aria-label="Mapa ilustrativo com marcadores">
               <div className="water"></div>
               <div className="land"></div>
               <div className="map-toast">{toastMessage}</div>
             </div>
          </div>
        </section>

        <section className="categories-section" id="categorias">
          <div className="section-heading centered">
            <h2>Categorias de Impacto Social</h2>
            <p>Escolha a causa que mais importa para voce</p>
          </div>

          <div className="category-grid">
            <article className={`category-card ${selectedCategory === 'saude' ? 'active' : ''}`} onClick={() => handleCategoryFilter('saude')}>
              <span className="category-icon red">
                <svg viewBox="0 0 24 24">
                  <path d="M12 21s-7-4.4-7-10a4.2 4.2 0 0 1 7-3.1A4.2 4.2 0 0 1 19 11c0 5.6-7 10-7 10Zm-4-9h2.3l.9-2.3 2 4.8 1-2.5H16v-2h-3.1l-.7 1.7-2-4.8L9 10H8v2Z" />
                </svg>
              </span>
              <h3>Saude</h3>
            </article>

            <article className={`category-card ${selectedCategory === 'educacao' ? 'active' : ''}`} onClick={() => handleCategoryFilter('educacao')}>
              <span className="category-icon blue">
                <svg viewBox="0 0 24 24">
                  <path d="m12 4 9 5-9 5-9-5 9-5Zm-6 8.2 2 1.1V17c0 1.6 3 3 4 3s4-1.4 4-3v-3.7l2-1.1V17h2v-6l-8 4.4-8-4.4v6h2v-4.8Z" />
                </svg>
              </span>
              <h3>Educacao</h3>
            </article>

            <article className={`category-card ${selectedCategory === 'assistencia_social' ? 'active' : ''}`} onClick={() => handleCategoryFilter('assistencia_social')}>
              <span className="category-icon orange">
                <svg viewBox="0 0 24 24">
                  <path d="M7 3h2v8a3 3 0 0 1-2 2.8V21H5v-7.2A3 3 0 0 1 3 11V3h2v7h1V3h1v7h1V3Zm9 0c2.2 0 4 1.8 4 4v5h-3v9h-2V3h1Z" />
                </svg>
              </span>
              <h3>Assistencia</h3>
            </article>

            <article className={`category-card ${selectedCategory === 'cultura' ? 'active' : ''}`} onClick={() => handleCategoryFilter('cultura')}>
              <span className="category-icon purple">
                <svg viewBox="0 0 24 24">
                  <path d="M9 5V3h6v2h4a2 2 0 0 1 2 2v4h-7v-2h-4v2H3V7a2 2 0 0 1 2-2h4Zm2 0h2V4h-2v1ZM3 13h7v2h4v-2h7v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-5Z" />
                </svg>
              </span>
              <h3>Cultura</h3>
            </article>

            <article className={`category-card ${selectedCategory === 'meio_ambiente' ? 'active' : ''}`} onClick={() => handleCategoryFilter('meio_ambiente')}>
              <span className="category-icon green">
                <svg viewBox="0 0 24 24">
                  <path d="m12 3 9 8h-3v9h-5v-6h-2v6H6v-9H3l9-8Z" />
                </svg>
              </span>
              <h3>Meio Ambiente</h3>
            </article>
          </div>
        </section>

        <section className="events-section" id="eventos">
          <div className="events-head">
            <div className="section-heading">
              <h2>Eventos Sociais em Destaque</h2>
              <p>Participe das proximas acoes na sua regiao</p>
            </div>
            {/* NOVO: Limpa o filtro em vez de abrir nova aba */}
            <a href="#eventos" onClick={handleLimparFiltros} style={{ cursor: 'pointer', color: '#0066cc' }}>
              Ver todos os eventos
            </a>
          </div>

          {apiError && <p className="events-feedback">{apiError}</p>}
          {isLoading && <p className="events-feedback">Carregando eventos...</p>}
          {!isLoading && !apiError && eventos.length === 0 && (
            <p className="events-feedback">Nenhum evento encontrado para este filtro.</p>
          )}

          {!isLoading && !apiError && eventos.length > 0 && (
            <div className="event-grid">
              {eventos.map((evento, index) => {
                const isConfirmed = inscricoesConfirmadas.includes(evento.id)

                return (
                  <article className="event-card" key={evento.id}>
                    <div className={`event-image ${index % 3 === 0 ? 'image-health' : index % 3 === 1 ? 'image-education' : 'image-food'}`}></div>
                    <div className="event-body">
                      <div className="event-meta">
                        <span>{CATEGORY_LABELS[evento.categoria] || evento.categoria || 'Categoria'}</span>
                        <small>{new Date(evento.data_hora).toLocaleDateString('pt-BR')}</small>
                      </div>
                      <h3>{evento.titulo}</h3>
                      <p>{evento.descricao}</p>
                      
                      {/* NOVO: Botão inteligente de inscrição */}
                      <button 
                        className={`btn ${isConfirmed ? 'btn-light' : 'btn-primary'} btn-wide`} 
                        type="button" 
                        onClick={() => handleParticipar(evento.id)}
                        disabled={isConfirmed}
                        style={isConfirmed ? { opacity: 0.7, cursor: 'not-allowed' } : {}}
                      >
                        {isConfirmed ? 'Inscrito ✅' : 'Participar'}
                      </button>
                    </div>
                  </article>
                )
              })}
            </div>
          )}
        </section>

       <PainelOrganizador eventos={eventos} />

        <section className="cta" id="sobre"></section>
        
        <section className="cta" id="sobre">
          <div className="cta-inner">
            <h2>Pronto para Fazer a Diferenca?</h2>
            <p>Junte-se a voluntarios e organizacoes que fortalecem comunidades todos os dias.</p>
            <div className="cta-actions">
              <a className="btn btn-light" href="#mapa">
                Encontrar projetos
              </a>
              <a className="btn btn-dark-green" href="#cadastrar-evento">
                Criar novo projeto
              </a>
            </div>
          </div>
        </section>

        <section className="create-event-section" id="cadastrar-evento">
          <div className="section-heading centered create-event-header">
            <h2>Cadastrar Evento</h2>
            <p>Preencha os dados abaixo para publicar um novo evento social no mapa.</p>
          </div>

          <div className="create-event-grid">
            <aside className="create-event-panel">
              <span className="create-event-badge">Novo evento</span>
              <h3>Organize uma acao com impacto real</h3>
              <p>
                O formulario envia titulo, descricao, categoria, vagas, data e coordenadas.
                O organizador eh associado ao usuario autenticado.
              </p>
              <ul>
                <li>Use coordenadas de latitude e longitude</li>
                <li>O sistema salva a localizacao no PostGIS</li>
                <li>Seu evento aparece no mapa depois do cadastro</li>
              </ul>
            </aside>

            <form className="event-form" onSubmit={handleCreateEvent}>
              <div className="form-grid">
                <label>
                  <span>Titulo</span>
                  <input
                    name="titulo"
                    type="text"
                    value={eventForm.titulo}
                    onChange={handleFormChange}
                    placeholder="Feira de Saude Comunitaria"
                    required
                  />
                </label>

                <label>
                  <span>Categoria</span>
                  <select name="categoria" value={eventForm.categoria} onChange={handleFormChange} required>
                    <option value="saude">Saude</option>
                    <option value="educacao">Educacao</option>
                    <option value="cultura">Cultura</option>
                    <option value="esporte">Esporte</option>
                    <option value="assistencia_social">Assistencia Social</option>
                    <option value="meio_ambiente">Meio Ambiente</option>
                    <option value="outro">Outro</option>
                  </select>
                </label>

                <label className="form-span-2">
                  <span>Descricao</span>
                  <textarea
                    name="descricao"
                    value={eventForm.descricao}
                    onChange={handleFormChange}
                    placeholder="Descreva o objetivo, publico e o que sera oferecido no evento."
                    rows="5"
                    required
                  ></textarea>
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
                  <span>Endereco (opcional)</span>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <input type="text" placeholder="Rua, Bairro, Cidade, Estado" value={address} onChange={(e) => setAddress(e.target.value)} />
                    <button type="button" className="btn" onClick={geocodeAddress}>
                      Buscar endereco
                    </button>
                    <button type="button" className="btn" onClick={useMyLocation}>
                      Usar minha localizacao
                    </button>
                  </div>
                  {geoStatus && <small className="form-note">{geoStatus}</small>}
                </label>

                <label>
                  <span>Latitude</span>
                  <input name="latitude" type="text" value={eventForm.latitude} onChange={handleFormChange} required />
                </label>

                <label>
                  <span>Longitude</span>
                  <input name="longitude" type="text" value={eventForm.longitude} onChange={handleFormChange} required />
                </label>
              </div>

              {createError && <p className="form-feedback error">{createError}</p>}
              {createSuccess && <p className="form-feedback success">{createSuccess}</p>}

              <div className="event-form-actions">
                <a className="btn btn-light" href="#eventos">
                  Ver eventos
                </a>
                <button className="btn btn-primary" type="submit">
                  Publicar evento
                </button>
              </div>
            </form>
          </div>
        </section>
      </main>

      <footer className="footer">
        <div className="footer-grid">
          <div>
            <a className="brand footer-brand" href="/">
              <span className="brand-mark" aria-hidden="true">
                <svg viewBox="0 0 24 24">
                  <path d="M4 19V8.5L12 4l8 4.5V19h-5v-6H9v6H4Zm7-8h2V8h-2v3Z" />
                </svg>
              </span>
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

        <p className="copyright">© 2026 SIGEO-PS. Todos os direitos reservados.</p>
      </footer>
    </>
  )
}

export default App