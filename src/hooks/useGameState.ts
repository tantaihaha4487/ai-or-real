import { useReducer } from 'react'

import type { DatasetItem } from '@/lib/dataset-types'
import { buildRoundResult, summarizeRounds } from '@/lib/scoring'

export type GamePhase = 'loading' | 'countdown' | 'playing' | 'feedback' | 'finished'

export interface FeedbackState {
  correct: boolean
  guess: 'ai' | 'human' | null
  points: number
  responseMs: number
  timedOut: boolean
  correctCategory: 'ai' | 'human'
}

export interface GameRoundResult {
  imageId: string
  category: 'ai' | 'human'
  playerGuess: 'ai' | 'human' | null
  correct: boolean
  responseMs: number
  pointsAwarded: number
  streakAtTime: number
}

export interface GameState {
  phase: GamePhase
  rounds: DatasetItem[]
  roundIndex: number
  hearts: number
  streak: number
  longestStreak: number
  score: number
  correctRounds: number
  preloadProgress: number
  countdown: number
  currentStartedAt: number | null
  feedback: FeedbackState | null
  results: GameRoundResult[]
  terminal: boolean
}

type Action =
  | { type: 'set-rounds'; rounds: DatasetItem[] }
  | { type: 'set-preload-progress'; progress: number }
  | { type: 'start-countdown'; seconds: number }
  | { type: 'tick-countdown' }
  | { type: 'start-round'; startedAt: number }
  | { type: 'submit-answer'; guess: 'ai' | 'human' | null; responseMs: number; remainingSeconds: number }
  | { type: 'advance-round' }
  | { type: 'finish' }

const initialState: GameState = {
  phase: 'loading',
  rounds: [],
  roundIndex: 0,
  hearts: 3,
  streak: 0,
  longestStreak: 0,
  score: 0,
  correctRounds: 0,
  preloadProgress: 0,
  countdown: 3,
  currentStartedAt: null,
  feedback: null,
  results: [],
  terminal: false,
}

function reducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case 'set-rounds':
      return { ...state, rounds: action.rounds, phase: 'loading', preloadProgress: 0 }
    case 'set-preload-progress':
      return { ...state, preloadProgress: action.progress }
    case 'start-countdown':
      return { ...state, phase: 'countdown', countdown: action.seconds }
    case 'tick-countdown':
      return { ...state, countdown: Math.max(0, state.countdown - 1) }
    case 'start-round':
      return { ...state, phase: 'playing', currentStartedAt: action.startedAt, feedback: null }
    case 'submit-answer': {
      if (state.roundIndex >= state.rounds.length) return state
      const round = state.rounds[state.roundIndex]
      const streak = action.guess && action.guess === round.category ? state.streak + 1 : 0
      const result = buildRoundResult({
        imageId: round.id,
        category: round.category,
        playerGuess: action.guess,
        responseMs: action.responseMs,
        remainingSeconds: action.remainingSeconds,
        streakCount: streak,
      })
      const nextResults = [...state.results, result]
      const stats = summarizeRounds(nextResults)
      return {
        ...state,
        phase: 'feedback',
        streak,
        longestStreak: Math.max(state.longestStreak, streak),
        score: stats.score,
        correctRounds: stats.correctRounds,
        hearts: result.correct ? state.hearts : state.hearts - 1,
        feedback: {
          correct: result.correct,
          guess: action.guess,
          points: result.pointsAwarded,
          responseMs: action.responseMs,
          timedOut: action.guess === null,
          correctCategory: round.category,
        },
        results: nextResults,
        terminal: state.hearts - (result.correct ? 0 : 1) <= 0 || state.roundIndex + 1 >= state.rounds.length,
      }
    }
    case 'advance-round': {
      const nextIndex = state.roundIndex + 1
      if (state.terminal || nextIndex >= state.rounds.length || state.hearts <= 0) {
        return { ...state, phase: 'finished' }
      }
      return { ...state, phase: 'playing', roundIndex: nextIndex, currentStartedAt: Date.now(), feedback: null }
    }
    case 'finish':
      return { ...state, phase: 'finished' }
    default:
      return state
  }
}

export function useGameState(rounds: DatasetItem[]) {
  const [state, dispatch] = useReducer(reducer, {
    ...initialState,
    rounds,
  })

  return { state, dispatch }
}
