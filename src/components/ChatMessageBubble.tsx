'use client'

import { ChatMessage } from '@/lib/types'
import VenueCard from './VenueCard'

interface ChatMessageBubbleProps {
  message: ChatMessage
}

export default function ChatMessageBubble({ message }: ChatMessageBubbleProps) {
  if (message.role === 'user') {
    return (
      <div className="flex justify-end mb-4">
        <div className="max-w-[70%] bg-gray-900 text-white rounded-2xl rounded-tr-sm px-4 py-3">
          <p className="text-sm whitespace-pre-wrap">{message.query}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex justify-start mb-4">
      <div className="max-w-[92%] bg-gray-100 rounded-2xl rounded-tl-sm px-4 py-3">
        {message.error ? (
          <p className="text-sm text-red-600">{message.error}</p>
        ) : (
          <>
            <p className="text-sm text-gray-700 mb-3">
              {message.venues.length === 0
                ? 'No venues matched your search. Try a different description.'
                : `Here are ${message.venues.length} venue${message.venues.length !== 1 ? 's' : ''} I found for you:`}
            </p>
            {message.venues.length > 0 && (
              <div className="flex gap-4 overflow-x-auto pb-2 -mx-1 px-1 snap-x snap-mandatory">
                {message.venues.map((venue) => (
                  <div key={venue.id} className="flex-none w-72 snap-start">
                    <VenueCard venue={venue} />
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
