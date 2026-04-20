'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

const AREAS = [
  'Koramangala', 'HSR Layout', 'Indiranagar', 'Whitefield',
  'Electronic City', 'Marathahalli', 'BTM Layout', 'Jayanagar',
  'Bellandur', 'Sarjapur Road', 'Hebbal', 'JP Nagar',
]

export default function NewSpacePostPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [form, setForm] = useState({
    title: '',
    description: '',
    spaceType: 'PG',
    area: '',
    price: '',
    imageUrl: '',
    contactName: '',
    contactPhone: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  if (status === 'unauthenticated') {
    router.push('/login')
    return null
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const res = await fetch('/api/space-posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, price: Number(form.price) }),
    })
    const data = await res.json()
    if (!res.ok) { setError(data.error ?? 'Failed to post'); setLoading(false); return }
    router.push(`/share-space/${data.id}`)
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">List Your Space</h1>
        <p className="text-sm text-gray-500 mt-1">Advertise your PG or apartment to the Stayin Bangalore community</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 p-8 space-y-5">
        <div>
          <label className="text-sm font-medium text-gray-700 block mb-1.5">Title *</label>
          <Input required placeholder="e.g. Spacious PG in Koramangala with all amenities" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700 block mb-1.5">Description *</label>
          <textarea
            required
            minLength={30}
            placeholder="Describe your space — amenities, rules, nearby landmarks, what makes it special…"
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            rows={5}
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1.5">Space Type *</label>
            <select value={form.spaceType} onChange={(e) => setForm((f) => ({ ...f, spaceType: e.target.value }))} className="w-full h-10 rounded-lg border border-gray-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500">
              <option value="PG">PG / Hostel</option>
              <option value="APARTMENT">Apartment</option>
              <option value="SHARED_FLAT">Shared Flat</option>
              <option value="TEMPORARY">Temporary Stay</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1.5">Area *</label>
            <select required value={form.area} onChange={(e) => setForm((f) => ({ ...f, area: e.target.value }))} className="w-full h-10 rounded-lg border border-gray-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500">
              <option value="">Select area</option>
              {AREAS.map((a) => <option key={a} value={a}>{a}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700 block mb-1.5">Monthly Rent (₹) *</label>
          <Input required type="number" placeholder="e.g. 12000" value={form.price} onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))} />
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700 block mb-1.5">Image URL <span className="text-gray-400 font-normal">(optional)</span></label>
          <Input type="url" placeholder="https://..." value={form.imageUrl} onChange={(e) => setForm((f) => ({ ...f, imageUrl: e.target.value }))} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1.5">Your Name *</label>
            <Input required value={form.contactName} onChange={(e) => setForm((f) => ({ ...f, contactName: e.target.value }))} />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1.5">Phone Number *</label>
            <Input required value={form.contactPhone} onChange={(e) => setForm((f) => ({ ...f, contactPhone: e.target.value }))} placeholder="+91 98765..." />
          </div>
        </div>

        {error && <p className="text-sm text-red-600 bg-red-50 rounded-lg px-4 py-3">{error}</p>}

        <div className="flex gap-3 pt-2">
          <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
          <Button type="submit" disabled={loading}>{loading ? 'Posting…' : 'Post My Space'}</Button>
        </div>
      </form>
    </div>
  )
}
