'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Heart, Star, MapPin, Wifi, Wind, UtensilsCrossed, Shield } from 'lucide-react'
import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { Badge } from '@/components/ui/Badge'
import { formatPrice, stayTypeLabel, genderLabel } from '@/lib/utils'
import type { PropertyCard } from '@/types'

interface ListingCardProps {
  property: PropertyCard
  onSaveToggle?: (id: string, saved: boolean) => void
}

export function ListingCard({ property, onSaveToggle }: ListingCardProps) {
  const { data: session } = useSession()
  const [saved, setSaved] = useState(property.savedByCurrentUser ?? false)
  const [saving, setSaving] = useState(false)

  const primaryImage = property.media.find((i) => i.isPrimary) ?? property.media[0]

  async function toggleSave(e: React.MouseEvent) {
    e.preventDefault()
    if (!session) { window.location.href = '/login'; return }
    setSaving(true)
    const method = saved ? 'DELETE' : 'POST'
    const res = await fetch('/api/saved', {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ propertyId: property.id }),
    })
    if (!res.ok) {
      setSaving(false)
      return
    }
    setSaved(!saved)
    onSaveToggle?.(property.id, !saved)
    setSaving(false)
  }

  const amenityIcons: Record<string, React.ReactNode> = {
    'Wi-Fi': <Wifi className="h-3 w-3" />,
    'AC': <Wind className="h-3 w-3" />,
    'Security': <Shield className="h-3 w-3" />,
  }

  return (
    <Link href={`/listings/${property.id}`} className="group block">
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5">
        {/* Image */}
        <div className="relative h-52 bg-gray-100 overflow-hidden">
          {primaryImage ? (
            <Image
              src={primaryImage.url}
              alt={primaryImage.caption ?? property.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-brand-100 to-brand-200 flex items-center justify-center">
              <MapPin className="h-12 w-12 text-brand-400" />
            </div>
          )}

          {/* Badges */}
          <div className="absolute top-3 left-3 flex gap-2">
            <Badge variant={property.propertyType === 'PG' ? 'default' : 'secondary'}>
              {stayTypeLabel(property.propertyType)}
            </Badge>
            {property.isVerified && (
              <Badge variant="success">Verified</Badge>
            )}
          </div>

          {/* Save button */}
          <button
            onClick={toggleSave}
            disabled={saving}
            className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-full p-2 hover:bg-white shadow-sm transition-all"
            aria-label={saved ? 'Remove from saved' : 'Save listing'}
          >
            <Heart
              className={`h-4 w-4 transition-colors ${saved ? 'fill-brand-500 text-brand-500' : 'text-gray-500'}`}
            />
          </button>

          {/* Gender pref */}
          {property.genderPreference !== 'ANY' && (
            <div className="absolute bottom-3 left-3">
              <Badge variant={property.genderPreference === 'FEMALE' ? 'warning' : 'secondary'}>
                {genderLabel(property.genderPreference)}
              </Badge>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="font-semibold text-gray-900 text-sm leading-tight line-clamp-2 group-hover:text-brand-600 transition-colors">
              {property.title}
            </h3>
          </div>

          <div className="flex items-center gap-1 text-xs text-gray-500 mb-3">
            <MapPin className="h-3 w-3 flex-shrink-0" />
            <span>{property.area}, Bangalore</span>
          </div>

          {/* Quick amenities */}
          <div className="flex flex-wrap gap-1.5 mb-3">
            {property.hasAc && (
              <span className="flex items-center gap-1 text-xs bg-blue-50 text-blue-700 rounded-full px-2 py-0.5">
                <Wind className="h-3 w-3" /> AC
              </span>
            )}
            {property.foodIncluded && (
              <span className="flex items-center gap-1 text-xs bg-green-50 text-green-700 rounded-full px-2 py-0.5">
                <UtensilsCrossed className="h-3 w-3" /> Food
              </span>
            )}
            {property.amenities.slice(0, 2).map((pa) => (
              <span key={pa.amenityId} className="flex items-center gap-1 text-xs bg-gray-50 text-gray-600 rounded-full px-2 py-0.5">
                {amenityIcons[pa.amenity.name] ?? null}
                {pa.amenity.name}
              </span>
            ))}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between">
            <div>
              <span className="text-lg font-bold text-gray-900">{formatPrice(property.rentAmount)}</span>
              <span className="text-xs text-gray-400">/month</span>
            </div>
            <div className="flex items-center gap-1 text-xs text-gray-500">
              {property._count.reviews > 0 ? (
                <>
                  <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                  <span className="font-medium text-gray-700">{(property.avgRating ?? 0).toFixed(1)}</span>
                  <span>({property._count.reviews})</span>
                </>
              ) : (
                <span>No reviews yet</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}
