import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const listingSchema = z.object({
  title: z.string().min(5),
  description: z.string().min(20),
  stayType: z.enum(['PG', 'APARTMENT', 'TEMPORARY', 'SHARED_FLAT']),
  address: z.string().min(5),
  area: z.string().min(2),
  latitude: z.number(),
  longitude: z.number(),
  price: z.number().positive(),
  deposit: z.number().nonnegative(),
  roomType: z.enum(['PRIVATE', 'SHARED']),
  hasAC: z.boolean().default(false),
  isFurnished: z.enum(['FURNISHED', 'SEMI_FURNISHED', 'UNFURNISHED']),
  foodIncluded: z.boolean().default(false),
  genderPreference: z.enum(['MALE', 'FEMALE', 'ANY']).default('ANY'),
  availableFrom: z.string(),
  contactName: z.string().min(2),
  contactPhone: z.string().min(10),
  contactEmail: z.string().email().optional().nullable(),
  amenityIds: z.array(z.string()).default([]),
  images: z.array(z.object({ url: z.string().url(), alt: z.string().optional(), isPrimary: z.boolean() })).default([]),
})

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)

  const where: any = { isAvailable: true }

  const stayTypes = searchParams.get('stayType')?.split(',').filter(Boolean)
  if (stayTypes?.length) where.stayType = { in: stayTypes }

  const area = searchParams.get('area')
  if (area) where.area = { contains: area, mode: 'insensitive' }

  const minPrice = searchParams.get('minPrice')
  const maxPrice = searchParams.get('maxPrice')
  if (minPrice || maxPrice) {
    where.price = {}
    if (minPrice) where.price.gte = parseInt(minPrice)
    if (maxPrice) where.price.lte = parseInt(maxPrice)
  }

  if (searchParams.get('hasAC') === 'true') where.hasAC = true
  if (searchParams.get('foodIncluded') === 'true') where.foodIncluded = true

  const roomType = searchParams.get('roomType')
  if (roomType) where.roomType = roomType

  const isFurnished = searchParams.get('isFurnished')
  if (isFurnished) where.isFurnished = isFurnished

  const genderPref = searchParams.get('genderPreference')
  if (genderPref) where.genderPreference = { in: [genderPref, 'ANY'] }

  const query = searchParams.get('q')
  if (query) {
    where.OR = [
      { title: { contains: query, mode: 'insensitive' } },
      { description: { contains: query, mode: 'insensitive' } },
      { area: { contains: query, mode: 'insensitive' } },
      { address: { contains: query, mode: 'insensitive' } },
    ]
  }

  const sortBy = searchParams.get('sortBy') ?? 'newest'
  let orderBy: any = { createdAt: 'desc' }
  if (sortBy === 'price_asc') orderBy = { price: 'asc' }
  if (sortBy === 'price_desc') orderBy = { price: 'desc' }

  const properties = await prisma.property.findMany({
    where,
    orderBy,
    include: {
      images: { where: { isPrimary: true }, take: 1 },
      amenities: { include: { amenity: true } },
      _count: { select: { reviews: true } },
    },
  })

  // Attach avg rating
  const enriched = await Promise.all(
    properties.map(async (p) => {
      const agg = await prisma.review.aggregate({
        where: { propertyId: p.id },
        _avg: { rating: true },
      })
      return { ...p, avgRating: agg._avg.rating ?? 0 }
    })
  )

  return NextResponse.json(enriched)
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await req.json()
    const data = listingSchema.parse(body)
    const { amenityIds, images, availableFrom, ...rest } = data

    const property = await prisma.property.create({
      data: {
        ...rest,
        availableFrom: new Date(availableFrom),
        createdById: session.user.id,
        amenities: {
          create: amenityIds.map((id) => ({ amenityId: id })),
        },
        images: { create: images },
      },
      include: { images: true, amenities: { include: { amenity: true } } },
    })

    return NextResponse.json(property, { status: 201 })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.errors[0].message }, { status: 400 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
