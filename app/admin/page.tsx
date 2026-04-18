import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import {
  LayoutDashboard, Home, Users, MessageSquare, Flag,
  CheckCircle, XCircle, AlertTriangle, ArrowRight, Plus,
} from 'lucide-react'
import { formatDate, formatPrice, stayTypeLabel } from '@/lib/utils'

export const metadata = { title: 'Admin Dashboard' }

export default async function AdminPage() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'ADMIN') redirect('/')

  const [totalListings, totalUsers, pendingReports, recentListings] = await Promise.all([
    prisma.property.count(),
    prisma.user.count(),
    prisma.concernReport.count({ where: { status: 'PENDING' } }),
    prisma.property.findMany({
      take: 8,
      orderBy: { createdAt: 'desc' },
      include: {
        images: { where: { isPrimary: true }, take: 1 },
        _count: { select: { reviews: true, reports: true } },
      },
    }),
  ])

  const stats = [
    { label: 'Total Listings', value: totalListings, icon: Home, color: 'blue' },
    { label: 'Registered Users', value: totalUsers, icon: Users, color: 'green' },
    { label: 'Pending Reports', value: pendingReports, icon: Flag, color: 'red' },
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <LayoutDashboard className="h-5 w-5 text-brand-600" />
            <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          </div>
          <p className="text-sm text-gray-500">Manage listings, users, and community content</p>
        </div>
        <Link
          href="/admin/listings/new"
          className="inline-flex items-center gap-2 bg-brand-600 text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-brand-700 transition-colors"
        >
          <Plus className="h-4 w-4" /> Add Listing
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-2xl border border-gray-100 p-6">
            <div className={`h-11 w-11 rounded-xl flex items-center justify-center mb-4 ${
              color === 'blue' ? 'bg-blue-50' : color === 'green' ? 'bg-green-50' : 'bg-red-50'
            }`}>
              <Icon className={`h-6 w-6 ${
                color === 'blue' ? 'text-blue-600' : color === 'green' ? 'text-green-600' : 'text-red-600'
              }`} />
            </div>
            <p className="text-3xl font-bold text-gray-900">{value}</p>
            <p className="text-sm text-gray-500 mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Recent listings table */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">Recent Listings</h2>
          <Link href="/admin/listings" className="text-sm text-brand-600 hover:underline flex items-center gap-1">
            View all <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
              <tr>
                <th className="px-6 py-3 text-left font-medium">Property</th>
                <th className="px-6 py-3 text-left font-medium">Type</th>
                <th className="px-6 py-3 text-left font-medium">Price</th>
                <th className="px-6 py-3 text-left font-medium">Status</th>
                <th className="px-6 py-3 text-left font-medium">Added</th>
                <th className="px-6 py-3 text-left font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {recentListings.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-gray-100 flex-shrink-0 overflow-hidden">
                        {p.images[0] && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={p.images[0].url} alt="" className="h-full w-full object-cover" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 line-clamp-1">{p.title}</p>
                        <p className="text-xs text-gray-400">{p.area}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{stayTypeLabel(p.stayType)}</td>
                  <td className="px-6 py-4 font-medium text-gray-900">{formatPrice(p.price)}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5">
                      {p.isAvailable ? (
                        <><CheckCircle className="h-3.5 w-3.5 text-green-500" /><span className="text-green-700 text-xs">Available</span></>
                      ) : (
                        <><XCircle className="h-3.5 w-3.5 text-red-500" /><span className="text-red-700 text-xs">Unavailable</span></>
                      )}
                      {p._count.reports > 0 && (
                        <><AlertTriangle className="h-3.5 w-3.5 text-amber-500 ml-2" /><span className="text-amber-700 text-xs">{p._count.reports} report{p._count.reports > 1 ? 's' : ''}</span></>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-500 text-xs">{formatDate(p.createdAt)}</td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <Link href={`/listings/${p.id}`} className="text-xs text-brand-600 hover:underline">View</Link>
                      <Link href={`/admin/listings/${p.id}/edit`} className="text-xs text-gray-500 hover:underline">Edit</Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
