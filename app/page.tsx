'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect } from 'react'
import { Search, MapPin, Star, Shield, Users, ArrowRight, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { ListingCard } from '@/components/listings/ListingCard'
import { PreferenceFlow } from '@/components/onboarding/PreferenceFlow'
import type { PropertyCard } from '@/types'

const POPULAR_AREAS = [
  { name: 'Koramangala', emoji: '☕', desc: 'Vibrant startup hub' },
  { name: 'HSR Layout', emoji: '🏙️', desc: 'Planned & peaceful' },
  { name: 'Indiranagar', emoji: '🎨', desc: 'Trendy & lively' },
  { name: 'Whitefield', emoji: '💻', desc: 'IT corridor' },
  { name: 'Electronic City', emoji: '⚡', desc: 'Budget friendly' },
  { name: 'Marathahalli', emoji: '🚇', desc: 'Well connected' },
]

export default function HomePage() {
  const [query, setQuery] = useState('')
  const [featuredListings, setFeaturedListings] = useState<PropertyCard[]>([])
  const [showPreferenceFlow, setShowPreferenceFlow] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/listings?sortBy=newest')
      .then((r) => r.json())
      .then((data) => {
        const list = Array.isArray(data) ? data : []
        setFeaturedListings(list.slice(0, 6))
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (query.trim()) {
      window.location.href = `/explore?q=${encodeURIComponent(query)}`
    } else {
      window.location.href = '/explore'
    }
  }

  return (
    <>
      {showPreferenceFlow && <PreferenceFlow onClose={() => setShowPreferenceFlow(false)} />}

      {/* Hero */}
      <section className="relative bg-gradient-to-br from-brand-700 via-brand-600 to-brand-500 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-64 h-64 bg-white rounded-full translate-x-1/3 translate-y-1/3" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-1.5 text-sm mb-6">
              <Sparkles className="h-4 w-4" />
              <span>Smart housing search for Bangalore</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight mb-6">
              Find your perfect
              <br />
              <span className="text-yellow-300">Bangalore stay</span>
            </h1>
            <p className="text-lg text-brand-100 mb-8 leading-relaxed">
              PGs, apartments, shared flats and short-term stays — all in one place with map view, real reviews, and flatmate matching.
            </p>

            {/* Search bar */}
            <form onSubmit={handleSearch} className="flex gap-3 max-w-xl">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search Koramangala, HSR Layout, Whitefield…"
                  className="w-full h-14 pl-12 pr-4 rounded-xl text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-300 shadow-lg"
                />
              </div>
              <Button type="submit" size="lg" className="bg-yellow-400 hover:bg-yellow-300 text-gray-900 font-bold shadow-lg flex-shrink-0">
                Search
              </Button>
            </form>

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                onClick={() => setShowPreferenceFlow(true)}
                className="flex items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 text-sm transition-colors"
              >
                <Sparkles className="h-4 w-4 text-yellow-300" />
                Smart Match — tell us what you need
              </button>
              <Link
                href="/explore"
                className="flex items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 text-sm transition-colors"
              >
                <MapPin className="h-4 w-4" />
                Browse map view
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Popular areas */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Popular Areas</h2>
            <p className="text-sm text-gray-500 mt-0.5">Explore by neighbourhood</p>
          </div>
          <Link href="/explore" className="text-sm text-brand-600 font-medium hover:underline flex items-center gap-1">
            View all <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {POPULAR_AREAS.map((area) => (
            <Link
              key={area.name}
              href={`/explore?area=${encodeURIComponent(area.name)}`}
              className="group p-4 bg-white rounded-2xl border border-gray-100 hover:border-brand-300 hover:shadow-md transition-all text-center"
            >
              <div className="text-3xl mb-2">{area.emoji}</div>
              <p className="font-semibold text-sm text-gray-900 group-hover:text-brand-600 transition-colors">{area.name}</p>
              <p className="text-xs text-gray-400 mt-0.5">{area.desc}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Trust signals */}
      <section className="bg-white border-y border-gray-100 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
            {[
              { icon: MapPin, label: '100+ Listings', desc: 'Across 15+ Bangalore areas' },
              { icon: Star, label: 'Real Reviews', desc: 'From verified residents' },
              { icon: Shield, label: 'Verified Properties', desc: 'Admin-checked listings' },
            ].map(({ icon: Icon, label, desc }) => (
              <div key={label} className="flex flex-col items-center">
                <div className="h-12 w-12 bg-brand-50 rounded-2xl flex items-center justify-center mb-3">
                  <Icon className="h-6 w-6 text-brand-600" />
                </div>
                <p className="font-bold text-gray-900">{label}</p>
                <p className="text-sm text-gray-500 mt-0.5">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured listings */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Featured Listings</h2>
            <p className="text-sm text-gray-500 mt-0.5">Hand-picked stays across Bangalore</p>
          </div>
          <Link href="/explore" className="text-sm text-brand-600 font-medium hover:underline flex items-center gap-1">
            See all <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 overflow-hidden animate-pulse">
                <div className="h-52 bg-gray-100" />
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-gray-100 rounded w-3/4" />
                  <div className="h-3 bg-gray-100 rounded w-1/2" />
                  <div className="h-6 bg-gray-100 rounded w-1/3 mt-3" />
                </div>
              </div>
            ))}
          </div>
        ) : featuredListings.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {featuredListings.map((p) => (
              <ListingCard key={p.id} property={p} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 text-gray-400">
            <MapPin className="h-12 w-12 mx-auto mb-3 text-gray-200" />
            <p>No listings yet. Run the seed script to add sample data.</p>
          </div>
        )}
      </section>

      {/* Flatmate CTA */}
      <section className="bg-gradient-to-r from-brand-50 to-orange-50 border-y border-brand-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 flex flex-col sm:flex-row items-center gap-8">
          <div className="flex-1">
            <div className="inline-flex items-center gap-2 bg-brand-100 text-brand-700 rounded-full px-3 py-1 text-xs font-medium mb-3">
              <Users className="h-3.5 w-3.5" /> Community Feature
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Looking for a flatmate?</h2>
            <p className="text-gray-600 text-sm leading-relaxed max-w-md">
              Post your flatmate request or browse people looking to share flats in Bangalore. Connect directly — no middleman.
            </p>
          </div>
          <div className="flex gap-3 flex-shrink-0">
            <Link href="/flatmates">
              <Button variant="outline">Browse Posts</Button>
            </Link>
            <Link href="/flatmates?post=true">
              <Button>Post a Request</Button>
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
