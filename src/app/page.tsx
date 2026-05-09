'use client'

import { useState, useEffect, useCallback } from 'react'
import { Venue } from '@/lib/types'
import { searchVenues, getAllVenues } from '@/lib/venue-service'
import SearchBar from '@/components/SearchBar'
import VenueGrid from '@/components/VenueGrid'

export default function HomePage() {
  const [venues, setVenues] = useState<Venue[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [hasSearched, setHasSearched] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadAllVenues = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const allVenues = await getAllVenues()
      setVenues(allVenues)
      setSearchQuery('')
    } catch (err) {
      setError('Failed to load venues. Please check your Supabase configuration.')
      console.error('Error loading venues:', err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    loadAllVenues()
  }, [])

  const handleSearch = async (query: string) => {
    setIsLoading(true)
    setError(null)
    setSearchQuery(query)
    setHasSearched(true)
    try {
      const searchResults = await searchVenues(query)
      setVenues(searchResults)
    } catch (err) {
      setError('Search failed. Please try again.')
      console.error('Error searching venues:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleClearSearch = () => {
    setHasSearched(false)
    loadAllVenues()
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Sticky search header */}
      <div className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="text-center mb-4">
            <h1 className="text-2xl font-bold text-gray-900">Venue Discovery & Booking</h1>
            <p className="text-sm text-gray-500">Your AI-powered venue finder</p>
          </div>
          <SearchBar
            onSearch={handleSearch}
            isLoading={isLoading}
            hasSearched={hasSearched}
          />
        </div>
      </div>

      {/* Results area */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6">
        {/* Error */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex">
              <svg className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <p className="text-sm text-red-700 mt-1">{error}</p>
                {error.includes('Supabase') && (
                  <p className="text-xs text-red-600 mt-2">
                    Make sure to set up your Supabase project and update the environment variables in .env.local
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Results header */}
        {(hasSearched || venues.length > 0) && !error && (
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                {searchQuery ? `Results for "${searchQuery}"` : 'All Venues'}
              </h2>
              <p className="text-sm text-gray-500 mt-0.5">
                {isLoading ? 'Searching...' : `${venues.length} venue${venues.length !== 1 ? 's' : ''} found`}
              </p>
            </div>
            {searchQuery && (
              <button
                onClick={handleClearSearch}
                className="px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors duration-200"
              >
                Show all venues
              </button>
            )}
          </div>
        )}

        {/* Venue grid */}
        <VenueGrid venues={venues} isLoading={isLoading} />

        {/* Empty state before any interaction */}
        {!isLoading && !hasSearched && venues.length === 0 && !error && (
          <div className="text-center py-12">
            <div className="max-w-2xl mx-auto">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Welcome to Venue Discovery!</h3>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-left">
                <h4 className="font-medium text-yellow-800 mb-3">Setup Instructions:</h4>
                <ol className="text-sm text-yellow-700 space-y-2 list-decimal list-inside">
                  <li>Create a Supabase project at <a href="https://supabase.com" className="underline" target="_blank" rel="noopener noreferrer">supabase.com</a></li>
                  <li>Update the environment variables in <code className="bg-yellow-100 px-1 rounded">.env.local</code></li>
                  <li>Run the SQL setup script in your Supabase SQL editor</li>
                  <li>The app will automatically load sample venue data</li>
                </ol>
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className="bg-white border-t border-gray-200 mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 text-center text-sm text-gray-500">
          <p>Venue Discovery & Booking Platform</p>
          <p className="mt-1">Powered by Next.js, Supabase, and Natural Language Processing</p>
        </div>
      </footer>
    </div>
  )
}
