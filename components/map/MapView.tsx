'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { Loader2, MapPin, Navigation } from 'lucide-react'
import { formatPrice, stayTypeLabel } from '@/lib/utils'
import type { PropertyCard } from '@/types'
import Link from 'next/link'
import Image from 'next/image'

interface MapViewProps {
  properties: PropertyCard[]
  userLocation?: { lat: number; lng: number }
  onUserLocation?: (loc: { lat: number; lng: number }) => void
}

const BANGALORE_CENTER = { lat: 12.9716, lng: 77.5946 }

declare global {
  interface Window {
    mapboxgl: any
  }
}

export function MapView({ properties, userLocation, onUserLocation }: MapViewProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<any>(null)
  const markers = useRef<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedProperty, setSelectedProperty] = useState<PropertyCard | null>(null)
  const [locating, setLocating] = useState(false)

  useEffect(() => {
    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN
    if (!token || !mapContainer.current || map.current) return

    const script = document.createElement('script')
    script.src = 'https://api.mapbox.com/mapbox-gl-js/v3.2.0/mapbox-gl.js'
    script.onload = () => {
      const link = document.createElement('link')
      link.rel = 'stylesheet'
      link.href = 'https://api.mapbox.com/mapbox-gl-js/v3.2.0/mapbox-gl.css'
      document.head.appendChild(link)

      window.mapboxgl.accessToken = token
      map.current = new window.mapboxgl.Map({
        container: mapContainer.current!,
        style: 'mapbox://styles/mapbox/light-v11',
        center: [BANGALORE_CENTER.lng, BANGALORE_CENTER.lat],
        zoom: 11,
      })

      map.current.addControl(new window.mapboxgl.NavigationControl(), 'top-right')
      map.current.on('load', () => setLoading(false))
    }
    document.head.appendChild(script)

    return () => { map.current?.remove(); map.current = null }
  }, [])

  // Add property markers
  useEffect(() => {
    if (!map.current || loading) return

    markers.current.forEach((m) => m.remove())
    markers.current = []

    properties.forEach((property) => {
      const el = document.createElement('div')
      el.className = 'cursor-pointer'
      el.innerHTML = `
        <div class="bg-white border-2 border-brand-500 rounded-full px-2.5 py-1 shadow-md text-xs font-bold text-brand-700 hover:bg-brand-50 hover:scale-110 transition-transform whitespace-nowrap">
          ${formatPrice(property.price)}
        </div>
      `
      el.addEventListener('click', () => setSelectedProperty(property))

      const marker = new window.mapboxgl.Marker({ element: el, anchor: 'bottom' })
        .setLngLat([property.longitude, property.latitude])
        .addTo(map.current!)

      markers.current.push(marker)
    })
  }, [properties, loading])

  // Add user location marker
  useEffect(() => {
    if (!map.current || !userLocation || loading) return

    const el = document.createElement('div')
    el.innerHTML = `
      <div class="relative">
        <div class="h-4 w-4 bg-blue-500 border-2 border-white rounded-full shadow-lg"></div>
        <div class="absolute inset-0 h-4 w-4 bg-blue-500 rounded-full animate-ping opacity-75"></div>
      </div>
    `
    const marker = new window.mapboxgl.Marker({ element: el })
      .setLngLat([userLocation.lng, userLocation.lat])
      .addTo(map.current!)

    markers.current.push(marker)
  }, [userLocation, loading])

  function locateUser() {
    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude }
        onUserLocation?.(loc)
        map.current?.flyTo({ center: [loc.lng, loc.lat], zoom: 13 })
        setLocating(false)
      },
      () => setLocating(false)
    )
  }

  return (
    <div className="relative h-full w-full rounded-2xl overflow-hidden">
      <div ref={mapContainer} className="h-full w-full" />

      {loading && (
        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-8 w-8 text-brand-600 animate-spin mx-auto mb-2" />
            <p className="text-sm text-gray-500">Loading map…</p>
          </div>
        </div>
      )}

      {/* Locate me button */}
      <button
        onClick={locateUser}
        disabled={locating}
        className="absolute bottom-4 right-4 bg-white rounded-xl shadow-lg p-3 hover:shadow-xl transition-shadow flex items-center gap-2 text-sm font-medium text-gray-700"
      >
        {locating ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Navigation className="h-4 w-4 text-brand-600" />
        )}
        {locating ? 'Locating…' : 'My Location'}
      </button>

      {/* Property popup */}
      {selectedProperty && (
        <div className="absolute bottom-16 left-4 right-4 sm:left-auto sm:right-4 sm:w-80 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-10">
          <button
            onClick={() => setSelectedProperty(null)}
            className="absolute top-2 right-2 z-10 bg-white/90 rounded-full p-1 text-gray-500 hover:text-gray-700"
          >
            ×
          </button>
          <Link href={`/listings/${selectedProperty.id}`}>
            <div className="flex gap-3 p-3">
              <div className="relative h-20 w-24 flex-shrink-0 rounded-xl overflow-hidden bg-gray-100">
                {selectedProperty.images[0] ? (
                  <Image
                    src={selectedProperty.images[0].url}
                    alt={selectedProperty.title}
                    fill
                    className="object-cover"
                    sizes="96px"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center">
                    <MapPin className="h-6 w-6 text-gray-300" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-gray-900 line-clamp-2 leading-tight">
                  {selectedProperty.title}
                </p>
                <p className="text-xs text-gray-500 mt-1">{selectedProperty.area}</p>
                <p className="text-sm font-bold text-brand-600 mt-1">
                  {formatPrice(selectedProperty.price)}<span className="text-xs font-normal text-gray-400">/mo</span>
                </p>
              </div>
            </div>
          </Link>
        </div>
      )}
    </div>
  )
}
