import { Venue } from '@/lib/types'
import { MapPin, Users, Phone, User, ExternalLink } from 'lucide-react'
import Image from 'next/image'

interface VenueCardProps {
  venue: Venue
}

export default function VenueCard({ venue }: VenueCardProps) {
  const handleBookNow = () => {
    window.open(venue.url, '_blank', 'noopener,noreferrer')
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
      {/* Venue Image */}
      <div className="relative h-48 w-full">
        {venue.image_url ? (
          <Image
            src={venue.image_url}
            alt={venue.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
            <div className="text-gray-400 text-center">
              <MapPin className="w-12 h-12 mx-auto mb-2" />
              <p className="text-sm">No image available</p>
            </div>
          </div>
        )}
      </div>

      {/* Venue Information */}
      <div className="p-4">
        {/* Venue Name */}
        <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
          {venue.name}
        </h3>

        {/* Address */}
        <div className="flex items-start gap-2 mb-3">
          <MapPin className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-gray-600 line-clamp-2">{venue.address}</p>
        </div>

        {/* Capacity */}
        <div className="flex items-center gap-2 mb-3">
          <Users className="w-4 h-4 text-gray-500" />
          <p className="text-sm text-gray-600">
            Capacity: <span className="font-medium text-gray-900">{venue.capacity} people</span>
          </p>
        </div>

        {/* Contact Information */}
        <div className="space-y-2 mb-4">
          {venue.contact_person && (
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-gray-500" />
              <p className="text-sm text-gray-600">{venue.contact_person}</p>
            </div>
          )}
          
          {venue.phone_number && (
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-gray-500" />
              <p className="text-sm text-gray-600">{venue.phone_number}</p>
            </div>
          )}
        </div>

        {/* Amenities */}
        {venue.amenities && venue.amenities.length > 0 && (
          <div className="mb-4">
            <div className="flex flex-wrap gap-1">
              {venue.amenities.slice(0, 3).map((amenity, index) => (
                <span
                  key={index}
                  className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full"
                >
                  {amenity.replace('_', ' ')}
                </span>
              ))}
              {venue.amenities.length > 3 && (
                <span className="inline-block bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
                  +{venue.amenities.length - 3} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* Description */}
        {venue.description && (
          <p className="text-sm text-gray-600 mb-4 line-clamp-3">
            {venue.description}
          </p>
        )}

        {/* Book Now Button */}
        <button
          onClick={handleBookNow}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
        >
          <span>Book Now</span>
          <ExternalLink className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}