'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Heart, Loader2, MapPin } from 'lucide-react'
import { ListingCard } from '@/components/listings/ListingCard'
import { Button } from '@/components/ui/Button'
import Link from 'next/link'
import type { PropertyCard } from '@/types'

export default function SavedPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [listings, setListings] = useState<PropertyCard[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') { router.push('/login'); return }
    if (status !== 'authenticated') return

    fetch('/api/saved')
      .then((r) => r.json())
      .then((data) => { setListings(data); setLoading(false) })
  }, [status, router])

  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 text-brand-600 animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 bg-red-50 text-red-600 rounded-full px-3 py-1 text-xs font-medium mb-2">
          <Heart className="h-3.5 w-3.5 fill-current" /> Saved
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Saved Listings</h1>
        <p className="text-sm text-gray-500 mt-1">{listings.length} saved {listings.length === 1 ? 'listing' : 'listings'}</p>
      </div>

      {listings.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {listings.map((p) => (
            <ListingCard
              key={p.id}
              property={{ ...p, savedByCurrentUser: true }}
              onSaveToggle={(id) => setListings((prev) => prev.filter((l) => l.id !== id))}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <Heart className="h-14 w-14 text-gray-200 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-700">No saved listings yet</h3>
          <p className="text-sm text-gray-400 mt-1">Heart a listing to save it here for later</p>
          <Link href="/explore" className="inline-block mt-5">
            <Button>Browse Listings</Button>
          </Link>
        </div>
      )}
    </div>
  )
}
