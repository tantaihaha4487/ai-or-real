'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useRouter } from 'next/navigation'

import { CountdownOverlay } from '@/components/game/countdown-overlay'
import { GuessButtons } from '@/components/game/guess-buttons'
import { HeartsDisplay } from '@/components/game/hearts-display'
import { ImageCard } from '@/components/game/image-card'
import { RoundFeedback } from '@/components/game/round-feedback'
import { StreakToast } from '@/components/game/streak-toast'
import { TimerBar } from '@/components/game/timer-bar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { useGameState } from '@/hooks/useGameState'
import type { DatasetItem } from '@/lib/dataset-types'
import { formatMs, formatSeconds } from '@/lib/utils'
import { createSoundPlayer } from '@/lib/sounds'
import { summarizeRounds, type RoundResult } from '@/lib/scoring'

const DEBUG_LABELS = process.env.NEXT_PUBLIC_DEBUG_LABELS === 'true'
const MILITONES = new Set([3, 5, 8, 10])
const ROUND_SECONDS = 10
const FEEDBACK_MS = 1100
const storageKey = 'ai-or-human:last-run'

type StoredRun = {
  playerName: string
  score: number
  accuracy: number
  avgResponseMs: number
  longestStreak: number
  heartsRemaining: number
  totalRounds: number
  correctRounds: number
  roundResults: RoundResult[]
}

