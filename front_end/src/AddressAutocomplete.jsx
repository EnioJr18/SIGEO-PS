import { useEffect, useRef, useState } from 'react'

function AddressAutocomplete({ value, onChange, placeholder = 'Rua, Bairro, Cidade, Estado' }) {
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

        setSuggestions(Array.isArray(data) ? data : [])
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
    onChange(suggestion.display_name || suggestion.name || value)
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
        {isLoading && <small className="form-note">Buscando sugestões de endereço...</small>}
      </div>

      {showSuggestions && (
        <ul className="address-suggestions" role="listbox" aria-label="Sugestões de endereço">
          {visibleSuggestions.map((suggestion) => (
            <li key={`${suggestion.place_id}-${suggestion.display_name}`}>
              <button
                type="button"
                className="address-suggestion"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => handleSelect(suggestion)}
              >
                <strong>{suggestion.display_name}</strong>
              </button>
            </li>
          ))}
        </ul>
      )}

      {showEmptyState && <small className="form-note">Nenhuma sugestão encontrada.</small>}
    </div>
  )
}

export default AddressAutocomplete
