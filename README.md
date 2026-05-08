# Venue Discovery & Booking Platform

A Next.js application that enables users to find and book venues using natural language search powered by Supabase and PostgreSQL full-text search.

## Features

- **Natural Language Search**: Search for venues using conversational queries like "Find me a place for 50 people in CBD" or "Rooftop venue with parking"
- **Smart Query Parsing**: Automatically extracts capacity, location, amenities, and price preferences from user input
- **PostgreSQL Full-Text Search**: Leverages Supabase's built-in search capabilities for intelligent matching
- **Responsive Design**: Clean, modern UI built with Tailwind CSS
- **Direct Booking**: One-click booking that redirects to venue booking URLs

## Tech Stack

- **Frontend**: Next.js 14+, React, TypeScript
- **Backend**: Supabase (PostgreSQL)
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Search**: PostgreSQL full-text search with tsvector

## Quick Start

### 1. Clone and Install

```bash
git clone <repository-url>
cd venue-discovery-app
npm install
```

### 2. Set up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Copy your project URL and anon key
3. Update `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Set up Database

Run this SQL in your Supabase SQL Editor:

```sql
-- Create venues table with enhanced schema
CREATE TABLE IF NOT EXISTS public.venues (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  capacity INTEGER NOT NULL,
  url TEXT NOT NULL,
  image_url TEXT,
  contact_person TEXT,
  phone_number TEXT,
  description TEXT,
  amenities TEXT[],
  area TEXT,
  price_tier INTEGER CHECK (price_tier IN (1, 2, 3)), -- 1=budget, 2=mid-range, 3=premium
  search_vector tsvector,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS venues_search_vector_idx ON public.venues USING gin(search_vector);
CREATE INDEX IF NOT EXISTS venues_capacity_idx ON public.venues (capacity);
CREATE INDEX IF NOT EXISTS venues_area_idx ON public.venues (area);
CREATE INDEX IF NOT EXISTS venues_price_tier_idx ON public.venues (price_tier);
CREATE INDEX IF NOT EXISTS venues_amenities_idx ON public.venues USING gin(amenities);

-- Create function to update search vector
CREATE OR REPLACE FUNCTION update_venues_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector := to_tsvector('english', 
    COALESCE(NEW.name, '') || ' ' ||
    COALESCE(NEW.description, '') || ' ' ||
    COALESCE(NEW.area, '') || ' ' ||
    COALESCE(array_to_string(NEW.amenities, ' '), '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update search vector
DROP TRIGGER IF EXISTS update_venues_search_vector_trigger ON public.venues;
CREATE TRIGGER update_venues_search_vector_trigger
  BEFORE INSERT OR UPDATE ON public.venues
  FOR EACH ROW
  EXECUTE FUNCTION update_venues_search_vector();

-- Enable Row Level Security
ALTER TABLE public.venues ENABLE ROW LEVEL SECURITY;

-- Create policy to allow public read access
DROP POLICY IF EXISTS "Allow public read access" ON public.venues;
CREATE POLICY "Allow public read access" ON public.venues
  FOR SELECT
  USING (true);

-- Insert sample venue data
INSERT INTO public.venues (
  name, address, capacity, url, image_url, contact_person, phone_number,
  description, amenities, area, price_tier
) VALUES
  (
    'Marina Bay Conference Center',
    '10 Marina Boulevard, Singapore 018983',
    200,
    'https://marinabaycc.com/book',
    'https://images.unsplash.com/photo-1511578314322-379afb476865?w=800',
    'Sarah Johnson',
    '+65 6234 5678',
    'Premium waterfront conference center with stunning city views. Perfect for corporate events, conferences, and large meetings.',
    ARRAY['wifi', 'parking', 'catering', 'av_equipment', 'waterfront_view'],
    'Marina Bay',
    3
  ),
  (
    'CBD Business Hub',
    '50 Raffles Place, Singapore 048623',
    50,
    'https://cbdbusinesshub.sg/reserve',
    'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800',
    'Michael Chen',
    '+65 6345 7890',
    'Modern business center in the heart of CBD. Ideal for meetings, presentations, and corporate training sessions.',
    ARRAY['wifi', 'parking', 'av_equipment', 'coffee_service'],
    'CBD',
    2
  ),
  (
    'Rooftop Garden Venue',
    '123 Orchard Road, Singapore 238858',
    80,
    'https://rooftopgarden.com.sg/booking',
    'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800',
    'Emily Tan',
    '+65 6456 8901',
    'Beautiful rooftop venue with garden setting. Perfect for cocktail parties, networking events, and celebrations.',
    ARRAY['rooftop', 'garden', 'bar_service', 'outdoor_seating', 'city_view'],
    'Orchard',
    3
  ),
  (
    'Budget Meeting Room Central',
    '456 Bugis Street, Singapore 188735',
    20,
    'https://budgetmeeting.sg/book-now',
    'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800',
    'David Wong',
    '+65 6567 9012',
    'Affordable meeting space for small teams and startups. Clean, functional, and well-equipped.',
    ARRAY['wifi', 'whiteboard', 'coffee_service'],
    'Bugis',
    1
  ),
  (
    'Luxury Ballroom Palace',
    '789 Sentosa Cove, Singapore 098234',
    300,
    'https://luxuryballroom.com/reservations',
    'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800',
    'Jennifer Lim',
    '+65 6678 0123',
    'Opulent ballroom perfect for weddings, galas, and high-end corporate events. Features crystal chandeliers and marble floors.',
    ARRAY['catering', 'valet_parking', 'av_equipment', 'dance_floor', 'bridal_suite'],
    'Sentosa',
    3
  )
ON CONFLICT (id) DO NOTHING;
```

### 4. Run the Application

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see the application.

## Natural Language Search Examples

The application can understand and process various types of natural language queries:

### Capacity-based searches:
- "Find me a place for 50 people"
- "Small meeting room for team"
- "Large venue for 200 guests"

### Location-based searches:
- "Venue in CBD"
- "Something near Marina Bay"
- "Downtown location"

### Amenity-based searches:
- "Rooftop venue with parking"
- "Place with catering and WiFi"
- "Outdoor space with garden"

### Price-based searches:
- "Budget-friendly venue"
- "Luxury ballroom"
- "Affordable meeting space"

### Combined searches:
- "Find me a luxury venue for 100 people in Marina Bay with catering"
- "Budget meeting room for small team in CBD with parking"

## Architecture

### Search Processing Pipeline:
1. **Natural Language Input** → User types conversational query
2. **Text Parsing** → Extract capacity, location, amenities, price tier
3. **Query Building** → Convert to Supabase filters
4. **Database Search** → PostgreSQL full-text search + filters
5. **Results Display** → Responsive grid with venue cards

### Key Components:
- `SearchBar` - Natural language input interface
- `VenueCard` - Individual venue display with booking
- `VenueGrid` - Responsive layout for results
- `search-parser` - Natural language processing logic
- `venue-service` - Supabase integration layer

## Deployment

### Vercel (Recommended)
```bash
npm run build
# Deploy to Vercel
```

### Environment Variables for Production:
```env
NEXT_PUBLIC_SUPABASE_URL=your_production_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_production_anon_key
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details.