'use client'

import { useState, useEffect, useRef } from 'react'
import { ChatMessage, UserMessage, AssistantMessage } from '@/lib/types'
import { searchVenues } from '@/lib/venue-service'
import SearchBar from '@/components/SearchBar'
import ChatMessageBubble from '@/components/ChatMessageBubble'
import TypingIndicator from '@/components/TypingIndicator'

const exampleQueries = [
  'I need a place for 50 people in CBD',
  'Looking for a rooftop venue with parking',
  'Budget meeting room for my small team',
  'Luxury wedding venue for 200 guests',
  'Conference center with catering in Marina Bay',
  'Hari Raya open house venue in Bugis',
]

export default function HomePage() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  const handleSearch = async (query: string) => {
    const userMsg: UserMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      query,
      timestamp: Date.now(),
    }
    setMessages((prev) => [...prev, userMsg])
    setIsLoading(true)

    try {
      const venues = await searchVenues(query)
      const assistantMsg: AssistantMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        venues,
        error: null,
        timestamp: Date.now(),
      }
      setMessages((prev) => [...prev, assistantMsg])
    } catch {
      const assistantMsg: AssistantMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        venues: [],
        error: 'Search failed. Please try again.',
        timestamp: Date.now(),
      }
      setMessages((prev) => [...prev, assistantMsg])
    } finally {
      setIsLoading(false)
    }
  }

  const handleNewSearch = () => {
    setMessages([])
    setIsLoading(false)
  }

  return (
    <div className="flex flex-col h-screen bg-white">
      {/* Header */}
      <header className="flex-none border-b border-gray-200 bg-white px-4 py-3 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-gray-900">Venue Discovery</h1>
          <p className="text-xs text-gray-500">AI-powered venue finder</p>
        </div>
        {messages.length > 0 && (
          <button
            onClick={handleNewSearch}
            className="px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200"
          >
            New Search
          </button>
        )}
      </header>

      {/* Scrollable message thread */}
      <main className="flex-1 overflow-y-auto">
        {messages.length === 0 && !isLoading ? (
          /* Greeting screen */
          <div className="flex flex-col items-center justify-center h-full gap-6 px-4 py-12">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">What can I help you find?</h2>
              <p className="text-gray-500 max-w-md">
                Describe the venue you need in your own words and I&apos;ll find the best matches for you.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-lg">
              {exampleQueries.map((q, i) => (
                <button
                  key={i}
                  onClick={() => handleSearch(q)}
                  className="text-left text-sm px-4 py-3 bg-gray-50 text-gray-700 rounded-xl hover:bg-gray-100 border border-gray-200 transition-colors duration-200"
                >
                  &ldquo;{q}&rdquo;
                </button>
              ))}
            </div>
          </div>
        ) : (
          /* Conversation thread */
          <div className="max-w-4xl mx-auto px-4 py-6">
            {messages.map((msg) => (
              <ChatMessageBubble key={msg.id} message={msg} />
            ))}
            {isLoading && <TypingIndicator />}
            <div ref={messagesEndRef} />
          </div>
        )}
      </main>

      {/* Pinned input */}
      <div className="flex-none border-t border-gray-200 bg-white px-4 py-3">
        <div className="max-w-4xl mx-auto">
          <SearchBar onSearch={handleSearch} isLoading={isLoading} />
        </div>
      </div>
    </div>
  )
}
