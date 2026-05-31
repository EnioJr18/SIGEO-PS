import { useState } from 'react'
import AddressAutocomplete from './AddressAutocomplete.jsx'
import './App.css'

function CreateEventPage({
  eventForm,
  onFormChange,
  onSubmit,
  createError,
  createSuccess,
}) {
  const [address, setAddress] = useState('')
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
            <a href="/">Início</a>
            <a href="/#eventos">Eventos</a>
            <a href="/#mapa">Mapa</a>
          </div>

          <div className="nav-actions">
            <a className="btn btn-primary btn-small" href="/">
              Voltar para a home
            </a>
          </div>
        </nav>
      </header>

      <main>
        <section className="cta create-event-hero" id="sobre">
          <div className="cta-inner">
            <h2>Cadastrar Evento</h2>
            <p>
              Publique um novo evento social no mapa com título, descrição, categoria,
              vagas, data e endereço.
            </p>
            <div className="cta-actions">
              <a className="btn btn-light" href="/#eventos">
                Ver eventos
              </a>
              <a className="btn btn-dark-green" href="/#mapa">
                Ver mapa
              </a>
            </div>
          </div>
        </section>

        <section className="create-event-section create-event-page" id="cadastrar-evento">
          <div className="create-event-grid">
            <form className="event-form" onSubmit={onSubmit}>
              <div className="form-grid">
                <label>
                  <span>Título</span>
                  <input
                    name="titulo"
                    type="text"
                    value={eventForm.titulo}
                    onChange={onFormChange}
                    placeholder="Feira de Saúde Comunitária"
                    required
                  />
                </label>

                <label>
                  <span>Categoria</span>
                  <select name="categoria" value={eventForm.categoria} onChange={onFormChange} required>
                    <option value="saude">Saúde</option>
                    <option value="educacao">Educação</option>
                    <option value="cultura">Cultura</option>
                    <option value="esporte">Esporte</option>
                    <option value="assistencia_social">Assistência Social</option>
                    <option value="meio_ambiente">Meio Ambiente</option>
                    <option value="outro">Outro</option>
                  </select>
                </label>

                <label className="form-span-2">
                  <span>Descrição</span>
                  <textarea
                    name="descricao"
                    value={eventForm.descricao}
                    onChange={onFormChange}
                    placeholder="Descreva o objetivo, público e o que será oferecido no evento."
                    rows="5"
                    required
                  ></textarea>
                </label>

                <label>
                  <span>Vagas</span>
                  <input
                    name="vagas"
                    type="number"
                    min="1"
                    step="1"
                    value={eventForm.vagas}
                    onChange={onFormChange}
                    required
                  />
                </label>

                <label>
                  <span>Data e hora</span>
                  <input
                    name="data_hora"
                    type="datetime-local"
                    value={eventForm.data_hora}
                    onChange={onFormChange}
                    required
                  />
                </label>

                <label className="form-span-2">
                  <span>Endereço</span>
                  <AddressAutocomplete value={address} onChange={setAddress} />
                </label>
              </div>

              {createError && <p className="form-feedback error">{createError}</p>}
              {createSuccess && <p className="form-feedback success">{createSuccess}</p>}

              <div className="event-form-actions">
                <a className="btn btn-light" href="/#eventos">
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
            <a href="/#mapa">Explorar projetos</a>
            <a href="/cadastrar-evento">Criar projeto</a>
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

export default CreateEventPage
