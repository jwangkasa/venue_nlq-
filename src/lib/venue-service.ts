import { createClient } from './supabase/client'
import { Venue, SearchParams } from './types'
import { parseNaturalLanguageQuery, buildSupabaseQuery } from './search-parser'

export async function searchVenues(naturalLanguageQuery: string): Promise<Venue[]> {
  const supabase = createClient()
  
  // Parse the natural language input
  const searchParams = parseNaturalLanguageQuery(naturalLanguageQuery)
  
  // Build the Supabase query
  const { conditions, params, hasFullTextSearch, searchTerms } = buildSupabaseQuery(searchParams)
  
  try {
    let query = supabase
      .from('venues')
      .select('*')
    
    // Apply filters if we have conditions
    if (conditions) {
      // For now, we'll use individual filters since Supabase client doesn't support raw SQL conditions directly
      
      // Capacity filters
      if (searchParams.capacity_min) {
        query = query.gte('capacity', searchParams.capacity_min)
      }
      if (searchParams.capacity_max) {
        query = query.lte('capacity', searchParams.capacity_max)
      }
      
      // Location filters
      if (searchParams.location_keywords && searchParams.location_keywords.length > 0) {
        // Use OR condition for multiple locations
        const locationFilter = searchParams.location_keywords
          .map(location => `area.ilike.%${location}%`)
          .join(',')
        query = query.or(locationFilter)
      }
      
      // Amenities filter
      if (searchParams.amenities && searchParams.amenities.length > 0) {
        query = query.overlaps('amenities', searchParams.amenities)
      }
      
      // Price tier filter
      if (searchParams.price_tier) {
        query = query.eq('price_tier', searchParams.price_tier)
      }
    }
    
    // Add full-text search if we have search terms
    if (hasFullTextSearch && searchTerms && searchTerms.length > 0) {
      const searchQuery = searchTerms.join(' | ')
      query = query.textSearch('search_vector', searchQuery)
    }
    
    // Order by capacity (smaller venues first, then larger)
    query = query.order('capacity', { ascending: true })
    
    const { data, error } = await query
    
    if (error) {
      console.error('Error searching venues:', error)
      throw new Error('Failed to search venues')
    }
    
    return data || []
  } catch (error) {
    console.error('Error in searchVenues:', error)
    throw error
  }
}

export async function getAllVenues(): Promise<Venue[]> {
  const supabase = createClient()
  
  try {
    const { data, error } = await supabase
      .from('venues')
      .select('*')
      .order('name', { ascending: true })
    
    if (error) {
      console.error('Error fetching venues:', error)
      throw new Error('Failed to fetch venues')
    }
    
    return data || []
  } catch (error) {
    console.error('Error in getAllVenues:', error)
    throw error
  }
}

export async function getVenueById(id: number): Promise<Venue | null> {
  const supabase = createClient()
  
  try {
    const { data, error } = await supabase
      .from('venues')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) {
      console.error('Error fetching venue:', error)
      return null
    }
    
    return data
  } catch (error) {
    console.error('Error in getVenueById:', error)
    return null
  }
}