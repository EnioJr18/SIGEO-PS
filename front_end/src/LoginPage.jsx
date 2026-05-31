import { useState } from 'react'
import './App.css'

function LoginPage({ onSubmit, loginError, loginSuccess }) {
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    setIsSubmitting(true)

    try {
      await onSubmit({ identifier, password })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="login-page">
      <section className="login-shell" aria-label="Tela de entrada">
        <div className="login-copy">
          <a className="brand login-brand" href="/">
            <span className="brand-mark" aria-hidden="true">
              <svg viewBox="0 0 24 24">
                <path d="M4 19V8.5L12 4l8 4.5V19h-5v-6H9v6H4Zm7-8h2V8h-2v3Z" />
              </svg>
            </span>
            <span>SIGEO-PS</span>
          </a>

          <div className="login-copy-content">
            <span className="login-kicker">Impacto social conectado</span>
            <h1>Entre para acompanhar projetos perto de você</h1>
            <p>
              Acesse sua conta para participar de eventos, cadastrar iniciativas e
              fortalecer a rede de apoio da sua comunidade.
            </p>
          </div>

          <div className="login-highlights" aria-label="Recursos da plataforma">
            <span>Mapa de projetos</span>
            <span>Eventos sociais</span>
            <span>Comunidade ativa</span>
          </div>
        </div>

        <form className="login-card" onSubmit={handleSubmit}>
          <div className="login-card-head">
            <span>Bem-vindo de volta</span>
            <h2>Entrar</h2>
          </div>

          <label>
            <span>E-mail ou usuário</span>
            <input
              type="text"
              value={identifier}
              onChange={(event) => setIdentifier(event.target.value)}
                placeholder="você@email.com"
              autoComplete="username"
              required
            />
          </label>

          <label>
            <span>Senha</span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Digite sua senha"
              autoComplete="current-password"
              required
            />
          </label>

          {loginError && <p className="form-feedback error">{loginError}</p>}
          {loginSuccess && <p className="form-feedback success">{loginSuccess}</p>}

          <button className="btn btn-primary btn-wide" type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Entrando...' : 'Entrar na plataforma'}
          </button>

          <div className="login-card-links">
            <a href="/">Voltar para início</a>
            <a href="/cadastro">Criar conta</a>
          </div>
        </form>
      </section>
    </main>
  )
}

export default LoginPage
