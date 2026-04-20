'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import Image from 'next/image'
import { Home, Plus, MapPin, Phone, MessageSquare, Loader2, Tag } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { formatPrice, stayTypeLabel, formatDate } from '@/lib/utils'

const AREAS = [
  'All Areas', 'Koramangala', 'HSR Layout', 'Indiranagar',
  'Whitefield', 'Electronic City', 'Marathahalli', 'BTM Layout', 'Jayanagar',
]

interface SpacePost {
  id: string
  title: string
  description: string
  spaceType: string
  area: string
  price: number
  imageUrl: string | null
  contactName: string
  contactPhone: string
  createdAt: string
  user: { id: string; name: string | null; image: string | null }
  _count: { comments: number }
}

export default function ShareSpacePage() {
  const { data: session } = useSession()
  const [posts, setPosts] = useState<SpacePost[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedArea, setSelectedArea] = useState('All Areas')

  async function fetchPosts() {
    setLoading(true)
    const params = selectedArea !== 'All Areas' ? `?area=${encodeURIComponent(selectedArea)}` : ''
    const res = await fetch(`/api/space-posts${params}`)
    if (res.ok) setPosts(await res.json())
    setLoading(false)
  }

  useEffect(() => { fetchPosts() }, [selectedArea])

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-2 bg-brand-50 text-brand-700 rounded-full px-3 py-1 text-xs font-medium mb-2">
            <Home className="h-3.5 w-3.5" /> Community Board
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Share Your Space</h1>
          <p className="text-sm text-gray-500 mt-1">
            Owners advertise their PG or apartment. Ask questions directly in the comments.
          </p>
        </div>
        {session ? (
          <Link href="/share-space/new">
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" /> List My Space
            </Button>
          </Link>
        ) : (
          <Link href="/login">
            <Button>Sign in to List</Button>
          </Link>
        )}
      </div>

      {/* Area filter */}
      <div className="flex flex-wrap gap-2 mb-8">
        {AREAS.map((area) => (
          <button
            key={area}
            onClick={() => setSelectedArea(area)}
            className={`px-4 py-2 rounded-full border text-sm font-medium transition-all ${
              selectedArea === area
                ? 'border-brand-500 bg-brand-50 text-brand-700'
                : 'border-gray-200 text-gray-600 hover:border-brand-300'
            }`}
          >
            {area}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 text-brand-600 animate-spin" />
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-20">
          <Home className="h-14 w-14 text-gray-200 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-700">No spaces listed yet</h3>
          <p className="text-sm text-gray-400 mt-1">Be the first to advertise your space!</p>
          {session && (
            <Link href="/share-space/new" className="inline-block mt-5">
              <Button>List My Space</Button>
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <Link key={post.id} href={`/share-space/${post.id}`} className="group block">
              <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5">
                {/* Image */}
                <div className="relative h-48 bg-gray-100">
                  {post.imageUrl ? (
                    <Image
                      src={post.imageUrl}
                      alt={post.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-brand-50 to-brand-100 flex items-center justify-center">
                      <Home className="h-12 w-12 text-brand-200" />
                    </div>
                  )}
                  <div className="absolute top-3 left-3">
                    <Badge variant="default">{stayTypeLabel(post.spaceType)}</Badge>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5">
                  <h3 className="font-semibold text-gray-900 line-clamp-2 group-hover:text-brand-600 transition-colors">
                    {post.title}
                  </h3>
                  <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-1.5">
                    <MapPin className="h-3 w-3" />
                    {post.area}, Bangalore
                  </div>
                  <p className="text-xs text-gray-400 line-clamp-2 mt-2 leading-relaxed">
                    {post.description}
                  </p>

                  <div className="flex items-center justify-between mt-4">
                    <div>
                      <span className="text-lg font-bold text-gray-900">{formatPrice(post.price)}</span>
                      <span className="text-xs text-gray-400">/month</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <MessageSquare className="h-3.5 w-3.5" />
                      {post._count.comments} {post._count.comments === 1 ? 'question' : 'questions'}
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs text-gray-500">
                      <Phone className="h-3 w-3" />
                      {post.contactName}
                    </div>
                    <span className="text-xs text-gray-400">{formatDate(post.createdAt)}</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
