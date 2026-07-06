import { useEffect, useRef, useState } from 'react'

function AddressAutocomplete({ value, onChange, onSelect, placeholder = 'Rua, Bairro, Cidade, Estado' }) {
  const [suggestions, setSuggestions] = useState([])
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const requestIdRef = useRef(0)

  useEffect(() => {
    const query = value.trim()

    if (query.length < 3) {
      return undefined
    }

    const timeoutId = setTimeout(async () => {
      const requestId = requestIdRef.current + 1
      requestIdRef.current = requestId
      setIsLoading(true)

      try {
        const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&addressdetails=1&limit=5&countrycodes=br&q=${encodeURIComponent(query)}`
        const response = await fetch(url, {
          headers: {
            'Accept-Language': 'pt-BR',
          },
        })
        const data = await response.json()

        if (requestIdRef.current !== requestId) {
          return
        }

        const normalizedSuggestions = Array.isArray(data)
          ? data
              .map((item) => ({
                id: item.place_id,
                label: item.display_name || item.name || '',
                latitude: Number(item.lat),
                longitude: Number(item.lon),
              }))
              .filter((item) => item.label && Number.isFinite(item.latitude) && Number.isFinite(item.longitude))
          : []

        setSuggestions(normalizedSuggestions)
      } catch {
        if (requestIdRef.current === requestId) {
          setSuggestions([])
        }
      } finally {
        if (requestIdRef.current === requestId) {
          setIsLoading(false)
        }
      }
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [value])

  const handleSelect = (suggestion) => {
    onChange(suggestion.label)
    onSelect?.(suggestion)
    setSuggestions([])
    setIsOpen(false)
  }

  const query = value.trim()
  const visibleSuggestions = query.length >= 3 ? suggestions : []
  const showSuggestions = isOpen && visibleSuggestions.length > 0
  const showEmptyState = isOpen && !isLoading && query.length >= 3 && visibleSuggestions.length === 0

  return (
    <div className="address-autocomplete">
      <div className="address-input-shell">
        <input
          type="text"
          placeholder={placeholder}
          aria-label="Buscar endereço do projeto"
          value={value}
          onChange={(event) => {
            onChange(event.target.value)
            setIsOpen(true)
          }}
          onFocus={() => setIsOpen(true)}
          onBlur={() => {
            window.setTimeout(() => setIsOpen(false), 150)
          }}
          autoComplete="off"
        />
        {isLoading && <small className="form-note" role="status" aria-live="polite">Buscando sugestões de endereço...</small>}
      </div>

      {showSuggestions && (
        <ul className="address-suggestions" role="listbox" aria-label="Sugestões de endereço">
          {visibleSuggestions.map((suggestion) => (
            <li key={`${suggestion.id}-${suggestion.label}`}>
              <button
                type="button"
                className="address-suggestion"
                aria-label={`Selecionar endereço ${suggestion.label}`}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => handleSelect(suggestion)}
              >
                <strong>{suggestion.label}</strong>
              </button>
            </li>
          ))}
        </ul>
      )}

      {showEmptyState && <small className="form-note">Nenhum endereço encontrado. Tente informar bairro, cidade e estado.</small>}
    </div>
  )
}

export default AddressAutocomplete
