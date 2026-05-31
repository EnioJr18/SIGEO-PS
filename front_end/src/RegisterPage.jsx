import { useState } from 'react'
import './App.css'

function RegisterPage({ onSubmit, registerError, registerSuccess }) {
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'comum',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = (event) => {
    const { name, value } = event.target

    setForm((current) => ({
      ...current,
      [name]: value,
    }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setIsSubmitting(true)

    try {
      await onSubmit(form)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="login-page register-page">
      <section className="login-shell register-shell" aria-label="Tela de cadastro">
        <div className="login-copy register-copy">
          <a className="brand login-brand" href="/">
            <span className="brand-mark" aria-hidden="true">
              <svg viewBox="0 0 24 24">
                <path d="M4 19V8.5L12 4l8 4.5V19h-5v-6H9v6H4Zm7-8h2V8h-2v3Z" />
              </svg>
            </span>
            <span>SIGEO-PS</span>
          </a>

          <div className="login-copy-content">
            <span className="login-kicker">Nova conta</span>
            <h1>Cadastre-se para participar da rede SIGEO</h1>
            <p>
              Crie seu acesso para acompanhar eventos sociais, apoiar iniciativas
              e cadastrar projetos que transformam sua comunidade.
            </p>
          </div>

          <div className="login-highlights" aria-label="Beneficios do cadastro">
            <span>Participacao em eventos</span>
            <span>Projetos no mapa</span>
            <span>Perfil comunitario</span>
          </div>
        </div>

        <form className="login-card register-card" onSubmit={handleSubmit}>
          <div className="login-card-head">
            <span>Comece agora</span>
            <h2>Criar conta</h2>
          </div>

          <label>
            <span>Usuario</span>
            <input
              name="username"
              type="text"
              value={form.username}
              onChange={handleChange}
              placeholder="seu.usuario"
              autoComplete="username"
              required
            />
          </label>

          <label>
            <span>E-mail</span>
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="voce@email.com"
              autoComplete="email"
              required
            />
          </label>

          <label>
            <span>Tipo de conta</span>
            <select name="role" value={form.role} onChange={handleChange} required>
              <option value="comum">Participante</option>
              <option value="organizador">Organizador</option>
            </select>
          </label>

          <label>
            <span>Senha</span>
            <input
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Crie uma senha"
              autoComplete="new-password"
              minLength="6"
              required
            />
          </label>

          <label>
            <span>Confirmar senha</span>
            <input
              name="confirmPassword"
              type="password"
              value={form.confirmPassword}
              onChange={handleChange}
              placeholder="Repita a senha"
              autoComplete="new-password"
              minLength="6"
              required
            />
          </label>

          {registerError && <p className="form-feedback error">{registerError}</p>}
          {registerSuccess && <p className="form-feedback success">{registerSuccess}</p>}

          <button className="btn btn-primary btn-wide" type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Criando conta...' : 'Criar minha conta'}
          </button>

          <div className="login-card-links">
            <a href="/login">Ja tenho conta</a>
            <a href="/">Voltar para inicio</a>
          </div>
        </form>
      </section>
    </main>
  )
}

export default RegisterPage
