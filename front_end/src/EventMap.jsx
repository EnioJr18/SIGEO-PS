import { useState, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import { LocateFixed, Search, SearchX, X } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Correção de bug clássico do Leaflet com ícones no React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const userIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Pino padrão (Azul)
const defaultIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Pino selecionado (Vermelho e um pouco maior)
const selectedIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [30, 48], // Maior para dar destaque
  iconAnchor: [15, 48],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

function MapController({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.flyTo(center, zoom, { animate: true, duration: 1.5 });
    }
  }, [center, zoom, map]);
  return null;
}

// O componente agora marca o local do usuário E desmarca o evento
function MapInteractions({ setPosition, clearSelection }) {
  useMapEvents({
    click(e) {
      setPosition(e.latlng); // Marca o pino do usuário
      clearSelection();      // MÁGICA: Limpa o evento selecionado!
    },
  });
  return null;
}

// NOVO: Adicionamos onParticipar e inscricoesConfirmadas nas props!
function EventMap({ eventos, isLoading, apiError, onViewDetails, onParticipar, inscricoesConfirmadas = [] }) {
  const [mapCenter, setMapCenter] = useState([-9.648139, -35.708949]);
  const [userLocation, setUserLocation] = useState(null);
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [bottomSheetOpen, setBottomSheetOpen] = useState(true);

  const safeEvents = useMemo(() => {
    const dataHoje = new Date(); // Para comparar as datas

    return eventos.map(evento => {
      let lat = null;
      let lng = null;
      
      if (evento.geometry && evento.geometry.coordinates) {
        lng = evento.geometry.coordinates[0];
        lat = evento.geometry.coordinates[1];
      } else if (evento.latitude && evento.longitude) {
        lat = Number(evento.latitude);
        lng = Number(evento.longitude);
      } else if (typeof evento.localizacao === 'string') {
        const match = evento.localizacao.match(/POINT\s*\((-?\d+(?:\.\d+)?)\s+(-?\d+(?:\.\d+)?)\)/i);
        if (match) {
          lng = Number(match[1]);
          lat = Number(match[2]);
        }
      }

      return { ...evento, position: (lat && lng) ? [lat, lng] : null };
    }).filter(e => {
      if (e.position === null) return false;
      
      // REGRAS DE NEGÓCIO: Só aparece se não estiver cancelado E não for passado
      const dataEvento = new Date(e.data_hora);
      const eventoEncerrado = dataEvento < dataHoje;
      
      return !e.cancelado && !eventoEncerrado;
    });
  }, [eventos]);

  const filteredEvents = safeEvents.filter(e => 
    (e.titulo || e.properties?.titulo || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const requestLocation = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const coords = [pos.coords.latitude, pos.coords.longitude];
          setUserLocation(coords);
          setMapCenter(coords);
        },
        () => alert('Acesso ao GPS negado. Toque no mapa para marcar.')
      );
    } else {
      alert('Navegador não suporta GPS.');
    }
  };

  // A função de selecionar agora NÃO rola mais a tela, só atualiza o mapa
  const handleSelectEvent = (evento) => {
    setSelectedEventId(evento.id);
    setMapCenter(evento.position);
    setBottomSheetOpen(true);
  };

  return (
    <div className="ifood-map-container">
      <div className="map-search-bar">
        <Search aria-hidden="true" className="w-4 h-4 text-slate-400" />
        <input 
          type="text" 
          placeholder="Buscar projeto social ativo..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          aria-label="Buscar projeto no mapa"
        />
      </div>


      <MapContainer center={mapCenter} zoom={13} className="leaflet-fullscreen" zoomControl={false}>
        <TileLayer
          attribution='&copy; OpenStreetMap'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapController center={mapCenter} zoom={14} />
        <MapInteractions setPosition={setUserLocation} clearSelection={() => setSelectedEventId(null)} />

        {/* Pinos dos Eventos Atualizados */}
        {safeEvents.map(evento => {
          const isSelected = selectedEventId === evento.id;

          return (
            <Marker 
              key={evento.id} 
              position={evento.position}
              icon={isSelected ? selectedIcon : defaultIcon}
              eventHandlers={{ click: () => handleSelectEvent(evento) }}
              zIndexOffset={isSelected ? 1000 : 0} // Garante que o vermelho fique na frente dos azuis
            >
              <Popup>
                <strong>{evento.titulo}</strong><br/>
                <button 
                  className="popup-btn" 
                  onClick={(e) => { 
                    e.stopPropagation(); 
                    if (onViewDetails) onViewDetails(evento.id, evento.titulo); 
                  }}
                >
                  Ver Detalhes
                </button>
              </Popup>
            </Marker>
          );
        })}

        {userLocation && (
          <Marker position={userLocation} icon={userIcon}>
            <Popup>Você está aqui</Popup>
          </Marker>
        )}
      </MapContainer>

      <div className={`bottom-sheet ${bottomSheetOpen ? 'open' : 'closed'}`}>

        {/* MOVA O BOTÃO PARA CÁ (DENTRO DA BOTTOM SHEET) */}
        <button className="gps-fab" onClick={requestLocation} title="Minha localização" aria-label="Usar minha localização">
          <LocateFixed aria-hidden="true" className="w-5 h-5" />
        </button>

        <button
          type="button"
          className="sheet-drag-handle"
          onClick={() => setBottomSheetOpen(!bottomSheetOpen)}
          aria-label={bottomSheetOpen ? 'Recolher lista de projetos' : 'Expandir lista de projetos'}
        >
          <div className="handle-bar"></div>
        </button>
        
        <div className="sheet-content">
          {isLoading && <p className="sheet-msg">Carregando projetos...</p>}
          {apiError && <p className="sheet-msg text-danger">Erro ao carregar projetos.</p>}
          
          <div className="sheet-list">
            {filteredEvents.map(evento => {
              const titulo = evento.titulo;
              const descricao = evento.descricao;
              const isSelected = selectedEventId === evento.id;
              
              // NOVO: Verifica se o usuário já se inscreveu neste evento
              const isConfirmed = inscricoesConfirmadas.some(inscricao => inscricao.evento === evento.id);

              return (
                <div 
                  key={evento.id} 
                  className={`sheet-card ${isSelected ? 'selected' : ''}`}
                  onClick={() => handleSelectEvent(evento)}
                >
                  <div className="card-info" style={{ position: 'relative' }}>
                    <h4 style={{ paddingRight: '20px' }}>{titulo}</h4>
                    <p>{descricao?.substring(0, 60)}...</p>
                    
                    {/* Botão sutil de Fechar (X) */}
                    {isSelected && (
                      <button 
                        onClick={(e) => { e.stopPropagation(); setSelectedEventId(null); }}
                        style={{ position: 'absolute', top: '-5px', right: '0px', background: 'transparent', border: 'none', fontSize: '1.2rem', color: '#94a3b8', cursor: 'pointer' }}
                        title="Desmarcar"
                        aria-label="Desmarcar projeto"
                      >
                        <X aria-hidden="true" className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  
                  {isSelected && (
                    <div className="card-actions slide-down">
                      {/* Trocamos o botão fechar por "Ver Detalhes" para otimizar espaço */}
                      <button 
                        className="btn-fechar" 
                        style={{ background: '#e0f2fe', color: '#0369a1' }}
                        onClick={(e) => { 
                          e.stopPropagation(); 
                          if (onViewDetails) onViewDetails(evento.id, titulo); 
                        }}
                      >
                        Ver Detalhes
                      </button>

                      <button 
                        className="btn-quero-ajudar" 
                        onClick={(e) => { 
                          e.stopPropagation(); 
                          if (onParticipar) onParticipar(evento.id); 
                        }}
                        style={isConfirmed ? { backgroundColor: '#fee2e2', color: '#dc2626' } : {}}
                      >
                        {isConfirmed ? 'Cancelar inscrição' : 'Quero Ajudar'}
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
            {filteredEvents.length === 0 && !isLoading && (
              <p className="sheet-msg flex items-center justify-center gap-2">
                <SearchX aria-hidden="true" className="w-4 h-4" />
                Nenhum projeto ativo encontrado.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default EventMap;
