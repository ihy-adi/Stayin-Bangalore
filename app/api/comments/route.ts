import { NextRequest, NextResponse } from 'next/server'

// The old Comment model was removed. Property comments are now handled via DiscussionThread.
// This endpoint is kept to avoid 404s but directs clients to use the discussions API.
export async function POST(_req: NextRequest) {
  return NextResponse.json(
    { error: 'Comments have moved to Discussions. Use /api/discussions/properties/:id instead.' },
    { status: 410 }
  )
}
