import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const schema = z.object({
  propertyId: z.string().optional(),
  title: z.string().min(5),
  description: z.string().min(20),
  preferredGender: z.enum(['MALE', 'FEMALE', 'ANY', 'FAMILY']).default('ANY'),
  budgetShare: z.number().positive().optional(),
  moveInDate: z.string().optional(),
  contactMethod: z.string().min(2).optional(),
})

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const area = searchParams.get('area')

  try {
    const posts = await prisma.flatmatePost.findMany({
      where: {
        status: 'VISIBLE',
        ...(area ? { property: { area: { contains: area, mode: 'insensitive' } } } : {}),
      },
      include: {
        user: { select: { id: true, name: true, image: true } },
        property: {
          select: {
            id: true, title: true, area: true, rentAmount: true,
            media: { where: { isPrimary: true }, take: 1 },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(posts)
  } catch (err) {
    console.error('[GET /api/flatmates]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await req.json()
    const data = schema.parse(body)

    const post = await prisma.flatmatePost.create({
      data: {
        ...data,
        moveInDate: data.moveInDate ? new Date(data.moveInDate) : null,
        userId: session.user.id,
      },
      include: {
        user: { select: { id: true, name: true, image: true } },
        property: { select: { id: true, title: true, area: true, rentAmount: true } },
      },
    })

    return NextResponse.json(post, { status: 201 })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.errors[0].message }, { status: 400 })
    }
    console.error('[POST /api/flatmates]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
