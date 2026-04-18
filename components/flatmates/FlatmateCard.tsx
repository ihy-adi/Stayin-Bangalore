import Link from 'next/link'
import Image from 'next/image'
import { Calendar, DollarSign, MapPin, MessageCircle, User } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { formatPrice, formatDate, genderLabel, getInitials } from '@/lib/utils'
import type { FlatmatePostWithRelations } from '@/types'

export function FlatmateCard({ post }: { post: FlatmatePostWithRelations }) {
  const genderBadge = {
    MALE: 'secondary' as const,
    FEMALE: 'warning' as const,
    ANY: 'outline' as const,
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div className="h-12 w-12 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center font-bold text-sm flex-shrink-0">
          {post.user.image ? (
            <Image
              src={post.user.image}
              alt={post.user.name ?? ''}
              width={48}
              height={48}
              className="rounded-full object-cover"
            />
          ) : (
            getInitials(post.user.name ?? 'U')
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-semibold text-gray-900">{post.user.name ?? 'Anonymous'}</h3>
            <Badge variant={genderBadge[post.genderPref]}>{genderLabel(post.genderPref)}</Badge>
          </div>
          <p className="text-sm text-gray-500 mt-0.5">Posted {formatDate(post.createdAt)}</p>
        </div>
      </div>

      <p className="mt-4 text-sm text-gray-700 leading-relaxed line-clamp-3">{post.bio}</p>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <DollarSign className="h-4 w-4 text-brand-500" />
          <span>{formatPrice(post.budgetShare)}/mo</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Calendar className="h-4 w-4 text-brand-500" />
          <span>From {formatDate(post.moveInDate)}</span>
        </div>
      </div>

      {post.property && (
        <Link
          href={`/listings/${post.property.id}`}
          className="mt-4 flex items-start gap-3 p-3 bg-gray-50 rounded-xl hover:bg-brand-50 transition-colors group"
        >
          <div className="relative h-12 w-16 flex-shrink-0 rounded-lg overflow-hidden bg-gray-200">
            {post.property.images?.[0] ? (
              <Image
                src={post.property.images[0].url}
                alt={post.property.title}
                fill
                className="object-cover"
                sizes="64px"
              />
            ) : (
              <div className="h-full w-full flex items-center justify-center">
                <MapPin className="h-4 w-4 text-gray-300" />
              </div>
            )}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium text-gray-900 line-clamp-1 group-hover:text-brand-600">{post.property.title}</p>
            <p className="text-xs text-gray-500 mt-0.5">{post.property.area} · {formatPrice(post.property.price)}/mo</p>
          </div>
        </Link>
      )}

      <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-sm text-gray-500">
          <MessageCircle className="h-4 w-4" />
          <span>via {post.contactMethod}</span>
        </div>
        <a
          href={post.contactMethod === 'WhatsApp'
            ? `https://wa.me/${post.contactValue.replace(/\D/g, '')}`
            : `mailto:${post.contactValue}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-medium text-brand-600 hover:underline"
        >
          Contact →
        </a>
      </div>
    </div>
  )
}
