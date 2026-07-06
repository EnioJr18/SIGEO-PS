import { useEffect, useRef, useState } from 'react'
import { geocodificarEndereco } from './api'

function AddressAutocomplete({ value, onChange, onSelect, placeholder = 'Rua, Bairro, Cidade, Estado' }) {
  const [suggestions, setSuggestions] = useState([])
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [searchError, setSearchError] = useState('')
  const requestIdRef = useRef(0)
  const cacheRef = useRef(new Map())
  const skipNextSearchRef = useRef(false)

  useEffect(() => {
    const query = value.trim()
    const normalizedQuery = query.toLowerCase()

    if (skipNextSearchRef.current) {
      skipNextSearchRef.current = false
      return undefined
    }

    if (query.length < 3) {
      return undefined
    }

    const timeoutId = setTimeout(async () => {
      const requestId = requestIdRef.current + 1
      requestIdRef.current = requestId

      if (cacheRef.current.has(normalizedQuery)) {
        setSuggestions(cacheRef.current.get(normalizedQuery))
        setSearchError('')
        setIsLoading(false)
        return
      }

      setIsLoading(true)
      setSearchError('')

      try {
        const data = await geocodificarEndereco(query)

        if (requestIdRef.current !== requestId) {
          return
        }

        const normalizedSuggestions = Array.isArray(data)
          ? data
              .map((item) => ({
                id: item.place_id,
                label: item.label || item.display_name || item.name || '',
                latitude: Number(item.latitude ?? item.lat),
                longitude: Number(item.longitude ?? item.lon),
              }))
              .filter((item) => item.label && Number.isFinite(item.latitude) && Number.isFinite(item.longitude))
          : []

        cacheRef.current.set(normalizedQuery, normalizedSuggestions)
        setSuggestions(normalizedSuggestions)
      } catch (error) {
        if (requestIdRef.current === requestId) {
          setSuggestions([])
          setSearchError(error.message || 'Não foi possível buscar endereços agora.')
        }
      } finally {
        if (requestIdRef.current === requestId) {
          setIsLoading(false)
        }
      }
    }, 500)

    return () => clearTimeout(timeoutId)
  }, [value])

  const handleSelect = (suggestion) => {
    skipNextSearchRef.current = true
    onChange(suggestion.label)
    onSelect?.(suggestion)
    setSuggestions([])
    setSearchError('')
    setIsLoading(false)
    setIsOpen(false)
  }

  const query = value.trim()
  const visibleSuggestions = query.length >= 3 ? suggestions : []
  const showSuggestions = isOpen && visibleSuggestions.length > 0
  const showEmptyState = isOpen && !isLoading && !searchError && query.length >= 3 && visibleSuggestions.length === 0

  return (
    <div className="address-autocomplete">
      <div className="address-input-shell">
        <input
          type="text"
          placeholder={placeholder}
          aria-label="Buscar endereço do projeto"
          value={value}
          onChange={(event) => {
            const nextValue = event.target.value
            onChange(nextValue)
            if (nextValue.trim().length < 3) {
              setSuggestions([])
              setSearchError('')
            }
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

      {searchError && <small className="form-note" role="alert">{searchError}</small>}
      {showEmptyState && (
        <small className="form-note">
          Nenhum endereço encontrado. Tente buscar por cidade, bairro ou rua próxima. Alguns pontos de referência podem não estar cadastrados no mapa. Exemplo: São Miguel dos Campos, AL.
        </small>
      )}
    </div>
  )
}

export default AddressAutocomplete
