import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { z } from 'zod'
import { voteOnThread } from '@/lib/actions/discussion'
import { DiscussionError, httpStatusForDiscussionError } from '@/lib/actions/discussion-errors'

const schema = z.object({ voteType: z.enum(['UP', 'DOWN']) })

// POST /api/discussions/threads/[threadId]/vote
export async function POST(
  req: NextRequest,
  { params }: { params: { threadId: string } },
) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { voteType } = schema.parse(await req.json())
    const result = await voteOnThread(params.threadId, voteType)
    return NextResponse.json(result)
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.errors[0].message }, { status: 400 })
    }
    if (err instanceof DiscussionError) {
      return NextResponse.json(
        { error: err.message },
        { status: httpStatusForDiscussionError(err.code) },
      )
    }
    return NextResponse.json({ error: 'Failed to vote' }, { status: 500 })
  }
}
