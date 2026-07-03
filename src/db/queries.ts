import { sqlite } from './client'

export type LeaderboardRange = 'all' | 'today' | 'week'

export interface LeaderboardRow {
  runId: number
  playerName: string
  score: number
  accuracy: number
  avgResponseMs: number
  longestStreak: number
  heartsRemaining: number
  totalRounds: number
  correctRounds: number
  createdAt: number
}

export interface SaveRunInput {
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

function startOfRange(range: LeaderboardRange) {
  const now = new Date()
  if (range === 'today') {
    now.setHours(0, 0, 0, 0)
    return now.getTime()
  }
  if (range === 'week') {
    const day = now.getDay()
    const diff = day === 0 ? 6 : day - 1
    now.setDate(now.getDate() - diff)
    now.setHours(0, 0, 0, 0)
    return now.getTime()
  }
  return 0
}

export function saveRun(input: SaveRunInput) {
  const timestamp = Date.now()
  const tx = sqlite.transaction((payload: SaveRunInput) => {
    const player = sqlite.prepare('insert into players (name, created_at) values (?, ?)').run(payload.playerName.trim(), timestamp)
    const run = sqlite
      .prepare(
        'insert into runs (player_id, score, accuracy, avg_response_ms, longest_streak, hearts_remaining, total_rounds, correct_rounds, created_at) values (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      )
      .run(
        Number(player.lastInsertRowid),
        payload.score,
        payload.accuracy,
        payload.avgResponseMs,
        payload.longestStreak,
        payload.heartsRemaining,
        payload.totalRounds,
        payload.correctRounds,
        timestamp,
      )

    const insertRound = sqlite.prepare(
      'insert into round_results (run_id, image_id, category, player_guess, correct, response_ms, points_awarded, streak_at_time) values (?, ?, ?, ?, ?, ?, ?, ?)',
    )
    for (const round of payload.roundResults) {
      insertRound.run(
        Number(run.lastInsertRowid),
        round.imageId,
        round.category,
        round.playerGuess,
        round.correct ? 1 : 0,
        round.responseMs,
        round.pointsAwarded,
        round.streakAtTime,
      )
    }

    return Number(run.lastInsertRowid)
  })

  const runId = tx(input)
  return { runId }
}

export function getLeaderboard(range: LeaderboardRange): LeaderboardRow[] {
  const start = startOfRange(range)
  const sql = `
    select
      runs.id as runId,
      players.name as playerName,
      runs.score as score,
      runs.accuracy as accuracy,
      runs.avg_response_ms as avgResponseMs,
      runs.longest_streak as longestStreak,
      runs.hearts_remaining as heartsRemaining,
      runs.total_rounds as totalRounds,
      runs.correct_rounds as correctRounds,
      runs.created_at as createdAt
    from runs
    inner join players on players.id = runs.player_id
    ${range === 'all' ? '' : 'where runs.created_at >= ?'}
    order by runs.score desc, runs.accuracy desc, runs.created_at desc
    limit 10
  `
  const rows = range === 'all' ? sqlite.prepare(sql).all() : sqlite.prepare(sql).all(start)
  return rows as LeaderboardRow[]
}
