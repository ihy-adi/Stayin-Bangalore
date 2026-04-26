'use client'

import { useState } from 'react'
import { SlidersHorizontal, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { SearchFilters } from '@/types'

const AREAS = [
  'Koramangala', 'HSR Layout', 'Indiranagar', 'Whitefield',
  'Electronic City', 'Marathahalli', 'BTM Layout', 'Jayanagar',
  'Bellandur', 'Sarjapur Road', 'Hebbal', 'Yelahanka', 'JP Nagar',
]

const PROPERTY_TYPES = [
  { value: 'PG', label: 'PG' },
  { value: 'APARTMENT', label: 'Apartment' },
  { value: 'FLAT', label: 'Flat' },
  { value: 'ROOM', label: 'Room' },
  { value: 'HOSTEL', label: 'Hostel' },
]

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Top Rated' },
  { value: 'distance', label: 'Nearest First' },
]

interface ListingFiltersProps {
  filters: SearchFilters
  onChange: (filters: SearchFilters) => void
  resultCount?: number
}

export function ListingFilters({ filters, onChange, resultCount }: ListingFiltersProps) {
  const [open, setOpen] = useState(false)

  function togglePropertyType(value: string) {
    const current = filters.propertyType ?? []
    const next = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value]
    onChange({ ...filters, propertyType: next.length ? next : undefined })
  }

  const activeCount = [
    filters.propertyType?.length,
    filters.area,
    filters.hasAc,
    filters.foodIncluded,
    filters.roomType,
    filters.furnishing,
    filters.genderPreference,
    filters.minPrice || filters.maxPrice,
  ].filter(Boolean).length

  return (
    <div className="bg-white border-b border-gray-100 sticky top-16 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center gap-3 overflow-x-auto pb-1">
          {/* Sort */}
          <select
            value={filters.sortBy ?? 'newest'}
            onChange={(e) => onChange({ ...filters, sortBy: e.target.value as any })}
            className="h-9 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-700 cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand-500 flex-shrink-0"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>

          {/* Quick property type filters */}
          {PROPERTY_TYPES.map((t) => (
            <button
              key={t.value}
              onClick={() => togglePropertyType(t.value)}
              className={cn(
                'h-9 px-4 rounded-full text-sm font-medium border flex-shrink-0 transition-colors',
                filters.propertyType?.includes(t.value)
                  ? 'bg-brand-600 text-white border-brand-600'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-brand-400'
              )}
            >
              {t.label}
            </button>
          ))}

          <div className="h-6 w-px bg-gray-200 flex-shrink-0" />

          {/* All filters button */}
          <button
            onClick={() => setOpen(!open)}
            className={cn(
              'h-9 px-4 rounded-full text-sm font-medium border flex-shrink-0 flex items-center gap-2 transition-colors',
              activeCount > 0
                ? 'bg-brand-50 text-brand-700 border-brand-300'
                : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
            )}
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filters
            {activeCount > 0 && (
              <span className="bg-brand-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {activeCount}
              </span>
            )}
            <ChevronDown className={cn('h-3 w-3 transition-transform', open && 'rotate-180')} />
          </button>

          {activeCount > 0 && (
            <button
              onClick={() => onChange({ sortBy: filters.sortBy })}
              className="text-xs text-brand-600 hover:underline flex-shrink-0"
            >
              Clear all
            </button>
          )}

          {resultCount !== undefined && (
            <span className="ml-auto text-sm text-gray-500 flex-shrink-0 whitespace-nowrap">
              {resultCount} {resultCount === 1 ? 'listing' : 'listings'}
            </span>
          )}
        </div>

        {/* Expanded filter panel */}
        {open && (
          <div className="mt-4 pb-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {/* Area */}
            <div className="col-span-2">
              <label className="text-xs font-medium text-gray-500 mb-1.5 block">Area</label>
              <select
                value={filters.area ?? ''}
                onChange={(e) => onChange({ ...filters, area: e.target.value || undefined })}
                className="w-full h-9 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value="">All areas</option>
                {AREAS.map((a) => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>

            {/* Budget range */}
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1.5 block">Min Price (₹)</label>
              <input
                type="number"
                placeholder="e.g. 5000"
                value={filters.minPrice ?? ''}
                onChange={(e) => onChange({ ...filters, minPrice: e.target.value ? Number(e.target.value) : undefined })}
                className="w-full h-9 rounded-lg border border-gray-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-gray-500 mb-1.5 block">Max Price (₹)</label>
              <input
                type="number"
                placeholder="e.g. 25000"
                value={filters.maxPrice ?? ''}
                onChange={(e) => onChange({ ...filters, maxPrice: e.target.value ? Number(e.target.value) : undefined })}
                className="w-full h-9 rounded-lg border border-gray-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            {/* Room type */}
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1.5 block">Room Type</label>
              <select
                value={filters.roomType ?? ''}
                onChange={(e) => onChange({ ...filters, roomType: e.target.value || undefined })}
                className="w-full h-9 rounded-lg border border-gray-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value="">Any</option>
                <option value="PRIVATE">Private</option>
                <option value="SHARED">Shared</option>
                <option value="SINGLE">Single</option>
                <option value="DOUBLE_SHARING">Double Sharing</option>
              </select>
            </div>

            {/* Furnished */}
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1.5 block">Furnished</label>
              <select
                value={filters.furnishing ?? ''}
                onChange={(e) => onChange({ ...filters, furnishing: e.target.value || undefined })}
                className="w-full h-9 rounded-lg border border-gray-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value="">Any</option>
                <option value="FULLY_FURNISHED">Fully Furnished</option>
                <option value="SEMI_FURNISHED">Semi-Furnished</option>
                <option value="UNFURNISHED">Unfurnished</option>
              </select>
            </div>

            {/* Gender */}
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1.5 block">Gender</label>
              <select
                value={filters.genderPreference ?? ''}
                onChange={(e) => onChange({ ...filters, genderPreference: e.target.value || undefined })}
                className="w-full h-9 rounded-lg border border-gray-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value="">Any</option>
                <option value="MALE">Men Only</option>
                <option value="FEMALE">Women Only</option>
              </select>
            </div>

            {/* Toggles */}
            <div className="col-span-2 flex gap-4 items-end">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.hasAc ?? false}
                  onChange={(e) => onChange({ ...filters, hasAc: e.target.checked || undefined })}
                  className="h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
                />
                <span className="text-sm text-gray-700">AC</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.foodIncluded ?? false}
                  onChange={(e) => onChange({ ...filters, foodIncluded: e.target.checked || undefined })}
                  className="h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
                />
                <span className="text-sm text-gray-700">Food Included</span>
              </label>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
