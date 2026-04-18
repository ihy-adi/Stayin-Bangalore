import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { ListingForm } from '@/components/admin/ListingForm'

export const metadata = { title: 'Add New Listing' }

export default async function NewListingPage() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'ADMIN') redirect('/')

  const amenities = await prisma.amenity.findMany({ orderBy: { name: 'asc' } })

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Add New Listing</h1>
        <p className="text-sm text-gray-500 mt-1">Create a new property listing for Stayin Bangalore</p>
      </div>
      <ListingForm amenities={amenities} />
    </div>
  )
}
