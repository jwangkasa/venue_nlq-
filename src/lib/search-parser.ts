import { SearchParams } from './types'

// Keywords for different categories
const CAPACITY_KEYWORDS = {
  small: { min: 1, max: 20 },
  medium: { min: 21, max: 50 },
  large: { min: 51, max: 100 },
  huge: { min: 101, max: 500 }
}

const LOCATION_KEYWORDS = [
  'cbd', 'marina bay', 'orchard', 'bugis', 'chinatown', 'sentosa', 
  'tanjong pagar', 'east coast', 'downtown', 'city center', 'central'
]

const AMENITY_KEYWORDS = [
  'wifi', 'parking', 'rooftop', 'catering', 'av equipment', 'projector',
  'whiteboard', 'coffee', 'bar', 'outdoor', 'garden', 'waterfront',
  'heritage', 'modern', 'luxury', 'budget', 'cheap', 'affordable'
]

const PRICE_KEYWORDS = {
  budget: 1,
  cheap: 1,
  affordable: 1,
  'mid-range': 2,
  moderate: 2,
  premium: 3,
  luxury: 3,
  expensive: 3,
  fancy: 3,
  upscale: 3
}

export function parseNaturalLanguageQuery(input: string): SearchParams {
  const lowerInput = input.toLowerCase()
  const params: SearchParams = {}

  // Extract capacity numbers
  const capacityMatch = lowerInput.match(/(\d+)\s*(people|guests|persons|pax)/i)
  if (capacityMatch) {
    params.capacity_min = parseInt(capacityMatch[1])
  }

  // Check for capacity keywords
  Object.entries(CAPACITY_KEYWORDS).forEach(([keyword, range]) => {
    if (lowerInput.includes(keyword)) {
      params.capacity_min = range.min
      params.capacity_max = range.max
    }
  })

  // Extract location keywords
  const locationKeywords = LOCATION_KEYWORDS.filter(location => 
    lowerInput.includes(location)
  )
  if (locationKeywords.length > 0) {
    params.location_keywords = locationKeywords
  }

  // Extract amenities
  const amenities = AMENITY_KEYWORDS.filter(amenity => 
    lowerInput.includes(amenity)
  )
  if (amenities.length > 0) {
    params.amenities = amenities
  }

  // Extract price tier
  Object.entries(PRICE_KEYWORDS).forEach(([keyword, tier]) => {
    if (lowerInput.includes(keyword)) {
      params.price_tier = tier
    }
  })

  // Extract general search terms for full-text search
  const searchTerms: string[] = []
  
  // Add descriptive words
  const descriptiveWords = ['meeting', 'conference', 'event', 'party', 'wedding', 
    'corporate', 'team building', 'presentation', 'training', 'workshop']
  
  descriptiveWords.forEach(word => {
    if (lowerInput.includes(word)) {
      searchTerms.push(word)
    }
  })

  if (searchTerms.length > 0) {
    params.search_terms = searchTerms
  }

  return params
}

export function buildSupabaseQuery(params: SearchParams) {
  const conditions: string[] = []
  const queryParams: Record<string, string | number | string[]> = {}

  // Capacity filter
  if (params.capacity_min) {
    conditions.push('capacity >= $capacity_min')
    queryParams.capacity_min = params.capacity_min
  }

  if (params.capacity_max) {
    conditions.push('capacity <= $capacity_max')
    queryParams.capacity_max = params.capacity_max
  }

  // Location filter
  if (params.location_keywords && params.location_keywords.length > 0) {
    const locationConditions = params.location_keywords.map((_, index) => 
      `area ILIKE $location_${index}`
    )
    conditions.push(`(${locationConditions.join(' OR ')})`)
    
    params.location_keywords.forEach((location, index) => {
      queryParams[`location_${index}`] = `%${location}%`
    })
  }

  // Amenities filter
  if (params.amenities && params.amenities.length > 0) {
    conditions.push('amenities && $amenities')
    queryParams.amenities = params.amenities
  }

  // Price tier filter
  if (params.price_tier) {
    conditions.push('price_tier = $price_tier')
    queryParams.price_tier = params.price_tier
  }

  return {
    conditions: conditions.join(' AND '),
    params: queryParams,
    hasFullTextSearch: params.search_terms && params.search_terms.length > 0,
    searchTerms: params.search_terms
  }
}