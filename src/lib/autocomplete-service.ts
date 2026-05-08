import { Venue } from './types'
import { createClient } from './supabase/client'

export interface AutocompleteResult {
  type: 'venue' | 'location' | 'amenity' | 'capacity'
  text: string
  description: string
  venue?: Venue
}

export async function getAutocompleteResults(query: string): Promise<AutocompleteResult[]> {
  if (!query || query.length < 2) return []

  const supabase = createClient()
  const results: AutocompleteResult[] = []
  const lowerQuery = query.toLowerCase()

  try {
    // Get all venues for matching
    const { data: venues, error } = await supabase
      .from('venues')
      .select('*')
      .limit(20)

    if (error || !venues) return []

    // Match venue names
    venues.forEach(venue => {
      if (venue.name.toLowerCase().includes(lowerQuery)) {
        results.push({
          type: 'venue',
          text: venue.name,
          description: `${venue.capacity} people • ${venue.area}`,
          venue
        })
      }
    })

    // Match locations/areas
    const uniqueAreas = [...new Set(venues.map(v => v.area).filter(Boolean))]
    uniqueAreas.forEach(area => {
      if (area && area.toLowerCase().includes(lowerQuery)) {
        const venueCount = venues.filter(v => v.area === area).length
        results.push({
          type: 'location',
          text: `Venues in ${area}`,
          description: `${venueCount} venue${venueCount !== 1 ? 's' : ''} available`
        })
      }
    })

    // Match amenities
    const allAmenities = venues.flatMap(v => v.amenities || [])
    const uniqueAmenities = [...new Set(allAmenities)]
    uniqueAmenities.forEach(amenity => {
      if (amenity.toLowerCase().includes(lowerQuery)) {
        const venueCount = venues.filter(v => v.amenities?.includes(amenity)).length
        results.push({
          type: 'amenity',
          text: `Venues with ${amenity.replace('_', ' ')}`,
          description: `${venueCount} venue${venueCount !== 1 ? 's' : ''} available`
        })
      }
    })

    // Match capacity numbers
    const capacityMatch = query.match(/(\d+)/)
    if (capacityMatch) {
      const capacity = parseInt(capacityMatch[1])
      const suitableVenues = venues.filter(v => v.capacity >= capacity)
      if (suitableVenues.length > 0) {
        results.push({
          type: 'capacity',
          text: `Venues for ${capacity}+ people`,
          description: `${suitableVenues.length} venue${suitableVenues.length !== 1 ? 's' : ''} available`
        })
      }
    }

    // Remove duplicates and limit results
    const uniqueResults = results.filter((result, index, self) => 
      index === self.findIndex(r => r.text === result.text)
    )

    return uniqueResults.slice(0, 6)
  } catch (error) {
    console.error('Error getting autocomplete results:', error)
    return []
  }
}