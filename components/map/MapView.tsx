'use client'

import { useEffect, useRef, useState } from 'react'
import { Loader2, Navigation, MapPin } from 'lucide-react'
import { formatPrice } from '@/lib/utils'
import Link from 'next/link'
import Image from 'next/image'
import type { PropertyCard } from '@/types'

interface MapViewProps {
  properties: PropertyCard[]
  userLocation?: { lat: number; lng: number }
  onUserLocation?: (loc: { lat: number; lng: number }) => void
}

const BANGALORE = { lat: 12.9716, lng: 77.5946 }

export function MapView({ properties, userLocation, onUserLocation }: MapViewProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const mapRef = useRef<any>(null)
  const [loading, setLoading] = useState(true)
  const [locating, setLocating] = useState(false)
  const [selected, setSelected] = useState<PropertyCard | null>(null)

  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return

    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
    document.head.appendChild(link)

    import('leaflet').then((L) => {
      if (!mapContainer.current || mapRef.current) return

      const map = L.map(mapContainer.current).setView(
        [BANGALORE.lat, BANGALORE.lng], 12
      )

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
      }).addTo(map)

      mapRef.current = map
      setLoading(false)

      if (properties.length > 0) {
        const withCoords = properties.filter((p) => p.latitude != null && p.longitude != null)
        if (withCoords.length > 0) {
          const bounds = L.latLngBounds(withCoords.map((p) => [Number(p.latitude), Number(p.longitude)]))
          map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 })
        }
      }
    })

    return () => {
      mapRef.current?.remove()
      mapRef.current = null
    }
  }, [])

  useEffect(() => {
    if (!mapRef.current || loading) return
    import('leaflet').then((L) => {
      mapRef.current.eachLayer((layer: any) => {
        if (layer instanceof L.Marker) mapRef.current.removeLayer(layer)
      })

      properties.forEach((property) => {
        if (property.latitude == null || property.longitude == null) return

        const icon = L.divIcon({
          className: '',
          html: `<div style="background:white;border:2px solid #d43f36;border-radius:999px;padding:3px 10px;font-size:11px;font-weight:700;color:#b2312a;white-space:nowrap;box-shadow:0 2px 6px rgba(0,0,0,0.15);cursor:pointer;">₹${(property.rentAmount / 1000).toFixed(0)}k</div>`,
          iconAnchor: [20, 16],
        })

        L.marker([Number(property.latitude), Number(property.longitude)], { icon })
          .addTo(mapRef.current)
          .on('click', () => setSelected(property))
      })

      if (userLocation) {
        const userIcon = L.divIcon({
          className: '',
          html: `<div style="width:16px;height:16px;background:#3b82f6;border:3px solid white;border-radius:50%;box-shadow:0 0 0 4px rgba(59,130,246,0.3);"></div>`,
          iconAnchor: [8, 8],
        })
        L.marker([userLocation.lat, userLocation.lng], { icon: userIcon }).addTo(mapRef.current)
      }
    })
  }, [properties, userLocation, loading])

  function locateUser() {
    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude }
        onUserLocation?.(loc)
        mapRef.current?.setView([loc.lat, loc.lng], 14)
        setLocating(false)
      },
      () => setLocating(false)
    )
  }

  return (
    <div className="relative h-full w-full rounded-2xl overflow-hidden">
      <div ref={mapContainer} className="h-full w-full" />

      {loading && (
        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center z-10">
          <div className="text-center">
            <Loader2 className="h-8 w-8 text-brand-600 animate-spin mx-auto mb-2" />
            <p className="text-sm text-gray-500">Loading map…</p>
          </div>
        </div>
      )}

      <button
        onClick={locateUser}
        disabled={locating}
        className="absolute bottom-4 right-4 z-20 bg-white rounded-xl shadow-lg p-3 hover:shadow-xl transition-shadow flex items-center gap-2 text-sm font-medium text-gray-700"
      >
        {locating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Navigation className="h-4 w-4 text-brand-600" />}
        {locating ? 'Locating…' : 'My Location'}
      </button>

      {selected && (
        <div className="absolute bottom-16 left-4 right-4 sm:left-auto sm:right-4 sm:w-80 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-20">
          <button onClick={() => setSelected(null)} className="absolute top-2 right-3 text-gray-400 hover:text-gray-600 text-lg leading-none z-10">×</button>
          <Link href={`/listings/${selected.id}`}>
            <div className="flex gap-3 p-3">
              <div className="relative h-20 w-24 flex-shrink-0 rounded-xl overflow-hidden bg-gray-100">
                {selected.media[0] ? (
                  <Image src={selected.media[0].url} alt={selected.title} fill className="object-cover" sizes="96px" />
                ) : (
                  <div className="h-full w-full flex items-center justify-center">
                    <MapPin className="h-6 w-6 text-gray-300" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-gray-900 line-clamp-2 leading-tight">{selected.title}</p>
                <p className="text-xs text-gray-500 mt-1">{selected.area}</p>
                <p className="text-sm font-bold text-brand-600 mt-1">
                  {formatPrice(selected.rentAmount)}<span className="text-xs font-normal text-gray-400">/mo</span>
                </p>
              </div>
            </div>
          </Link>
        </div>
      )}
    </div>
  )
}
