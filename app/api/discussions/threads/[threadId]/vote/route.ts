import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { z } from 'zod'
import { voteOnThread, DiscussionError } from '@/lib/actions/discussion'

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
      const status = err.code === 'NOT_FOUND' ? 404 : err.code === 'UNAUTHORIZED' ? 401 : 400
      return NextResponse.json({ error: err.message }, { status })
    }
    return NextResponse.json({ error: 'Failed to vote' }, { status: 500 })
  }
}