export function GameClient({ playerName, rounds }: { playerName: string; rounds: DatasetItem[] }) {
  const router = useRouter()
  const sound = useMemo(() => createSoundPlayer(), [])
  const { state, dispatch } = useGameState(rounds)
  const [secondsLeft, setSecondsLeft] = useState(ROUND_SECONDS)
  const [streakToast, setStreakToast] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const resolvedRef = useRef(false)
  const tickRef = useRef<number | null>(null)
  const feedbackRef = useRef<number | null>(null)
  const lastTickSecondRef = useRef<number>(0)

  useEffect(() => {
    dispatch({ type: 'set-rounds', rounds })
  }, [dispatch, rounds])

  useEffect(() => {
    let cancelled = false
    let loaded = 0

    const preload = async () => {
      await Promise.all(
        rounds.map(
          (item) =>
            new Promise<void>((resolve) => {
              const image = new Image()
              image.onload = () => {
                loaded += 1
                dispatch({ type: 'set-preload-progress', progress: loaded / rounds.length })
                resolve()
              }
              image.onerror = () => {
                loaded += 1
                dispatch({ type: 'set-preload-progress', progress: loaded / rounds.length })
                resolve()
              }
              image.src = item.path
            }),
        ),
      )

      if (!cancelled) {
        setLoading(false)
        dispatch({ type: 'start-countdown', seconds: 3 })
      }
    }

    void preload()
    return () => {
      cancelled = true
    }
  }, [dispatch, rounds])

  useEffect(() => {
    if (state.phase !== 'countdown') return undefined
    if (state.countdown === 0) {
      dispatch({ type: 'start-round', startedAt: Date.now() })
      return undefined
    }

    const timeout = window.setTimeout(() => {
      dispatch({ type: 'tick-countdown' })
    }, 1000)

    return () => window.clearTimeout(timeout)
  }, [dispatch, state.countdown, state.phase])

  const submitGuess = useCallback(
    async (guess: 'ai' | 'human' | null) => {
      if (resolvedRef.current || state.phase !== 'playing' || !state.currentStartedAt) return

      const round = state.rounds[state.roundIndex]
      if (!round) return

      resolvedRef.current = true
      const responseMs = Date.now() - state.currentStartedAt
      const remainingSeconds = Math.max(0, ROUND_SECONDS - responseMs / 1000)
      const correct = guess !== null && guess === round.category
      const nextStreak = correct ? state.streak + 1 : 0

      if (correct) {
        sound.play('correct')
      } else {
        sound.play('wrong')
        sound.play('heart')
      }

      dispatch({ type: 'submit-answer', guess, responseMs, remainingSeconds })
    },
    [dispatch, sound, state.currentStartedAt, state.phase, state.roundIndex, state.rounds, state.streak],
  )

  useEffect(() => {
    const startedAt = state.currentStartedAt
    if (state.phase !== 'playing' || !startedAt) return undefined
    resolvedRef.current = false
    setSecondsLeft(ROUND_SECONDS)
    lastTickSecondRef.current = 0

    const step = () => {
      const elapsed = (Date.now() - startedAt) / 1000
      const remaining = Math.max(0, ROUND_SECONDS - elapsed)
      setSecondsLeft(remaining)

      const wholeSecond = Math.ceil(remaining)
      if (wholeSecond <= 3 && wholeSecond > 0 && wholeSecond !== lastTickSecondRef.current) {
        sound.play('tick')
        lastTickSecondRef.current = wholeSecond
      }

      if (remaining <= 0 && !resolvedRef.current) {
        void submitGuess(null)
        return
      }

      tickRef.current = window.requestAnimationFrame(step)
    }

    tickRef.current = window.requestAnimationFrame(step)
    return () => {
      if (tickRef.current) window.cancelAnimationFrame(tickRef.current)
    }
  }, [sound, state.currentStartedAt, state.phase, submitGuess])

  useEffect(() => {
    if (state.phase !== 'feedback' || !state.feedback) return undefined

    if (state.feedback.correct && MILITONES.has(state.streak)) {
      setStreakToast(state.streak)
      sound.play('combo')
      window.setTimeout(() => setStreakToast(null), 1300)
    }

    feedbackRef.current = window.setTimeout(() => {
      if (state.terminal) {
        sound.play(state.hearts <= 0 ? 'gameover' : 'victory')
        const summary = summarizeRounds(state.results)
        const payload: StoredRun = {
          playerName,
          score: summary.score,
          accuracy: summary.accuracy,
          avgResponseMs: summary.averageResponseMs,
          longestStreak: summary.longestStreak,
          heartsRemaining: state.hearts,
          totalRounds: summary.totalRounds,
          correctRounds: summary.correctRounds,
          roundResults: state.results,
        }
        window.sessionStorage.setItem(storageKey, JSON.stringify(payload))
        router.push('/results')
        return
      }

      dispatch({ type: 'advance-round' })
    }, FEEDBACK_MS)

    return () => {
      if (feedbackRef.current) window.clearTimeout(feedbackRef.current)
    }
  }, [dispatch, playerName, router, sound, state.feedback, state.hearts, state.results, state.streak, state.terminal])

  const currentRound = state.rounds[state.roundIndex]
  const imageLabel = currentRound ? `ภาพ ${state.roundIndex + 1}/${state.rounds.length}` : ''
  const answerLabel = currentRound ? (currentRound.category === 'ai' ? 'AI' : 'HUMAN') : ''

  return (
    <main className='min-h-screen px-4 py-4 sm:px-6 lg:px-8'>
      <div className='mx-auto flex min-h-[calc(100vh-2rem)] max-w-6xl flex-col gap-4'>
        <Card className='border-white/10 bg-slate-950/70'>
          <CardContent className='flex flex-col gap-4 p-4 sm:p-6 lg:flex-row lg:items-center lg:justify-between'>
            <div>
              <div className='text-sm uppercase tracking-[0.28em] text-cyan-200/80'>ผู้เล่น</div>
              <div className='text-2xl font-bold text-white'>{playerName}</div>
            </div>
            <div className='grid gap-4 sm:grid-cols-3 lg:min-w-[44rem] lg:flex lg:items-center lg:justify-end'>
              <div className='rounded-2xl border border-white/10 bg-white/5 px-4 py-3'>
                <div className='text-xs uppercase tracking-[0.24em] text-slate-400'>คะแนน</div>
                <div className='font-mono text-3xl font-black text-cyan-200'>{state.score}</div>
              </div>
              <div className='rounded-2xl border border-white/10 bg-white/5 px-4 py-3'>
                <div className='text-xs uppercase tracking-[0.24em] text-slate-400'>หัวใจ</div>
                <HeartsDisplay hearts={state.hearts} />
              </div>
              <div className='rounded-2xl border border-white/10 bg-white/5 px-4 py-3'>
                <div className='text-xs uppercase tracking-[0.24em] text-slate-400'>คอมโบ</div>
                <div className='font-mono text-3xl font-black text-violet-200'>{state.streak}x</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className='grid gap-4 lg:grid-cols-[1.15fr_0.85fr]'>
          <Card className='relative overflow-hidden border-white/10 bg-slate-950/65'>
            <CardHeader className='flex-row items-center justify-between pb-0'>
              <CardTitle className='font-mono text-sm uppercase tracking-[0.28em] text-cyan-200/80'>
                รอบ {Math.min(state.roundIndex + 1, rounds.length)}/{rounds.length}
              </CardTitle>
              <Badge>{state.phase === 'playing' ? 'กำลังเล่น' : state.phase === 'countdown' ? 'นับถอยหลัง' : state.phase === 'feedback' ? 'เฉลย' : 'โหลด'}</Badge>
            </CardHeader>
            <CardContent className='space-y-5 p-4 sm:p-6'>
              <AnimatePresence mode='wait'>
                <motion.div
                  key={`${state.phase}-${state.roundIndex}`}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                >
                  {loading ? (
                    <div className='space-y-4 py-14 text-center'>
                      <div className='text-2xl font-semibold text-white'>กำลังโหลดภาพ...</div>
                      <Progress value={state.preloadProgress * 100} />
                      <div className='font-mono text-lg text-slate-300'>{Math.round(state.preloadProgress * 100)}%</div>
                    </div>
                  ) : currentRound ? (
                    <ImageCard
                      src={currentRound.path}
                      label={imageLabel}
                      debugLabel={DEBUG_LABELS ? `${currentRound.category.toUpperCase()} · ${currentRound.filename}` : undefined}
                      className='shadow-2xl'
                    />
                  ) : null}
                </motion.div>
              </AnimatePresence>

              {state.phase === 'playing' ? <TimerBar secondsLeft={secondsLeft} /> : null}
              {state.phase === 'playing' ? <GuessButtons onGuess={submitGuess} disabled={resolvedRef.current} /> : null}
              {state.phase === 'feedback' && state.feedback ? (
                <RoundFeedback
                  visible
                  correct={state.feedback.correct}
                  points={state.feedback.points}
                  answerLabel={answerLabel}
                />
              ) : null}
            </CardContent>
          </Card>

          <Card className='border-white/10 bg-slate-950/65'>
            <CardHeader>
              <CardTitle>สถานะรอบนี้</CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='space-y-2'>
                <div className='flex items-center justify-between text-sm text-slate-300'>
                  <span>ความเร็ว</span>
                  <span className='font-mono'>{formatSeconds(secondsLeft)}</span>
                </div>
                <TimerBar secondsLeft={secondsLeft} />
              </div>
              <div className='rounded-3xl border border-white/10 bg-white/5 p-4'>
                <div className='text-xs uppercase tracking-[0.24em] text-slate-400'>เวลาเฉลี่ย</div>
                <div className='mt-1 font-mono text-3xl font-black text-white'>{formatMs(summarizeRounds(state.results).averageResponseMs)} ms</div>
              </div>
              <div className='rounded-3xl border border-white/10 bg-white/5 p-4'>
                <div className='text-xs uppercase tracking-[0.24em] text-slate-400'>แมตช์</div>
                <div className='mt-1 text-lg text-white'>
                  {state.correctRounds}/{state.results.length} ถูก
                </div>
              </div>
              {state.phase === 'feedback' && state.feedback ? (
                <div className={state.feedback.correct ? 'rounded-3xl border border-emerald-300/20 bg-emerald-400/10 p-4 text-emerald-100' : 'rounded-3xl border border-rose-300/20 bg-rose-500/10 p-4 text-rose-100'}>
                  {state.feedback.correct ? 'ตอบถูก' : state.feedback.timedOut ? 'หมดเวลา' : 'ตอบผิด'}
                </div>
              ) : null}
            </CardContent>
          </Card>
        </div>
      </div>

      <CountdownOverlay value={state.countdown === 0 ? 'GO' : state.countdown} visible={state.phase === 'countdown'} />
      <StreakToast streak={streakToast} />
    </main>
  )
}
