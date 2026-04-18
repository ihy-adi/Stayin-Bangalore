import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const schema = z.object({
  propertyId: z.string(),
  body: z.string().min(5),
  concernType: z.enum([
    'CLEANLINESS', 'SAFETY', 'FOOD_QUALITY', 'HIDDEN_CHARGES',
    'MISLEADING_PHOTOS', 'NOISE', 'OWNER_BEHAVIOR', 'OTHER',
  ]).optional(),
})

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const data = schema.parse(await req.json())
    const comment = await prisma.comment.create({
      data: { ...data, userId: session.user.id },
      include: { user: { select: { id: true, name: true, image: true } } },
    })
    return NextResponse.json(comment, { status: 201 })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.errors[0].message }, { status: 400 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
