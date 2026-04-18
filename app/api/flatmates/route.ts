import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const schema = z.object({
  propertyId: z.string().optional(),
  propertyLink: z.string().url().optional(),
  genderPref: z.enum(['MALE', 'FEMALE', 'ANY']).default('ANY'),
  budgetShare: z.number().positive(),
  moveInDate: z.string(),
  bio: z.string().min(20),
  contactMethod: z.string().min(2),
  contactValue: z.string().min(5),
})

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const area = searchParams.get('area')

  const posts = await prisma.flatmatePost.findMany({
    where: {
      isActive: true,
      ...(area ? { property: { area: { contains: area, mode: 'insensitive' } } } : {}),
    },
    include: {
      user: { select: { id: true, name: true, image: true } },
      property: {
        select: {
          id: true, title: true, area: true, price: true,
          images: { where: { isPrimary: true }, take: 1 },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(posts)
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await req.json()
    const data = schema.parse(body)

    const post = await prisma.flatmatePost.create({
      data: { ...data, moveInDate: new Date(data.moveInDate), userId: session.user.id },
      include: {
        user: { select: { id: true, name: true, image: true } },
        property: { select: { id: true, title: true, area: true, price: true } },
      },
    })

    return NextResponse.json(post, { status: 201 })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.errors[0].message }, { status: 400 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
