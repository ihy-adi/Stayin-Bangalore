import { NextRequest, NextResponse } from 'next/server'

// SpacePost was removed in the schema migration. This feature is pending redesign.
// GET returns empty array so list pages render gracefully.
// POST returns 503 so form submission shows an error instead of crashing.

export async function GET(_req: NextRequest) {
  return NextResponse.json([])
}

export async function POST(_req: NextRequest) {
  return NextResponse.json(
    { error: 'The share-space feature is currently being redesigned. Please check back soon.' },
    { status: 503 }
  )
}
