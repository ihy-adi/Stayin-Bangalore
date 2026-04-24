import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getThreadDetail } from '@/lib/actions/discussion'

// GET /api/discussions/threads/[threadId]
export async function GET(
  _req: NextRequest,
  { params }: { params: { threadId: string } }
) {
  const session = await getServerSession(authOptions)
  try {
    const thread = await getThreadDetail(params.threadId, session?.user?.id)
    if (!thread) return NextResponse.json({ error: 'Thread not found' }, { status: 404 })
    return NextResponse.json(thread)
  } catch {
    return NextResponse.json({ error: 'Failed to fetch thread' }, { status: 500 })
  }
}
