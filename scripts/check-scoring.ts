import assert from 'node:assert/strict'

import { buildRoundResult, scoreCorrectAnswer, summarizeRounds } from '../src/lib/scoring.ts'

assert.equal(scoreCorrectAnswer({ remainingSeconds: 10, streakCount: 10 }), 400)
assert.equal(scoreCorrectAnswer({ remainingSeconds: 0, streakCount: 1 }), 110)

const first = buildRoundResult({
  imageId: 'x',
  category: 'ai',
  playerGuess: 'ai',
  responseMs: 2500,
  remainingSeconds: 7.5,
  streakCount: 1,
})

const summary = summarizeRounds([first])

assert.equal(first.correct, true)
assert.equal(summary.totalRounds, 1)
assert.equal(summary.correctRounds, 1)
assert.equal(summary.longestStreak, 1)
