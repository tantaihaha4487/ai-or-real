import { NextResponse } from 'next/server'

import { saveRun } from '@/db/queries'

export async function POST(request: Request) {
  const body = (await request.json()) as {
    playerName: string
    score: number
    accuracy: number
    avgResponseMs: number
    longestStreak: number
    heartsRemaining: number
    totalRounds: number
    correctRounds: number
    roundResults: Array<{
      imageId: string
      category: 'ai' | 'human'
      playerGuess: 'ai' | 'human' | null
      correct: boolean
      responseMs: number
      pointsAwarded: number
      streakAtTime: number
    }>
  }

  const playerName = body.playerName.trim().slice(0, 24)
  if (!playerName) {
    return NextResponse.json({ error: 'ชื่อไม่ถูกต้อง' }, { status: 400 })
  }

  const run = saveRun({ ...body, playerName })
  return NextResponse.json({ ok: true, ...run })
}
