'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { MapPin, Phone, MessageSquare, ChevronLeft, Home, Send, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { formatPrice, stayTypeLabel, formatDate, getInitials } from '@/lib/utils'

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
  comments: {
    id: string
    body: string
    createdAt: string
    user: { id: string; name: string | null; image: string | null }
  }[]
}

export default function SpacePostDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { data: session } = useSession()
  const router = useRouter()
  const [post, setPost] = useState<SpacePost | null>(null)
  const [loading, setLoading] = useState(true)
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch(`/api/space-posts/${id}`)
      .then((r) => r.ok ? r.json() : null)
      .then((data) => { setPost(data); setLoading(false) })
  }, [id])

  async function submitComment(e: React.FormEvent) {
    e.preventDefault()
    if (!comment.trim()) return
    setSubmitting(true)
    setError('')
    const res = await fetch(`/api/space-posts/${id}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ body: comment }),
    })
    const data = await res.json()
    if (!res.ok) { setError(data.error ?? 'Failed to post'); setSubmitting(false); return }
    setPost((prev) => prev ? { ...prev, comments: [...prev.comments, data] } : prev)
    setComment('')
    setSubmitting(false)
  }

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <Loader2 className="h-8 w-8 text-brand-600 animate-spin" />
    </div>
  )

  if (!post) return (
    <div className="text-center py-20">
      <p className="text-gray-500">Space post not found.</p>
      <Link href="/share-space" className="text-brand-600 hover:underline text-sm mt-2 block">Back to Share Space</Link>
    </div>
  )

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link href="/share-space" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-brand-600 mb-6 transition-colors">
        <ChevronLeft className="h-4 w-4" /> Back to Share Space
      </Link>

      <div className="grid md:grid-cols-3 gap-8">
        {/* Main content */}
        <div className="md:col-span-2 space-y-6">
          {/* Image */}
          <div className="relative h-72 bg-gray-100 rounded-2xl overflow-hidden">
            {post.imageUrl ? (
              <Image src={post.imageUrl} alt={post.title} fill className="object-cover" sizes="(max-width: 768px) 100vw, 66vw" />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-brand-50 to-brand-100 flex items-center justify-center">
                <Home className="h-16 w-16 text-brand-200" />
              </div>
            )}
            <div className="absolute top-4 left-4">
              <Badge variant="default">{stayTypeLabel(post.spaceType)}</Badge>
            </div>
          </div>

          {/* Title + meta */}
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{post.title}</h1>
            <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
              <MapPin className="h-4 w-4" />
              <span>{post.area}, Bangalore</span>
              <span className="text-gray-300">·</span>
              <span>Posted by <strong className="text-gray-700">{post.user.name ?? 'Owner'}</strong></span>
              <span className="text-gray-300">·</span>
              <span>{formatDate(post.createdAt)}</span>
            </div>
          </div>

          {/* Description */}
          <div>
            <h2 className="font-semibold text-gray-900 mb-2">About this space</h2>
            <p className="text-gray-600 leading-relaxed whitespace-pre-line text-sm">{post.description}</p>
          </div>

          {/* Comments / Q&A */}
          <div>
            <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-brand-500" />
              Questions & Comments ({post.comments.length})
            </h2>

            {/* Comment form */}
            {session ? (
              <form onSubmit={submitComment} className="mb-6">
                <div className="flex gap-3">
                  <div className="h-9 w-9 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center text-sm font-bold flex-shrink-0">
                    {getInitials(session.user.name ?? 'U')}
                  </div>
                  <div className="flex-1 flex gap-2">
                    <input
                      type="text"
                      placeholder="Ask a question or leave a comment…"
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      className="flex-1 h-10 rounded-lg border border-gray-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                    <Button type="submit" size="sm" disabled={submitting || !comment.trim()}>
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                {error && <p className="text-xs text-red-600 mt-2 ml-12">{error}</p>}
              </form>
            ) : (
              <div className="mb-6 p-4 bg-gray-50 rounded-xl text-sm text-gray-500 text-center">
                <Link href="/login" className="text-brand-600 hover:underline font-medium">Sign in</Link> to ask a question or comment
              </div>
            )}

            {/* Comments list */}
            {post.comments.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <MessageSquare className="h-8 w-8 mx-auto mb-2 text-gray-200" />
                <p className="text-sm">No questions yet. Be the first to ask!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {post.comments.map((c) => (
                  <div key={c.id} className="flex gap-3">
                    <div className="h-9 w-9 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center text-sm font-bold flex-shrink-0">
                      {getInitials(c.user.name ?? 'U')}
                    </div>
                    <div className="flex-1 bg-gray-50 rounded-xl px-4 py-3">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium text-gray-900">{c.user.name ?? 'Anonymous'}</span>
                        <span className="text-xs text-gray-400">{formatDate(c.createdAt)}</span>
                      </div>
                      <p className="text-sm text-gray-700 leading-relaxed">{c.body}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar — contact card */}
        <div className="md:col-span-1">
          <div className="sticky top-24 bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-4">
            <div>
              <span className="text-3xl font-bold text-gray-900">{formatPrice(post.price)}</span>
              <span className="text-sm text-gray-400">/month</span>
            </div>

            <div className="space-y-3 text-sm border-t border-gray-100 pt-4">
              <div className="flex items-center gap-2 text-gray-700 font-medium">
                {post.contactName}
              </div>
              <a href={`tel:${post.contactPhone}`} className="flex items-center gap-2 text-gray-600 hover:text-brand-600">
                <Phone className="h-4 w-4 text-gray-400" />
                {post.contactPhone}
              </a>
            </div>

            <a
              href={`tel:${post.contactPhone}`}
              className="w-full bg-brand-600 hover:bg-brand-700 text-white font-medium rounded-xl py-3 flex items-center justify-center gap-2 text-sm transition-colors"
            >
              <Phone className="h-4 w-4" /> Call Owner
            </a>
            <a
              href={`https://wa.me/${post.contactPhone.replace(/\D/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full bg-green-500 hover:bg-green-600 text-white font-medium rounded-xl py-3 flex items-center justify-center gap-2 text-sm transition-colors"
            >
              WhatsApp
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
