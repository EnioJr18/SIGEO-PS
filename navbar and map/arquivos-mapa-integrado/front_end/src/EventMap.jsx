import { useMemo, useState } from 'react'

const TILE_SIZE = 256
const MAP_ZOOM = 13
const DEFAULT_CENTER = {
  latitude: -9.648139,
  longitude: -35.708949,
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max)
}

function lonToTileX(longitude, zoom) {
  return ((longitude + 180) / 360) * 2 ** zoom
}

function latToTileY(latitude, zoom) {
  const latRad = (latitude * Math.PI) / 180
  return ((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2) * 2 ** zoom
}

function readCoordinate(evento, key) {
  const value = Number(evento[key])

  if (Number.isFinite(value)) {
    return value
  }

  if (evento.localizacao?.coordinates && Array.isArray(evento.localizacao.coordinates)) {
    const [longitude, latitude] = evento.localizacao.coordinates
    return key === 'latitude' ? Number(latitude) : Number(longitude)
  }

  if (typeof evento.localizacao === 'string') {
    const match = evento.localizacao.match(/POINT\s*\((-?\d+(?:\.\d+)?)\s+(-?\d+(?:\.\d+)?)\)/i)

    if (match) {
      return key === 'latitude' ? Number(match[2]) : Number(match[1])
    }
  }

  return null
}

function getEventPosition(evento) {
  const latitude = readCoordinate(evento, 'latitude')
  const longitude = readCoordinate(evento, 'longitude')

  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    return null
  }

  return {
    latitude,
    longitude,
  }
}

function getTileUrl(x, y, zoom) {
  return `https://tile.openstreetmap.org/${zoom}/${x}/${y}.png`
}

function EventMap({ eventos, isLoading, apiError, onSelectEvent }) {
  const [selectedEventId, setSelectedEventId] = useState(null)

  const positionedEvents = useMemo(() => {
    return eventos
      .map((evento) => ({
        ...evento,
        position: getEventPosition(evento),
      }))
      .filter((evento) => evento.position)
  }, [eventos])

  const center = useMemo(() => {
    if (!positionedEvents.length) {
      return DEFAULT_CENTER
    }

    const totals = positionedEvents.reduce(
      (acc, evento) => ({
        latitude: acc.latitude + evento.position.latitude,
        longitude: acc.longitude + evento.position.longitude,
      }),
      { latitude: 0, longitude: 0 }
    )

    return {
      latitude: totals.latitude / positionedEvents.length,
      longitude: totals.longitude / positionedEvents.length,
    }
  }, [positionedEvents])

  const centerTile = useMemo(() => {
    return {
      x: lonToTileX(center.longitude, MAP_ZOOM),
      y: latToTileY(center.latitude, MAP_ZOOM),
    }
  }, [center])

  const selectedEvent = positionedEvents.find((evento) => evento.id === selectedEventId) || positionedEvents[0]
  const baseTileX = Math.floor(centerTile.x) - 1
  const baseTileY = Math.floor(centerTile.y) - 1
  const offsetX = (centerTile.x - Math.floor(centerTile.x)) * TILE_SIZE
  const offsetY = (centerTile.y - Math.floor(centerTile.y)) * TILE_SIZE

  const handleMarkerClick = (evento) => {
    setSelectedEventId(evento.id)
    onSelectEvent?.(evento.titulo)
  }

  return (
    <div className="real-map-layout">
      <aside className="real-map-panel">
        <span className="map-badge">Eventos no banco</span>
        <strong>{positionedEvents.length} com localizacao</strong>
        <p>
          Os marcadores sao gerados a partir dos eventos retornados pela API e das coordenadas salvas no PostGIS.
        </p>

        {selectedEvent && (
          <div className="map-selected-event">
            <span>{selectedEvent.titulo}</span>
            <small>{selectedEvent.endereco || 'Endereco nao informado'}</small>
          </div>
        )}
      </aside>

      <div className="real-map" aria-label="Mapa com eventos cadastrados">
        <div
          className="tile-grid"
          style={{
            transform: `translate(calc(-50% - ${offsetX}px), calc(-50% - ${offsetY}px))`,
          }}
        >
          {Array.from({ length: 9 }, (_, index) => {
            const col = index % 3
            const row = Math.floor(index / 3)
            const tileX = baseTileX + col
            const tileY = baseTileY + row

            return (
              <img
                alt=""
                className="map-tile"
                key={`${tileX}-${tileY}`}
                src={getTileUrl(tileX, tileY, MAP_ZOOM)}
                style={{
                  left: col * TILE_SIZE,
                  top: row * TILE_SIZE,
                }}
              />
            )
          })}
        </div>

        {positionedEvents.map((evento) => {
          const x = clamp(50 + (lonToTileX(evento.position.longitude, MAP_ZOOM) - centerTile.x) * TILE_SIZE, 4, 96)
          const y = clamp(50 + (latToTileY(evento.position.latitude, MAP_ZOOM) - centerTile.y) * TILE_SIZE, 4, 96)

          return (
            <button
              className={`event-marker ${evento.id === selectedEvent?.id ? 'active' : ''}`}
              key={evento.id}
              onClick={() => handleMarkerClick(evento)}
              style={{
                left: `${x}%`,
                top: `${y}%`,
              }}
              type="button"
              aria-label={`Ver evento ${evento.titulo}`}
            >
              <span>{evento.titulo}</span>
            </button>
          )
        })}

        {!isLoading && !apiError && positionedEvents.length === 0 && (
          <div className="map-empty">Cadastre eventos com endereco para eles aparecerem no mapa.</div>
        )}

        {isLoading && <div className="map-empty">Carregando eventos no mapa...</div>}
        {apiError && <div className="map-empty">Nao foi possivel carregar os eventos agora.</div>}
      </div>
    </div>
  )
}

export default EventMap
