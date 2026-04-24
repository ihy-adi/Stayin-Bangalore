import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { z } from 'zod'
import { createComment } from '@/lib/actions/discussion'

const schema = z.object({
  content: z.string().min(2).max(3000),
  parentCommentId: z.string().uuid().optional(),
})

// POST /api/discussions/threads/[threadId]/comments
export async function POST(
  req: NextRequest,
  { params }: { params: { threadId: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body = schema.parse(await req.json())
    const comment = await createComment({ ...body, threadId: params.threadId })
    return NextResponse.json(comment, { status: 201 })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.errors[0].message }, { status: 400 })
    }
    return NextResponse.json({ error: 'Failed to create comment' }, { status: 500 })
  }
}
