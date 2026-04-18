import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(_req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const saved = await prisma.savedListing.findMany({
    where: { userId: session.user.id },
    include: {
      property: {
        include: {
          images: { where: { isPrimary: true }, take: 1 },
          amenities: { include: { amenity: true } },
          _count: { select: { reviews: true } },
        },
      },
    },
    orderBy: { savedAt: 'desc' },
  })

  return NextResponse.json(saved.map((s) => s.property))
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { propertyId } = await req.json()
  if (!propertyId) return NextResponse.json({ error: 'propertyId required' }, { status: 400 })

  await prisma.savedListing.upsert({
    where: { userId_propertyId: { userId: session.user.id, propertyId } },
    update: {},
    create: { userId: session.user.id, propertyId },
  })

  return NextResponse.json({ saved: true })
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { propertyId } = await req.json()
  await prisma.savedListing.deleteMany({
    where: { userId: session.user.id, propertyId },
  })

  return NextResponse.json({ saved: false })
}
