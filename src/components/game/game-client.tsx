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
import { Card, CardContent, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { useGameState } from '@/hooks/useGameState'
import type { DatasetItem } from '@/lib/dataset-types'
import { formatMs } from '@/lib/utils'
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
  const summary = summarizeRounds(state.results)
  const phaseLabel = state.phase === 'playing' ? 'กำลังเล่น' : state.phase === 'countdown' ? 'นับถอยหลัง' : state.phase === 'feedback' ? 'เฉลย' : 'โหลด'
  const currentRoundNumber = Math.min(state.roundIndex + 1, rounds.length)

  return (
    <main className='app-grid h-svh overflow-hidden px-3 py-3 sm:px-5 lg:px-8'>
      <div className='mx-auto flex h-full max-w-7xl flex-col gap-2 sm:gap-3'>
        <Card className='border-cyan-100/10 bg-slate-950/[0.62]'>
          <CardContent className='grid gap-2 p-2 sm:grid-cols-2 sm:p-3 lg:grid-cols-[1.25fr_repeat(4,minmax(0,0.62fr))]'>
            <div className='flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-2 sm:col-span-2 lg:col-span-1'>
              <div>
                <div className='text-xs uppercase tracking-[0.28em] text-cyan-200/75'>ผู้เล่น</div>
                <div className='text-lg font-bold text-white sm:text-xl'>{playerName}</div>
              </div>
              <Badge className='bg-cyan-300/[0.12] text-cyan-100'>รอบ {currentRoundNumber}/{rounds.length}</Badge>
            </div>
            <HudStat label='คะแนน' value={state.score} tone='text-cyan-100' />
            <div className='rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3'>
              <div className='text-xs uppercase tracking-[0.24em] text-slate-400'>หัวใจ</div>
              <div className='mt-1'><HeartsDisplay hearts={state.hearts} /></div>
            </div>
            <HudStat label='คอมโบ' value={`${state.streak}x`} tone='text-violet-100' />
            <HudStat label='เฉลี่ย' value={`${formatMs(summary.averageResponseMs)} ms`} tone='text-slate-100' compact />
          </CardContent>
        </Card>

        <Card className='relative flex min-h-0 flex-1 overflow-hidden border-cyan-100/10 bg-slate-950/[0.72]'>
          <div className='pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.12),transparent_38%)]' />
          <CardContent className='relative flex min-h-0 flex-1 flex-col gap-2 p-2 sm:gap-3 sm:p-3 lg:p-4'>
            <div className='flex shrink-0 flex-wrap items-center justify-between gap-2'>
              <div>
                <CardTitle className='text-lg sm:text-xl'>ดูภาพให้ชัด แล้วเลือกคำตอบ</CardTitle>
                <p className='hidden text-sm text-slate-300 sm:mt-1 sm:block'>ภาพพอดีจอ ปุ่มตอบอยู่ด้านล่างเสมอ</p>
              </div>
              <Badge className='bg-white/[0.08] text-slate-100'>{phaseLabel}</Badge>
            </div>

            <div className='min-h-0 flex-1'>
              <AnimatePresence mode='wait'>
                <motion.div
                  key={`${state.phase}-${state.roundIndex}`}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className='h-full min-h-0'
                >
                  {loading ? (
                    <div className='flex h-full min-h-0 flex-col items-center justify-center gap-4 rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-6 text-center'>
                      <div className='text-2xl font-semibold text-white'>กำลังโหลดภาพ...</div>
                      <Progress value={state.preloadProgress * 100} className='w-full max-w-xl' />
                      <div className='font-mono text-lg text-slate-300'>{Math.round(state.preloadProgress * 100)}%</div>
                    </div>
                  ) : currentRound ? (
                    <ImageCard
                      src={currentRound.path}
                      label={imageLabel}
                      debugLabel={DEBUG_LABELS ? `${currentRound.category.toUpperCase()} · ${currentRound.filename}` : undefined}
                      className='h-full border-white/10 bg-black/35 shadow-2xl'
                      frameClassName='h-full min-h-0 aspect-auto rounded-[1.5rem]'
                    />
                  ) : null}
                </motion.div>
              </AnimatePresence>
            </div>

            <div className='shrink-0 rounded-[1.5rem] border border-white/10 bg-slate-950/[0.82] p-2 shadow-[0_-18px_48px_rgba(2,6,23,0.26)] sm:p-3'>
              {state.phase === 'playing' ? (
                <div className='grid gap-3 lg:grid-cols-[0.78fr_1.22fr] lg:items-end'>
                  <TimerBar secondsLeft={secondsLeft} durationSeconds={ROUND_SECONDS} />
                  <GuessButtons onGuess={submitGuess} disabled={resolvedRef.current} />
                </div>
              ) : (
                <div className='flex min-h-[4.75rem] items-center justify-between gap-4 text-sm text-slate-300'>
                  <span>{loading ? 'กำลังเตรียมภาพสำหรับเกม' : phaseLabel}</span>
                  <span className='font-mono text-slate-100'>{state.correctRounds}/{state.results.length} ถูก</span>
                </div>
              )}
            </div>

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
      </div>

      <CountdownOverlay value={state.countdown === 0 ? 'GO' : state.countdown} visible={state.phase === 'countdown'} />
      <StreakToast streak={streakToast} />
    </main>
  )
}

function HudStat({ label, value, tone, compact }: { label: string; value: string | number; tone: string; compact?: boolean }) {
  return (
    <div className='rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-2'>
      <div className='text-xs uppercase tracking-[0.24em] text-slate-400'>{label}</div>
      <div className={`${compact ? 'text-lg sm:text-xl' : 'text-2xl'} mt-1 font-mono font-black ${tone}`}>{value}</div>
    </div>
  )
}
