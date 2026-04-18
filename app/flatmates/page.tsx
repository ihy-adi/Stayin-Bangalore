'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Users, Plus, Loader2, X } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { FlatmateCard } from '@/components/flatmates/FlatmateCard'
import type { FlatmatePostWithRelations } from '@/types'

const AREAS = [
  'Koramangala', 'HSR Layout', 'Indiranagar', 'Whitefield',
  'Electronic City', 'Marathahalli', 'BTM Layout', 'Jayanagar',
]

function PostFlatmateModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [form, setForm] = useState({
    propertyLink: '',
    genderPref: 'ANY',
    budgetShare: '',
    moveInDate: '',
    bio: '',
    contactMethod: 'WhatsApp',
    contactValue: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const res = await fetch('/api/flatmates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, budgetShare: Number(form.budgetShare) }),
    })
    const data = await res.json()
    if (!res.ok) { setError(data.error ?? 'Failed to post'); setLoading(false); return }
    onSuccess()
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Post a Flatmate Request</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="h-5 w-5" />
          </button>
        </div>
        <form onSubmit={submit} className="p-6 space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Listing Link (optional)</label>
            <input
              type="url"
              placeholder="https://..."
              value={form.propertyLink}
              onChange={(e) => setForm((f) => ({ ...f, propertyLink: e.target.value }))}
              className="w-full h-10 rounded-lg border border-gray-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Gender Preference</label>
              <select
                value={form.genderPref}
                onChange={(e) => setForm((f) => ({ ...f, genderPref: e.target.value }))}
                className="w-full h-10 rounded-lg border border-gray-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value="ANY">Anyone</option>
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Budget Share (₹/mo)</label>
              <input
                type="number"
                required
                placeholder="e.g. 12000"
                value={form.budgetShare}
                onChange={(e) => setForm((f) => ({ ...f, budgetShare: e.target.value }))}
                className="w-full h-10 rounded-lg border border-gray-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Move-in Date</label>
            <input
              type="date"
              required
              value={form.moveInDate}
              onChange={(e) => setForm((f) => ({ ...f, moveInDate: e.target.value }))}
              className="w-full h-10 rounded-lg border border-gray-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">About You</label>
            <textarea
              required
              minLength={20}
              placeholder="Tell potential flatmates about yourself, your lifestyle, work schedule, interests…"
              value={form.bio}
              onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
              rows={4}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Contact Via</label>
              <select
                value={form.contactMethod}
                onChange={(e) => setForm((f) => ({ ...f, contactMethod: e.target.value }))}
                className="w-full h-10 rounded-lg border border-gray-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value="WhatsApp">WhatsApp</option>
                <option value="Email">Email</option>
                <option value="Phone">Phone</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Contact Value</label>
              <input
                required
                placeholder={form.contactMethod === 'Email' ? 'your@email.com' : '+91 98765...'}
                value={form.contactValue}
                onChange={(e) => setForm((f) => ({ ...f, contactValue: e.target.value }))}
                className="w-full h-10 rounded-lg border border-gray-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">Cancel</Button>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? 'Posting…' : 'Post Request'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

function FlatematesContent() {
  const { data: session } = useSession()
  const searchParams = useSearchParams()
  const [posts, setPosts] = useState<FlatmatePostWithRelations[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(searchParams.get('post') === 'true')
  const [selectedArea, setSelectedArea] = useState('')

  async function fetchPosts() {
    setLoading(true)
    const params = selectedArea ? `?area=${encodeURIComponent(selectedArea)}` : ''
    const res = await fetch(`/api/flatmates${params}`)
    setPosts(await res.json())
    setLoading(false)
  }

  useEffect(() => { fetchPosts() }, [selectedArea])

  function handlePostSuccess() {
    setShowModal(false)
    fetchPosts()
  }

  return (
    <>
      {showModal && session && (
        <PostFlatmateModal onClose={() => setShowModal(false)} onSuccess={handlePostSuccess} />
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 bg-brand-50 text-brand-700 rounded-full px-3 py-1 text-xs font-medium mb-2">
              <Users className="h-3.5 w-3.5" /> Community
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Find a Flatmate</h1>
            <p className="text-sm text-gray-500 mt-1">Connect with people looking to share flats across Bangalore</p>
          </div>
          {session ? (
            <Button onClick={() => setShowModal(true)} className="flex items-center gap-2">
              <Plus className="h-4 w-4" /> Post a Request
            </Button>
          ) : (
            <a href="/login">
              <Button>Sign in to Post</Button>
            </a>
          )}
        </div>

        {/* Area filter */}
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => setSelectedArea('')}
            className={`px-4 py-2 rounded-full border text-sm font-medium transition-all ${
              !selectedArea ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-gray-200 text-gray-600 hover:border-brand-300'
            }`}
          >
            All Areas
          </button>
          {AREAS.map((a) => (
            <button
              key={a}
              onClick={() => setSelectedArea(a)}
              className={`px-4 py-2 rounded-full border text-sm font-medium transition-all ${
                selectedArea === a ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-gray-200 text-gray-600 hover:border-brand-300'
              }`}
            >
              {a}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 text-brand-600 animate-spin" />
          </div>
        ) : posts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {posts.map((post) => <FlatmateCard key={post.id} post={post} />)}
          </div>
        ) : (
          <div className="text-center py-20 text-gray-400">
            <Users className="h-12 w-12 mx-auto mb-3 text-gray-200" />
            <h3 className="text-lg font-semibold text-gray-700">No flatmate posts yet</h3>
            <p className="text-sm mt-1">Be the first to post a request!</p>
          </div>
        )}
      </div>
    </>
  )
}

export default function FlatematesPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-brand-600" /></div>}>
      <FlatematesContent />
    </Suspense>
  )
}
