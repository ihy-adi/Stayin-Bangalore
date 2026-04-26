import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import Image from 'next/image'
import { Tag, MapPin, Star, ArrowRight } from 'lucide-react'
import { formatPrice, stayTypeLabel } from '@/lib/utils'
import { Badge } from '@/components/ui/Badge'

export const metadata = { title: 'Verified Listings — Find Me A Place' }

export const revalidate = 3600

async function getVerifiedListings() {
  const listings = await prisma.property.findMany({
    where: {
      isVerified: true,
      isAvailable: true,
    },
    include: {
      media: { where: { isPrimary: true }, take: 1 },
      _count: { select: { reviews: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  const enriched = await Promise.all(
    listings.map(async (p) => {
      const agg = await prisma.review.aggregate({
        where: { propertyId: p.id },
        _avg: { rating: true },
      })
      return { ...p, avgRating: agg._avg.rating ?? 0 }
    })
  )
  return enriched
}

export default async function PromotionsPage() {
  const listings = await getVerifiedListings()

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 bg-amber-50 text-amber-700 rounded-full px-4 py-1.5 text-sm font-medium mb-4">
          <Tag className="h-4 w-4" /> Verified Properties
        </div>
        <h1 className="text-3xl font-extrabold text-gray-900">Verified Listings</h1>
        <p className="text-gray-500 mt-2 max-w-xl mx-auto text-sm">
          Hand-picked and verified properties across Bangalore. Updated regularly.
        </p>
      </div>

      {listings.length === 0 ? (
        <div className="text-center py-20">
          <Tag className="h-14 w-14 text-gray-200 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-700">No verified listings right now</h3>
          <p className="text-sm text-gray-400 mt-1">Check back soon — we verify properties regularly</p>
          <Link href="/explore" className="inline-flex items-center gap-1.5 mt-5 text-brand-600 hover:underline text-sm font-medium">
            Browse all listings <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {listings.map((listing) => (
            <Link key={listing.id} href={`/listings/${listing.id}`} className="group block">
              <div className="bg-white rounded-2xl border border-amber-100 overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 relative">
                {/* Verified ribbon */}
                <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs font-bold px-4 py-1.5 flex items-center gap-2">
                  <Tag className="h-3.5 w-3.5" />
                  Verified Property
                </div>

                {/* Image */}
                <div className="relative h-52 bg-gray-100 mt-8">
                  {listing.media[0] ? (
                    <Image
                      src={listing.media[0].url}
                      alt={listing.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-amber-50 to-orange-50 flex items-center justify-center">
                      <MapPin className="h-10 w-10 text-amber-200" />
                    </div>
                  )}
                  <div className="absolute top-3 left-3">
                    <Badge variant="warning">{stayTypeLabel(listing.propertyType)}</Badge>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5">
                  <h3 className="font-semibold text-gray-900 line-clamp-2 group-hover:text-brand-600 transition-colors leading-tight">
                    {listing.title}
                  </h3>
                  <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-1.5">
                    <MapPin className="h-3 w-3" />
                    {listing.area}, Bangalore
                  </div>

                  <div className="flex items-center justify-between mt-4">
                    <div>
                      <span className="text-xl font-bold text-gray-900">{formatPrice(listing.rentAmount)}</span>
                      <span className="text-xs text-gray-400">/month</span>
                    </div>
                    {listing._count.reviews > 0 && (
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                        <span className="font-medium text-gray-700">{listing.avgRating.toFixed(1)}</span>
                        <span>({listing._count.reviews})</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* CTA for owners */}
      <div className="mt-16 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-100 rounded-2xl p-8 text-center">
        <h2 className="text-lg font-bold text-gray-900 mb-2">Own a PG or apartment?</h2>
        <p className="text-sm text-gray-500 mb-4">List your property and get it verified to attract more tenants.</p>
        <Link
          href="/share-space"
          className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-6 py-2.5 rounded-xl text-sm font-medium transition-colors"
        >
          List your space <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  )
}
