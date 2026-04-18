'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import type { Amenity } from '@prisma/client'

const BANGALORE_AREAS = [
  'Koramangala', 'HSR Layout', 'Indiranagar', 'Whitefield',
  'Electronic City', 'Marathahalli', 'BTM Layout', 'Jayanagar',
  'Bellandur', 'Sarjapur Road', 'Hebbal', 'Yelahanka', 'JP Nagar', 'Domlur',
]

interface ListingFormProps {
  amenities: Amenity[]
  defaultValues?: Record<string, any>
  propertyId?: string
}

export function ListingForm({ amenities, defaultValues, propertyId }: ListingFormProps) {
  const router = useRouter()
  const [form, setForm] = useState({
    title: defaultValues?.title ?? '',
    description: defaultValues?.description ?? '',
    stayType: defaultValues?.stayType ?? 'PG',
    address: defaultValues?.address ?? '',
    area: defaultValues?.area ?? '',
    latitude: defaultValues?.latitude ?? '',
    longitude: defaultValues?.longitude ?? '',
    price: defaultValues?.price ?? '',
    deposit: defaultValues?.deposit ?? '',
    roomType: defaultValues?.roomType ?? 'PRIVATE',
    hasAC: defaultValues?.hasAC ?? false,
    isFurnished: defaultValues?.isFurnished ?? 'SEMI_FURNISHED',
    foodIncluded: defaultValues?.foodIncluded ?? false,
    genderPreference: defaultValues?.genderPreference ?? 'ANY',
    availableFrom: defaultValues?.availableFrom
      ? new Date(defaultValues.availableFrom).toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0],
    contactName: defaultValues?.contactName ?? '',
    contactPhone: defaultValues?.contactPhone ?? '',
    contactEmail: defaultValues?.contactEmail ?? '',
    imageUrl1: defaultValues?.images?.[0]?.url ?? '',
    imageUrl2: defaultValues?.images?.[1]?.url ?? '',
  })
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>(
    defaultValues?.amenities?.map((a: any) => a.amenityId) ?? []
  )
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function toggleAmenity(id: string) {
    setSelectedAmenities((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const images = [
      form.imageUrl1 ? { url: form.imageUrl1, isPrimary: true } : null,
      form.imageUrl2 ? { url: form.imageUrl2, isPrimary: false } : null,
    ].filter(Boolean)

    const body = {
      ...form,
      latitude: parseFloat(form.latitude as string),
      longitude: parseFloat(form.longitude as string),
      price: parseInt(form.price as string),
      deposit: parseInt(form.deposit as string),
      amenityIds: selectedAmenities,
      images,
    }

    const url = propertyId ? `/api/listings/${propertyId}` : '/api/listings'
    const method = propertyId ? 'PATCH' : 'POST'

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    const data = await res.json()

    if (!res.ok) {
      setError(data.error ?? 'Failed to save listing')
      setLoading(false)
      return
    }

    router.push('/admin')
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white rounded-2xl border border-gray-100 p-8">
      {/* Basic info */}
      <div className="space-y-4">
        <h2 className="font-semibold text-gray-900 border-b border-gray-100 pb-2">Basic Information</h2>
        <div>
          <label className="text-sm font-medium text-gray-700 block mb-1.5">Title *</label>
          <Input required value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="e.g. Cozy PG in Koramangala 5th Block" />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700 block mb-1.5">Description *</label>
          <textarea
            required
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            rows={4}
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
            placeholder="Describe the property, neighbourhood, and what makes it special…"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1.5">Stay Type *</label>
            <select value={form.stayType} onChange={(e) => setForm((f) => ({ ...f, stayType: e.target.value }))} className="w-full h-10 rounded-lg border border-gray-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500">
              <option value="PG">PG</option>
              <option value="APARTMENT">Apartment</option>
              <option value="TEMPORARY">Temporary Stay</option>
              <option value="SHARED_FLAT">Shared Flat</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1.5">Area *</label>
            <select value={form.area} onChange={(e) => setForm((f) => ({ ...f, area: e.target.value }))} required className="w-full h-10 rounded-lg border border-gray-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500">
              <option value="">Select area</option>
              {BANGALORE_AREAS.map((a) => <option key={a} value={a}>{a}</option>)}
            </select>
          </div>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700 block mb-1.5">Full Address *</label>
          <Input required value={form.address} onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))} placeholder="e.g. 45, 5th Block, Koramangala" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1.5">Latitude *</label>
            <Input required type="number" step="any" value={form.latitude} onChange={(e) => setForm((f) => ({ ...f, latitude: e.target.value }))} placeholder="12.9347" />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1.5">Longitude *</label>
            <Input required type="number" step="any" value={form.longitude} onChange={(e) => setForm((f) => ({ ...f, longitude: e.target.value }))} placeholder="77.6245" />
          </div>
        </div>
      </div>

      {/* Pricing */}
      <div className="space-y-4">
        <h2 className="font-semibold text-gray-900 border-b border-gray-100 pb-2">Pricing</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1.5">Monthly Rent (₹) *</label>
            <Input required type="number" value={form.price} onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))} placeholder="12000" />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1.5">Deposit (₹) *</label>
            <Input required type="number" value={form.deposit} onChange={(e) => setForm((f) => ({ ...f, deposit: e.target.value }))} placeholder="24000" />
          </div>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700 block mb-1.5">Available From *</label>
          <Input required type="date" value={form.availableFrom} onChange={(e) => setForm((f) => ({ ...f, availableFrom: e.target.value }))} />
        </div>
      </div>

      {/* Room details */}
      <div className="space-y-4">
        <h2 className="font-semibold text-gray-900 border-b border-gray-100 pb-2">Room Details</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1.5">Room Type</label>
            <select value={form.roomType} onChange={(e) => setForm((f) => ({ ...f, roomType: e.target.value }))} className="w-full h-10 rounded-lg border border-gray-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500">
              <option value="PRIVATE">Private</option>
              <option value="SHARED">Shared</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1.5">Furnished</label>
            <select value={form.isFurnished} onChange={(e) => setForm((f) => ({ ...f, isFurnished: e.target.value }))} className="w-full h-10 rounded-lg border border-gray-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500">
              <option value="FURNISHED">Fully Furnished</option>
              <option value="SEMI_FURNISHED">Semi-Furnished</option>
              <option value="UNFURNISHED">Unfurnished</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1.5">Gender Pref</label>
            <select value={form.genderPreference} onChange={(e) => setForm((f) => ({ ...f, genderPreference: e.target.value }))} className="w-full h-10 rounded-lg border border-gray-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500">
              <option value="ANY">Any</option>
              <option value="MALE">Male Only</option>
              <option value="FEMALE">Female Only</option>
            </select>
          </div>
        </div>
        <div className="flex flex-wrap gap-4">
          <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
            <input type="checkbox" checked={form.hasAC} onChange={(e) => setForm((f) => ({ ...f, hasAC: e.target.checked }))} className="h-4 w-4 rounded text-brand-600" />
            Has AC
          </label>
          <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
            <input type="checkbox" checked={form.foodIncluded} onChange={(e) => setForm((f) => ({ ...f, foodIncluded: e.target.checked }))} className="h-4 w-4 rounded text-brand-600" />
            Food Included
          </label>
        </div>
      </div>

      {/* Amenities */}
      <div className="space-y-3">
        <h2 className="font-semibold text-gray-900 border-b border-gray-100 pb-2">Amenities</h2>
        <div className="flex flex-wrap gap-2">
          {amenities.map((a) => (
            <button
              key={a.id}
              type="button"
              onClick={() => toggleAmenity(a.id)}
              className={`px-3 py-1.5 rounded-full border text-sm font-medium transition-all ${
                selectedAmenities.includes(a.id)
                  ? 'bg-brand-600 text-white border-brand-600'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-brand-400'
              }`}
            >
              {a.name}
            </button>
          ))}
        </div>
      </div>

      {/* Images */}
      <div className="space-y-4">
        <h2 className="font-semibold text-gray-900 border-b border-gray-100 pb-2">Images (URLs)</h2>
        <div>
          <label className="text-sm font-medium text-gray-700 block mb-1.5">Primary Image URL</label>
          <Input type="url" value={form.imageUrl1} onChange={(e) => setForm((f) => ({ ...f, imageUrl1: e.target.value }))} placeholder="https://images.unsplash.com/..." />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700 block mb-1.5">Secondary Image URL</label>
          <Input type="url" value={form.imageUrl2} onChange={(e) => setForm((f) => ({ ...f, imageUrl2: e.target.value }))} placeholder="https://images.unsplash.com/..." />
        </div>
      </div>

      {/* Contact */}
      <div className="space-y-4">
        <h2 className="font-semibold text-gray-900 border-b border-gray-100 pb-2">Contact Information</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1.5">Contact Name *</label>
            <Input required value={form.contactName} onChange={(e) => setForm((f) => ({ ...f, contactName: e.target.value }))} />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1.5">Phone *</label>
            <Input required value={form.contactPhone} onChange={(e) => setForm((f) => ({ ...f, contactPhone: e.target.value }))} />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1.5">Email</label>
            <Input type="email" value={form.contactEmail} onChange={(e) => setForm((f) => ({ ...f, contactEmail: e.target.value }))} />
          </div>
        </div>
      </div>

      {error && <p className="text-sm text-red-600 bg-red-50 rounded-lg px-4 py-3">{error}</p>}

      <div className="flex gap-3 pt-2">
        <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Saving…' : propertyId ? 'Update Listing' : 'Create Listing'}
        </Button>
      </div>
    </form>
  )
}
