import { NextResponse } from 'next/server'

import { getLeaderboard, type LeaderboardRange } from '@/db/queries'

export async function GET(request: Request) {
  const url = new URL(request.url)
  const range = (url.searchParams.get('range') === 'today' || url.searchParams.get('range') === 'week' ? url.searchParams.get('range') : 'all') as LeaderboardRange
  return NextResponse.json({ range, rows: getLeaderboard(range) })
}
