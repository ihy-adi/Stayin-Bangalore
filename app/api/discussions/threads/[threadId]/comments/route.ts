import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { z } from 'zod'
import { createComment, DiscussionError } from '@/lib/actions/discussion'

const schema = z.object({
  content: z.string().trim().min(2, 'Comment must be at least 2 characters').max(3000),
  // parentCommentId must be a valid UUID if supplied
  parentCommentId: z.string().uuid('Invalid parent comment ID').optional(),
})

// POST /api/discussions/threads/[threadId]/comments
export async function POST(
  req: NextRequest,
  { params }: { params: { threadId: string } },
) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = schema.parse(await req.json())
    const comment = await createComment({ ...body, threadId: params.threadId })
    return NextResponse.json(comment, { status: 201 })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.errors[0].message }, { status: 400 })
    }
    if (err instanceof DiscussionError) {
      const status =
        err.code === 'NOT_FOUND'    ? 404 :
        err.code === 'FORBIDDEN'    ? 403 :
        err.code === 'UNAUTHORIZED' ? 401 : 400
      return NextResponse.json({ error: err.message }, { status })
    }
    return NextResponse.json({ error: 'Failed to create comment' }, { status: 500 })
  }
}
