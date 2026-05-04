import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { ReviewSection } from '@/components/reviews/ReviewSection'
import { Badge } from '@/components/ui/Badge'
import { PropertyDiscussions } from '@/components/discussions/PropertyDiscussions'
import {
  MapPin, Phone, Mail, Wind, UtensilsCrossed, Wifi, Shield,
  Zap, Car, Bath, Package, BookOpen, Dumbbell, Camera,
  Sparkles, Droplet, Thermometer, Star, ChevronLeft,
  CheckCircle, Calendar, DollarSign, User,
} from 'lucide-react'
import { formatPrice, formatDate, stayTypeLabel, furnishedLabel, genderLabel } from '@/lib/utils'

const AMENITY_ICONS: Record<string, React.ReactNode> = {
  'Wi-Fi': <Wifi className="h-4 w-4" />,
  'AC': <Wind className="h-4 w-4" />,
  'Laundry': <span className="h-4 w-4 text-sm">👕</span>,
  'Parking': <Car className="h-4 w-4" />,
  'Power Backup': <Zap className="h-4 w-4" />,
  'Security': <Shield className="h-4 w-4" />,
  'Attached Bathroom': <Bath className="h-4 w-4" />,
  'Wardrobe': <Package className="h-4 w-4" />,
  'Study Table': <BookOpen className="h-4 w-4" />,
  'Gym': <Dumbbell className="h-4 w-4" />,
  'CCTV': <Camera className="h-4 w-4" />,
  'Housekeeping': <Sparkles className="h-4 w-4" />,
  'Water Purifier': <Droplet className="h-4 w-4" />,
  'Refrigerator': <Thermometer className="h-4 w-4" />,
}

async function getProperty(id: string) {
  const property = await prisma.property.findUnique({
    where: { id },
    include: {
      media: true,
      amenities: { include: { amenity: true } },
      reviews: {
        include: { user: { select: { id: true, name: true, image: true } } },
        orderBy: { createdAt: 'desc' },
      },
      owner: { select: { id: true, name: true, image: true, email: true, phone: true, isVerified: true } },
      _count: { select: { reviews: true, savedBy: true } },
    },
  })

  if (!property) return null

  const agg = await prisma.review.aggregate({
    where: { propertyId: id },
    _avg: { rating: true },
  })

  return { ...property, avgRating: agg._avg.rating ?? 0 }
}

export async function generateMetadata({ params }: { params: { id: string } }) {
  const p = await prisma.property.findUnique({ where: { id: params.id }, select: { title: true, area: true } })
  return { title: p ? `${p.title} — ${p.area}` : 'Listing Not Found' }
}

