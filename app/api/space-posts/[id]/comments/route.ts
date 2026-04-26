import { NextRequest, NextResponse } from 'next/server'

// SpacePostComment was removed in the schema migration.
export async function POST(_req: NextRequest, { params }: { params: { id: string } }) {
  return NextResponse.json({ error: 'Feature temporarily unavailable' }, { status: 503 })
}
