import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(price)
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(date))
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export function stayTypeLabel(type: string): string {
  const map: Record<string, string> = {
    PG: 'PG',
    APARTMENT: 'Apartment',
    TEMPORARY: 'Temporary Stay',
    SHARED_FLAT: 'Shared Flat',
  }
  return map[type] ?? type
}

export function furnishedLabel(status: string): string {
  const map: Record<string, string> = {
    FURNISHED: 'Fully Furnished',
    SEMI_FURNISHED: 'Semi-Furnished',
    UNFURNISHED: 'Unfurnished',
  }
  return map[status] ?? status
}

export function genderLabel(pref: string): string {
  const map: Record<string, string> = {
    MALE: 'Men Only',
    FEMALE: 'Women Only',
    ANY: 'Co-ed',
  }
  return map[pref] ?? pref
}

export function haversineDistance(
  lat1: number, lon1: number,
  lat2: number, lon2: number
): number {
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

export function truncate(str: string, length: number): string {
  return str.length > length ? str.slice(0, length) + '…' : str
}
