export interface Venue {
  id: number
  name: string
  address: string
  capacity: number
  url: string
  image_url?: string
  contact_person?: string
  phone_number?: string
  description?: string
  amenities?: string[]
  area?: string
  price_tier?: number
  search_vector?: string
  created_at?: string
}

export interface SearchParams {
  capacity_min?: number
  capacity_max?: number
  location_keywords?: string[]
  amenities?: string[]
  price_tier?: number
  search_terms?: string[]
}

export interface ParsedQuery {
  query: string
  params: SearchParams
  raw_input: string
}

export type MessageRole = 'user' | 'assistant'

export interface UserMessage {
  id: string
  role: 'user'
  query: string
  timestamp: number
}

export interface AssistantMessage {
  id: string
  role: 'assistant'
  venues: Venue[]
  error: string | null
  timestamp: number
}

export type ChatMessage = UserMessage | AssistantMessage