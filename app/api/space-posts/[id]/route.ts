import { NextRequest, NextResponse } from 'next/server'

// SpacePost was removed in the schema migration.
export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  return NextResponse.json({ error: 'Not found' }, { status: 404 })
}
