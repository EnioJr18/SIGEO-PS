import React, { useState } from 'react'
import './App.css'

function CreateEventPage({
  eventForm,
  onFormChange,
  onSubmit,
  createError,
  createSuccess,
}) {
  const [address, setAddress] = useState('')
  const [geoStatus, setGeoStatus] = useState('')

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
        onFormChange({ target: { name: 'latitude', value: lat } })
        onFormChange({ target: { name: 'longitude', value: lon } })
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
        onFormChange({ target: { name: 'latitude', value: String(item.lat) } })
        onFormChange({ target: { name: 'longitude', value: String(item.lon) } })
        setGeoStatus('Endereco encontrado e coordenadas preenchidas')
      } else {
        setGeoStatus('Endereco nao encontrado')
      }
    } catch (e) {
      setGeoStatus('Erro ao buscar endereco')
    }
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
            <a href="/">Inicio</a>
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
              Publique um novo evento social no mapa com titulo, descricao, categoria,
              vagas, data e coordenadas.
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

            <form className="event-form" onSubmit={onSubmit}>
              <div className="form-grid">
                <label>
                  <span>Titulo</span>
                  <input
                    name="titulo"
                    type="text"
                    value={eventForm.titulo}
                    onChange={onFormChange}
                    placeholder="Feira de Saude Comunitaria"
                    required
                  />
                </label>

                <label>
                  <span>Categoria</span>
                  <select name="categoria" value={eventForm.categoria} onChange={onFormChange} required>
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
                    onChange={onFormChange}
                    placeholder="Descreva o objetivo, publico e o que sera oferecido no evento."
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
                  <span>Endereco (opcional)</span>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <input
                      type="text"
                      placeholder="Rua, Bairro, Cidade, Estado"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                    />
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
                  <input
                    name="latitude"
                    type="text"
                    value={eventForm.latitude}
                    onChange={onFormChange}
                    required
                  />
                </label>

                <label>
                  <span>Longitude</span>
                  <input
                    name="longitude"
                    type="text"
                    value={eventForm.longitude}
                    onChange={onFormChange}
                    required
                  />
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
