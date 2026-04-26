'use client'

import { useState, useEffect, useCallback, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { List, Map, Loader2, MapPin } from 'lucide-react'
import { ListingCard } from '@/components/listings/ListingCard'
import { ListingFilters } from '@/components/listings/ListingFilters'
import { MapView } from '@/components/map/MapView'
import { Button } from '@/components/ui/Button'
import { haversineDistance } from '@/lib/utils'
import type { PropertyCard, SearchFilters } from '@/types'

function ExploreContent() {
  const searchParams = useSearchParams()

  const [view, setView] = useState<'list' | 'map'>('list')
  const [properties, setProperties] = useState<PropertyCard[]>([])
  const [loading, setLoading] = useState(true)
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | undefined>()

  // Parse filters from URL
  const [filters, setFilters] = useState<SearchFilters>(() => ({
    query: searchParams.get('q') ?? undefined,
    propertyType: searchParams.get('propertyType') ? [searchParams.get('propertyType')!] : undefined,
    area: searchParams.get('area') ?? undefined,
    minPrice: searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : undefined,
    maxPrice: searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : undefined,
    hasAc: searchParams.get('hasAc') === 'true' || undefined,
    foodIncluded: searchParams.get('foodIncluded') === 'true' || undefined,
    roomType: searchParams.get('roomType') ?? undefined,
    sortBy: (searchParams.get('sortBy') as SearchFilters['sortBy']) ?? 'newest',
  }))

  const fetchListings = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (filters.query) params.set('q', filters.query)
      if (filters.propertyType?.length) params.set('propertyType', filters.propertyType.join(','))
      if (filters.area) params.set('area', filters.area)
      if (filters.minPrice) params.set('minPrice', String(filters.minPrice))
      if (filters.maxPrice) params.set('maxPrice', String(filters.maxPrice))
      if (filters.hasAc) params.set('hasAc', 'true')
      if (filters.foodIncluded) params.set('foodIncluded', 'true')
      if (filters.roomType) params.set('roomType', filters.roomType)
      if (filters.furnishing) params.set('furnishing', filters.furnishing)
      if (filters.genderPreference) params.set('genderPreference', filters.genderPreference)
      if (filters.sortBy && filters.sortBy !== 'distance') params.set('sortBy', filters.sortBy)

      const res = await fetch(`/api/listings?${params.toString()}`)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      let data: PropertyCard[] = await res.json()

      // Client-side distance sort
      if (filters.sortBy === 'distance' && userLocation) {
        data = data.sort((a, b) => {
          const da = haversineDistance(userLocation.lat, userLocation.lng, Number(a.latitude), Number(a.longitude))
          const db = haversineDistance(userLocation.lat, userLocation.lng, Number(b.latitude), Number(b.longitude))
          return da - db
        })
      }

      setProperties(data)
    } catch (err) {
      console.error('Failed to fetch listings', err)
      setProperties([])
    } finally {
      setLoading(false)
    }
  }, [filters, userLocation])

  useEffect(() => { fetchListings() }, [fetchListings])

  function handleUserLocation(loc: { lat: number; lng: number }) {
    setUserLocation(loc)
    if (filters.sortBy === 'distance') fetchListings()
  }

  return (
    <>
      <ListingFilters filters={filters} onChange={setFilters} resultCount={properties.length} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* View toggle */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-bold text-gray-900">
            {filters.area ? `Stays in ${filters.area}` : 'All Listings in Bangalore'}
          </h1>
          <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-xl p-1">
            <button
              onClick={() => setView('list')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                view === 'list' ? 'bg-gray-900 text-white' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <List className="h-4 w-4" /> List
            </button>
            <button
              onClick={() => setView('map')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                view === 'map' ? 'bg-gray-900 text-white' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Map className="h-4 w-4" /> Map
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <Loader2 className="h-8 w-8 text-brand-600 animate-spin mx-auto mb-3" />
              <p className="text-sm text-gray-500">Finding stays for you…</p>
            </div>
          </div>
        ) : view === 'list' ? (
          properties.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {properties.map((p) => <ListingCard key={p.id} property={p} />)}
            </div>
          ) : (
            <div className="text-center py-20">
              <MapPin className="h-12 w-12 text-gray-200 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-700">No listings found</h3>
              <p className="text-sm text-gray-400 mt-1">Try adjusting your filters or search area</p>
              <Button variant="outline" className="mt-4" onClick={() => setFilters({ sortBy: 'newest' })}>
                Clear Filters
              </Button>
            </div>
          )
        ) : (
          <div className="h-[calc(100vh-220px)] min-h-96 rounded-2xl overflow-hidden">
            <MapView
              properties={properties}
              userLocation={userLocation}
              onUserLocation={handleUserLocation}
            />
          </div>
        )}
      </div>
    </>
  )
}

export default function ExplorePage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-brand-600" /></div>}>
      <ExploreContent />
    </Suspense>
  )
}