export default async function ListingDetailPage({ params }: { params: { id: string } }) {
  const property = await getProperty(params.id)
  if (!property) notFound()

  const primaryImage = property.media.find((i) => i.isPrimary) ?? property.media[0]
  const otherImages = property.media.filter((i) => i.id !== primaryImage?.id).slice(0, 4)

  const ownerPhone = property.owner.phone ?? ''
  const ownerEmail = property.owner.email ?? ''
  const ownerName = property.owner.name ?? 'Owner'

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back */}
      <Link href="/explore" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-brand-600 mb-6 transition-colors">
        <ChevronLeft className="h-4 w-4" /> Back to listings
      </Link>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left column — main content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Image gallery */}
          <div className="grid grid-cols-4 grid-rows-2 gap-2 h-80 sm:h-96 rounded-2xl overflow-hidden">
            {primaryImage ? (
              <div className="col-span-2 row-span-2 relative">
                <Image
                  src={primaryImage.url}
                  alt={primaryImage.caption ?? property.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                  priority
                />
              </div>
            ) : (
              <div className="col-span-2 row-span-2 bg-gray-100 flex items-center justify-center">
                <MapPin className="h-12 w-12 text-gray-300" />
              </div>
            )}
            {otherImages.map((img, i) => (
              <div key={img.id} className="relative">
                <Image
                  src={img.url}
                  alt={img.caption ?? `Image ${i + 2}`}
                  fill
                  className="object-cover"
                  sizes="25vw"
                />
              </div>
            ))}
            {Array.from({ length: Math.max(0, 4 - otherImages.length) }).map((_, i) => (
              <div key={`empty-${i}`} className="bg-gray-100" />
            ))}
          </div>

          {/* Title and badges */}
          <div>
            <div className="flex flex-wrap gap-2 mb-3">
              <Badge variant={property.propertyType === 'PG' ? 'default' : 'secondary'}>
                {stayTypeLabel(property.propertyType)}
              </Badge>
              {property.isVerified && <Badge variant="success"><CheckCircle className="h-3 w-3 mr-1" /> Verified</Badge>}
              {property.genderPreference !== 'ANY' && (
                <Badge variant={property.genderPreference === 'FEMALE' ? 'warning' : 'secondary'}>
                  {genderLabel(property.genderPreference)}
                </Badge>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight">{property.title}</h1>

            <div className="flex items-center gap-2 mt-2 text-gray-500 text-sm">
              <MapPin className="h-4 w-4" />
              <span>{property.addressLine1 ? `${property.addressLine1}, ` : ''}{property.area}, Bangalore</span>
            </div>

            <div className="flex items-center gap-3 mt-3">
              {property._count.reviews > 0 && (
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                  <span className="font-semibold text-gray-900">{property.avgRating.toFixed(1)}</span>
                  <span className="text-gray-400 text-sm">({property._count.reviews} reviews)</span>
                </div>
              )}
              <span className="text-gray-300">·</span>
              <span className="text-sm text-gray-500">{property._count.savedBy} saved</span>
            </div>
          </div>

          {/* Quick info pills */}
          <div className="flex flex-wrap gap-2">
            {[
              { label: property.roomType === 'PRIVATE' ? 'Private Room' : property.roomType ?? 'Room', show: !!property.roomType },
              { label: property.hasAc ? 'AC' : 'Non-AC', show: property.hasAc !== null },
              { label: furnishedLabel(property.furnishing ?? ''), show: !!property.furnishing },
              { label: 'Food Included', show: !!property.foodIncluded },
              { label: `Available from ${property.availableFrom ? formatDate(property.availableFrom) : 'Now'}`, show: true },
            ].filter((i) => i.show).map((item) => (
              <span key={item.label} className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
                {item.label}
              </span>
            ))}
          </div>

          {/* Description */}
          {property.description && (
            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-3">About this place</h2>
              <p className="text-gray-600 leading-relaxed whitespace-pre-line">{property.description}</p>
            </div>
          )}

          {/* Amenities */}
          {property.amenities.length > 0 && (
            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-4">Amenities</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {property.amenities.map((pa) => (
                  <div key={pa.amenityId} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                    <span className="text-brand-600">
                      {AMENITY_ICONS[pa.amenity.name] ?? <CheckCircle className="h-4 w-4" />}
                    </span>
                    <span className="text-sm text-gray-700 font-medium">{pa.amenity.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Reviews section */}
          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-4">Reviews & Community</h2>
            <ReviewSection
              propertyId={property.id}
              reviews={property.reviews as any}
              comments={[]}
              avgRating={property.avgRating}
            />
          </div>

          {/* Discussions */}
          <div>
            <PropertyDiscussions propertyId={property.id} propertyOwnerId={property.ownerId} />
          </div>
        </div>

        {/* Right column — contact card */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 space-y-4">
            {/* Price card */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
              <div className="flex items-baseline gap-1 mb-1">
                <span className="text-3xl font-bold text-gray-900">{formatPrice(property.rentAmount)}</span>
                <span className="text-gray-400 text-sm">/month</span>
              </div>
              {property.depositAmount && (
                <p className="text-sm text-gray-500 mb-5">
                  Deposit: {formatPrice(property.depositAmount)}
                </p>
              )}

              <div className="space-y-3 mb-5">
                <div className="flex flex-wrap items-center gap-2 text-sm text-gray-700">
                  <User className="h-4 w-4 text-gray-400" />
                  <span className="font-medium">{ownerName}</span>
                  {property.owner.isVerified && (
                    <Badge variant="success" className="text-[10px] py-0">
                      <CheckCircle className="h-3 w-3 mr-0.5" /> Verified
                    </Badge>
                  )}
                </div>
                {ownerPhone && (
                  <a
                    href={`tel:${ownerPhone}`}
                    className="flex items-center gap-3 text-sm text-gray-700 hover:text-brand-600 transition-colors"
                  >
                    <Phone className="h-4 w-4 text-gray-400" />
                    {ownerPhone}
                  </a>
                )}
                {ownerEmail && (
                  <a
                    href={`mailto:${ownerEmail}`}
                    className="flex items-center gap-3 text-sm text-gray-700 hover:text-brand-600 transition-colors"
                  >
                    <Mail className="h-4 w-4 text-gray-400" />
                    {ownerEmail}
                  </a>
                )}
              </div>

              {ownerPhone ? (
                <>
                  <a
                    href={`tel:${ownerPhone}`}
                    className="w-full bg-brand-600 hover:bg-brand-700 text-white font-medium rounded-xl py-3 flex items-center justify-center gap-2 text-sm transition-colors"
                  >
                    <Phone className="h-4 w-4" /> Contact Owner
                  </a>
                  <a
                    href={`https://wa.me/${ownerPhone.replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full mt-2 bg-green-500 hover:bg-green-600 text-white font-medium rounded-xl py-3 flex items-center justify-center gap-2 text-sm transition-colors"
                  >
                    WhatsApp
                  </a>
                </>
              ) : (
                <a
                  href={`mailto:${ownerEmail}`}
                  className="w-full bg-brand-600 hover:bg-brand-700 text-white font-medium rounded-xl py-3 flex items-center justify-center gap-2 text-sm transition-colors"
                >
                  <Mail className="h-4 w-4" /> Email Owner
                </a>
              )}
            </div>

            {/* Details card */}
            <div className="bg-white rounded-2xl border border-gray-200 p-5">
              <h3 className="font-semibold text-gray-900 mb-4 text-sm">Property Details</h3>
              <div className="space-y-3 text-sm">
                {[
                  { label: 'Stay Type', value: stayTypeLabel(property.propertyType) },
                  { label: 'Room', value: property.roomType ?? '—' },
                  { label: 'AC', value: property.hasAc ? 'Yes' : property.hasAc === false ? 'No' : '—' },
                  { label: 'Furnished', value: property.furnishing ? furnishedLabel(property.furnishing) : '—' },
                  { label: 'Food', value: property.foodIncluded ? 'Included' : 'Not included' },
                  { label: 'Available', value: property.availableFrom ? formatDate(property.availableFrom) : 'Now' },
                  { label: 'Listed by', value: property.owner.name ?? 'Owner' },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between">
                    <span className="text-gray-500">{label}</span>
                    <span className="font-medium text-gray-900">{value}</span>
                  </div>
                ))}
              </div>
            </div>

            {property.isAvailable === false && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700 text-center font-medium">
                This property is currently unavailable
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
