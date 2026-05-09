'use client'

import { useState, useEffect, useRef } from 'react'
import { Search, Loader2, MapPin, Users, Star, Building } from 'lucide-react'
import { getAutocompleteResults, AutocompleteResult } from '@/lib/autocomplete-service'

interface SearchBarProps {
  onSearch: (query: string) => void
  isLoading?: boolean
  placeholder?: string
}

export default function SearchBar({
  onSearch,
  isLoading = false,
  placeholder = "Tell me what kind of venue you're looking for..."
}: SearchBarProps) {
  const [query, setQuery] = useState('')
  const [autocompleteResults, setAutocompleteResults] = useState<AutocompleteResult[]>([])
  const [showAutocomplete, setShowAutocomplete] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Debounced autocomplete search
  useEffect(() => {
    const timeoutId = setTimeout(async () => {
      if (query.length >= 2) {
        const results = await getAutocompleteResults(query)
        setAutocompleteResults(results)
        setShowAutocomplete(results.length > 0)
      } else {
        setAutocompleteResults([])
        setShowAutocomplete(false)
      }
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [query])

  // Close autocomplete when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowAutocomplete(false)
        setSelectedIndex(-1)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (selectedIndex >= 0 && autocompleteResults[selectedIndex]) {
      handleAutocompleteSelect(autocompleteResults[selectedIndex])
    } else if (query.trim()) {
      onSearch(query.trim())
      setQuery('')
      setShowAutocomplete(false)
    }
  }

  const handleAutocompleteSelect = (result: AutocompleteResult) => {
    setQuery(result.text)
    setShowAutocomplete(false)
    setSelectedIndex(-1)
    onSearch(result.text)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showAutocomplete || autocompleteResults.length === 0) {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        handleSubmit(e)
      }
      return
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex(prev => 
          prev < autocompleteResults.length - 1 ? prev + 1 : prev
        )
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1)
        break
      case 'Enter':
        e.preventDefault()
        if (selectedIndex >= 0) {
          handleAutocompleteSelect(autocompleteResults[selectedIndex])
        } else {
          handleSubmit(e)
        }
        break
      case 'Escape':
        setShowAutocomplete(false)
        setSelectedIndex(-1)
        break
    }
  }

  const getResultIcon = (type: AutocompleteResult['type']) => {
    switch (type) {
      case 'venue':
        return <Building className="h-4 w-4 text-blue-500" />
      case 'location':
        return <MapPin className="h-4 w-4 text-green-500" />
      case 'amenity':
        return <Star className="h-4 w-4 text-purple-500" />
      case 'capacity':
        return <Users className="h-4 w-4 text-orange-500" />
      default:
        return <Search className="h-4 w-4 text-gray-500" />
    }
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Search Form */}
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-200 focus-within:shadow-md focus-within:border-gray-300">
          <textarea
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={placeholder}
            disabled={isLoading}
            rows={1}
            className="block w-full px-4 py-4 text-black text-base border-0 rounded-2xl resize-none focus:ring-0 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed placeholder-gray-500"
            style={{ minHeight: '56px' }}
            onKeyDown={handleKeyDown}
            onFocus={() => {
              if (autocompleteResults.length > 0) {
                setShowAutocomplete(true)
              }
            }}
          />
          <div className="absolute right-2 bottom-2 flex items-center gap-2">
            {isLoading && (
              <Loader2 className="h-5 w-5 text-gray-400 animate-spin" />
            )}
            <button
              type="submit"
              disabled={isLoading || !query.trim()}
              className="p-2 bg-black text-white rounded-lg hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              <Search className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Autocomplete Dropdown */}
        {showAutocomplete && autocompleteResults.length > 0 && (
          <div 
            ref={dropdownRef}
            className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-2xl shadow-lg z-50 max-h-80 overflow-y-auto"
          >
            {autocompleteResults.map((result, index) => (
              <button
                key={`${result.type}-${result.text}`}
                type="button"
                onClick={() => handleAutocompleteSelect(result)}
                className={`w-full px-4 py-3 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none transition-colors duration-150 flex items-center gap-3 ${
                  index === selectedIndex ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                } ${
                  index === 0 ? 'rounded-t-2xl' : ''
                } ${
                  index === autocompleteResults.length - 1 ? 'rounded-b-2xl' : 'border-b border-gray-100'
                }`}
              >
                <div className="flex-shrink-0">
                  {getResultIcon(result.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900 truncate">
                    {result.text}
                  </div>
                  <div className="text-xs text-gray-500 truncate">
                    {result.description}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </form>
    </div>
  )
}