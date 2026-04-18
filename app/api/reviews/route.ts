import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const schema = z.object({
  propertyId: z.string(),
  rating: z.number().int().min(1).max(5),
  body: z.string().min(10),
  hasLivedThere: z.boolean(),
})

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await req.json()
    const data = schema.parse(body)

    const existing = await prisma.review.findFirst({
      where: { propertyId: data.propertyId, userId: session.user.id },
    })
    if (existing) {
      return NextResponse.json({ error: 'You have already reviewed this property' }, { status: 409 })
    }

    const review = await prisma.review.create({
      data: { ...data, userId: session.user.id },
      include: { user: { select: { id: true, name: true, image: true } } },
    })

    return NextResponse.json(review, { status: 201 })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.errors[0].message }, { status: 400 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
