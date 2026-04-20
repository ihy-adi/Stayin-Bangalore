import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const schema = z.object({
  title: z.string().min(5),
  description: z.string().min(30),
  spaceType: z.enum(['PG', 'APARTMENT', 'TEMPORARY', 'SHARED_FLAT']),
  area: z.string().min(2),
  price: z.number().positive(),
  imageUrl: z.string().url().optional().or(z.literal('')),
  contactName: z.string().min(2),
  contactPhone: z.string().min(10),
})

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const area = searchParams.get('area')

  const posts = await prisma.spacePost.findMany({
    where: {
      isActive: true,
      ...(area ? { area: { contains: area, mode: 'insensitive' } } : {}),
    },
    include: {
      user: { select: { id: true, name: true, image: true } },
      _count: { select: { comments: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(posts)
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const data = schema.parse(await req.json())
    const post = await prisma.spacePost.create({
      data: {
        ...data,
        imageUrl: data.imageUrl || null,
        userId: session.user.id,
      },
      include: { user: { select: { id: true, name: true, image: true } } },
    })
    return NextResponse.json(post, { status: 201 })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.errors[0].message }, { status: 400 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
