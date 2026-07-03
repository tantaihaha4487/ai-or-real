export type GuessCategory = 'ai' | 'human'

export interface ScoringInput {
  remainingSeconds: number
  streakCount: number
}

export interface RoundResult {
  imageId: string
  category: GuessCategory
  playerGuess: GuessCategory | null
  correct: boolean
  responseMs: number
  pointsAwarded: number
  streakAtTime: number
}

export function scoreCorrectAnswer({ remainingSeconds, streakCount }: ScoringInput) {
  const base = 100
  const timeBonus = Math.floor(Math.max(0, Math.min(10, remainingSeconds)) * 10)
  const multiplier = 1 + Math.min(streakCount, 10) * 0.1
  return Math.floor((base + timeBonus) * multiplier)
}

export function buildRoundResult(input: {
  imageId: string
  category: GuessCategory
  playerGuess: GuessCategory | null
  responseMs: number
  remainingSeconds: number
  streakCount: number
}) : RoundResult {
  const correct = input.playerGuess === input.category
  const streakAtTime = correct ? input.streakCount : 0
  return {
    imageId: input.imageId,
    category: input.category,
    playerGuess: input.playerGuess,
    correct,
    responseMs: input.responseMs,
    pointsAwarded: correct ? scoreCorrectAnswer({ remainingSeconds: input.remainingSeconds, streakCount: streakAtTime }) : 0,
    streakAtTime,
  }
}

export function summarizeRounds(rounds: RoundResult[]) {
  const totalRounds = rounds.length
  const correctRounds = rounds.filter((round) => round.correct).length
  const score = rounds.reduce((sum, round) => sum + round.pointsAwarded, 0)
  const accuracy = totalRounds === 0 ? 0 : (correctRounds / totalRounds) * 100
  const averageResponseMs = totalRounds === 0 ? 0 : Math.round(rounds.reduce((sum, round) => sum + round.responseMs, 0) / totalRounds)
  const longestStreak = rounds.reduce((max, round) => Math.max(max, round.streakAtTime), 0)
  return {
    totalRounds,
    correctRounds,
    score,
    accuracy,
    averageResponseMs,
    longestStreak,
  }
}
