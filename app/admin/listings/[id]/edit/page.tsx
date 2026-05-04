import { redirect, notFound } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { ListingForm } from '@/components/admin/ListingForm'

export const metadata = { title: 'Edit Listing' }

export default async function EditListingPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'ADMIN') redirect('/')

  const [property, amenities] = await Promise.all([
    prisma.property.findUnique({
      where: { id: params.id },
      include: { media: true, amenities: true },
    }),
    prisma.amenity.findMany({ orderBy: { name: 'asc' } }),
  ])

  if (!property) notFound()

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Edit Listing</h1>
        <p className="text-sm text-gray-500 mt-1 truncate">{property.title}</p>
      </div>
      <ListingForm amenities={amenities} defaultValues={property as any} propertyId={property.id} />
    </div>
  )
}
