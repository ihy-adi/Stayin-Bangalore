import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

async function requireAdmin(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'ADMIN') {
    return null
  }
  return session
}

export async function GET(req: NextRequest) {
  const session = await requireAdmin(req)
  if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const properties = await prisma.property.findMany({
    include: {
      media: { where: { isPrimary: true }, take: 1 },
      owner: { select: { name: true, email: true } },
      _count: { select: { reviews: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(properties)
}
