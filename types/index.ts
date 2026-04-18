import type {
  Property, PropertyImage, Amenity, PropertyAmenity,
  Review, Comment, User, FlatmatePost, SavedListing
} from '@prisma/client'

export type PropertyWithRelations = Property & {
  images: PropertyImage[]
  amenities: (PropertyAmenity & { amenity: Amenity })[]
  reviews: (Review & { user: Pick<User, 'id' | 'name' | 'image'> })[]
  comments: (Comment & { user: Pick<User, 'id' | 'name' | 'image'> })[]
  createdBy: Pick<User, 'id' | 'name' | 'image'>
  _count?: { reviews: number; savedBy: number }
}

export type PropertyCard = Pick<
  Property,
  | 'id' | 'title' | 'stayType' | 'area' | 'price' | 'deposit'
  | 'roomType' | 'hasAC' | 'isFurnished' | 'foodIncluded'
  | 'genderPreference' | 'isAvailable' | 'isVerified'
  | 'latitude' | 'longitude' | 'availableFrom'
> & {
  images: Pick<PropertyImage, 'url' | 'alt' | 'isPrimary'>[]
  amenities: (PropertyAmenity & { amenity: Pick<Amenity, 'name' | 'icon'> })[]
  _count: { reviews: number }
  avgRating?: number
  savedByCurrentUser?: boolean
}

export type FlatmatePostWithRelations = FlatmatePost & {
  user: Pick<User, 'id' | 'name' | 'image'>
  property?: Pick<Property, 'id' | 'title' | 'area' | 'price'> & {
    images: Pick<PropertyImage, 'url' | 'isPrimary'>[]
  }
}

export interface SearchFilters {
  query?: string
  stayType?: string[]
  minPrice?: number
  maxPrice?: number
  area?: string
  hasAC?: boolean
  foodIncluded?: boolean
  roomType?: string
  isFurnished?: string
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
