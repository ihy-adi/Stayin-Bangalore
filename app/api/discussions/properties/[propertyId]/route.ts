import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { z } from 'zod'
import { getThreadsForProperty, createThread } from '@/lib/actions/discussion'

const createThreadSchema = z.object({
  type: z.enum(['QUESTION', 'FEEDBACK', 'TIP', 'WARNING', 'FLATMATE', 'GENERAL']),
  title: z.string().max(200).optional(),
  content: z.string().min(5).max(5000),
})

// GET /api/discussions/properties/[propertyId]
export async function GET(
  _req: NextRequest,
  { params }: { params: { propertyId: string } }
) {
  const session = await getServerSession(authOptions)
  try {
    const threads = await getThreadsForProperty(params.propertyId, session?.user?.id)
    return NextResponse.json(threads)
  } catch {
    return NextResponse.json({ error: 'Failed to fetch threads' }, { status: 500 })
  }
}

// POST /api/discussions/properties/[propertyId]
export async function POST(
  req: NextRequest,
  { params }: { params: { propertyId: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body = createThreadSchema.parse(await req.json())
    const thread = await createThread({ ...body, propertyId: params.propertyId })
    return NextResponse.json(thread, { status: 201 })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.errors[0].message }, { status: 400 })
    }
    return NextResponse.json({ error: 'Failed to create thread' }, { status: 500 })
  }
}
