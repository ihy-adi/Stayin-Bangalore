import type {
  Property, PropertyMedia, Amenity, PropertyAmenity,
  Review, User, FlatmatePost, SavedProperty
} from '@prisma/client'

export type PropertyWithRelations = Property & {
  media: PropertyMedia[]
  amenities: (PropertyAmenity & { amenity: Amenity })[]
  reviews: (Review & { user: Pick<User, 'id' | 'name' | 'image'> })[]
  owner: Pick<User, 'id' | 'name' | 'image'>
  _count?: { reviews: number; savedBy: number }
}

export type PropertyCard = {
  id: string
  title: string
  propertyType: string
  area: string
  rentAmount: number
  depositAmount: number | null
  roomType: string | null
  hasAc: boolean | null
  furnishing: string | null
  foodIncluded: boolean | null
  genderPreference: string
  isAvailable: boolean
  isVerified: boolean
  latitude: number | null
  longitude: number | null
  availableFrom: Date | string | null
  media: Pick<PropertyMedia, 'url' | 'caption' | 'isPrimary'>[]
  amenities: (PropertyAmenity & { amenity: Pick<Amenity, 'name'> })[]
  _count: { reviews: number }
  avgRating?: number
  savedByCurrentUser?: boolean
}

export type FlatmatePostWithRelations = FlatmatePost & {
  user: Pick<User, 'id' | 'name' | 'image'>
  property?: Pick<Property, 'id' | 'title' | 'area' | 'rentAmount'> & {
    media: Pick<PropertyMedia, 'url' | 'isPrimary'>[]
  }
}

export interface SearchFilters {
  query?: string
  propertyType?: string[]
  minPrice?: number
  maxPrice?: number
  area?: string
  hasAc?: boolean
  foodIncluded?: boolean
  roomType?: string
  furnishing?: string
  genderPreference?: string
  amenities?: string[]
  sortBy?: 'price_asc' | 'price_desc' | 'rating' | 'newest' | 'distance'
  userLat?: number
  userLng?: number
}

// Extend NextAuth types
declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
      role: string
    }
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    role: string
  }
}
