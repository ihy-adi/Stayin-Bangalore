import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const listingSchema = z.object({
  title: z.string().min(5),
  description: z.string().min(20),
  propertyType: z.enum(['PG', 'APARTMENT', 'FLAT', 'ROOM', 'HOSTEL', 'CO_LIVING', 'SERVICE_APARTMENT']),
  addressLine1: z.string().min(5),
  addressLine2: z.string().optional().nullable(),
  area: z.string().min(2),
  latitude: z.number().optional().nullable(),
  longitude: z.number().optional().nullable(),
  rentAmount: z.number().positive(),
  depositAmount: z.number().nonnegative().optional().nullable(),
  roomType: z.enum(['PRIVATE', 'SHARED', 'SINGLE', 'DOUBLE_SHARING', 'TRIPLE_SHARING', 'FOUR_SHARING', 'ONE_BHK', 'TWO_BHK', 'THREE_BHK', 'STUDIO']).optional().nullable(),
  hasAc: z.boolean().default(false),
  furnishing: z.enum(['FULLY_FURNISHED', 'SEMI_FURNISHED', 'UNFURNISHED']).optional().nullable(),
  foodIncluded: z.boolean().default(false),
  genderPreference: z.enum(['MALE', 'FEMALE', 'ANY', 'FAMILY']).default('ANY'),
  availableFrom: z.string().optional().nullable(),
  amenityIds: z.array(z.string()).default([]),
  media: z.array(z.object({ url: z.string().url(), caption: z.string().optional(), isPrimary: z.boolean(), mediaType: z.enum(['IMAGE', 'VIDEO']).default('IMAGE') })).default([]),
})

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)

  const where: any = { isAvailable: true, status: 'ACTIVE' }

  const propertyTypes = searchParams.get('propertyType')?.split(',').filter(Boolean)
  if (propertyTypes?.length) where.propertyType = { in: propertyTypes }

  const area = searchParams.get('area')
  if (area) where.area = { contains: area, mode: 'insensitive' }

  const minPrice = searchParams.get('minPrice')
  const maxPrice = searchParams.get('maxPrice')
  if (minPrice || maxPrice) {
    where.rentAmount = {}
    if (minPrice) where.rentAmount.gte = parseInt(minPrice)
    if (maxPrice) where.rentAmount.lte = parseInt(maxPrice)
  }

  if (searchParams.get('hasAc') === 'true') where.hasAc = true
  if (searchParams.get('foodIncluded') === 'true') where.foodIncluded = true

  const roomType = searchParams.get('roomType')
  if (roomType) where.roomType = roomType

  const furnishing = searchParams.get('furnishing')
  if (furnishing) where.furnishing = furnishing

  const genderPref = searchParams.get('genderPreference')
  if (genderPref) where.genderPreference = { in: [genderPref, 'ANY'] }

  const query = searchParams.get('q')
  if (query) {
    where.OR = [
      { title: { contains: query, mode: 'insensitive' } },
      { description: { contains: query, mode: 'insensitive' } },
      { area: { contains: query, mode: 'insensitive' } },
      { addressLine1: { contains: query, mode: 'insensitive' } },
    ]
  }

  const sortBy = searchParams.get('sortBy') ?? 'newest'
  let orderBy: any = { createdAt: 'desc' }
  if (sortBy === 'price_asc') orderBy = { rentAmount: 'asc' }
  if (sortBy === 'price_desc') orderBy = { rentAmount: 'desc' }

  try {
    const properties = await prisma.property.findMany({
      where,
      orderBy,
      include: {
        media: { where: { isPrimary: true }, take: 1 },
        amenities: { include: { amenity: true } },
        _count: { select: { reviews: true } },
      },
    })

    const enriched = await Promise.all(
      properties.map(async (p) => {
        const agg = await prisma.review.aggregate({
          where: { propertyId: p.id },
          _avg: { rating: true },
        })
        return {
          ...p,
          latitude: p.latitude ? Number(p.latitude) : null,
          longitude: p.longitude ? Number(p.longitude) : null,
          avgRating: agg._avg.rating ?? 0,
        }
      })
    )

    return NextResponse.json(enriched)
  } catch (err) {
    console.error('[GET /api/listings]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await req.json()
    const data = listingSchema.parse(body)
    const { amenityIds, media, availableFrom, ...rest } = data

    const property = await prisma.property.create({
      data: {
        ...rest,
        status: 'ACTIVE',
        slug: `${rest.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}-${Date.now()}`,
        availableFrom: availableFrom ? new Date(availableFrom) : null,
        ownerId: session.user.id,
        amenities: {
          create: amenityIds.map((id) => ({ amenityId: id })),
        },
        media: { create: media },
      },
      include: { media: true, amenities: { include: { amenity: true } } },
    })

    return NextResponse.json(property, { status: 201 })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.errors[0].message }, { status: 400 })
    }
    console.error('[POST /api/listings]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
