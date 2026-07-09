'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ChevronRight, Save } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatMs } from '@/lib/utils'
import type { RoundResult } from '@/lib/scoring'

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

export function ResultsClient() {
  const router = useRouter()
  const [run, setRun] = useState<StoredRun | null>(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    const raw = window.sessionStorage.getItem(storageKey)
    if (!raw) return
    setRun(JSON.parse(raw) as StoredRun)
  }, [])

  const accuracyLabel = useMemo(() => (run ? `${run.accuracy.toFixed(0)}%` : '0%'), [run])

  const saveRun = async () => {
    if (!run || saved) return
    setSaving(true)
    try {
      const response = await fetch('/api/runs', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(run),
      })
      if (!response.ok) {
        throw new Error('save failed')
      }
      setSaved(true)
      router.push('/leaderboard')
    } finally {
      setSaving(false)
    }
  }

  if (!run) {
    return (
      <main className='app-grid flex min-h-screen items-center px-4 py-8'>
        <Card className='mx-auto w-full max-w-3xl'>
          <CardHeader>
            <CardTitle>ไม่พบผลรอบก่อนหน้า</CardTitle>
            <CardDescription>กลับไปเริ่มเกมใหม่ก่อน</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href='/'>กลับหน้าเริ่มต้น</Link>
            </Button>
          </CardContent>
        </Card>
      </main>
    )
  }

  return (
    <main className='app-grid min-h-screen px-4 py-6 sm:px-6 lg:px-8'>
      <div className='mx-auto grid max-w-6xl gap-4 lg:grid-cols-[0.95fr_1.05fr]'>
        <Card className='border-cyan-100/10 bg-slate-950/[0.68]'>
          <CardHeader>
            <Badge className='w-fit bg-cyan-300/[0.12] text-cyan-100'>ผลลัพธ์</Badge>
            <CardTitle className='text-4xl sm:text-5xl'>จบรอบแล้ว</CardTitle>
            <CardDescription>คะแนน ความแม่นยำ และความเร็วจากรอบนี้</CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='rounded-[1.75rem] border border-cyan-200/15 bg-gradient-to-br from-cyan-300/[0.18] to-violet-500/10 p-5'>
              <div className='text-sm uppercase tracking-[0.24em] text-cyan-100'>คะแนนรวม</div>
              <div className='mt-2 font-mono text-6xl font-black text-white'>{run.score}</div>
            </div>
            <div className='grid gap-3 sm:grid-cols-2'>
              <Stat label='Accuracy' value={accuracyLabel} />
              <Stat label='เวลาเฉลี่ย' value={`${formatMs(run.avgResponseMs)} ms`} />
              <Stat label='สตรีกสูงสุด' value={`${run.longestStreak}x`} />
              <Stat label='หัวใจคงเหลือ' value={`${run.heartsRemaining}`} />
              <Stat label='ตอบถูก' value={`${run.correctRounds}/${run.totalRounds}`} />
            </div>
            <div className='flex flex-wrap gap-3 pt-2'>
              <Button onClick={saveRun} disabled={saving || saved} size='lg' className='min-w-56'>
                <Save className='h-5 w-5' />
                {saved ? 'บันทึกแล้ว' : saving ? 'กำลังบันทึก...' : 'บันทึกและดูตารางคะแนน'}
              </Button>
              <Button variant='outline' size='lg' asChild>
                <Link href='/'>เล่นอีกครั้ง</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className='border-white/10 bg-slate-950/[0.68]'>
          <CardHeader>
            <CardTitle>รายละเอียดแต่ละรอบ</CardTitle>
            <CardDescription>กดเปิดเพื่อดูคำตอบและคะแนน</CardDescription>
          </CardHeader>
          <CardContent>
            <details className='group rounded-3xl border border-white/10 bg-white/5 p-4'>
              <summary className='cursor-pointer list-none text-sm font-semibold text-white'>แสดงรายละเอียดทั้งหมด</summary>
              <div className='mt-4 space-y-3'>
                {run.roundResults.map((round, index) => (
                  <div key={round.imageId + index} className='rounded-2xl border border-white/10 bg-slate-950/60 p-4'>
                    <div className='flex flex-wrap items-center justify-between gap-2'>
                      <div className='font-semibold text-white'>รอบ {index + 1}</div>
                      <Badge className={round.correct ? 'border-emerald-300/20 bg-emerald-400/10 text-emerald-100' : 'border-rose-300/20 bg-rose-500/10 text-rose-100'}>
                        {round.correct ? 'ถูก' : 'ผิด'}
                      </Badge>
                    </div>
                    <div className='mt-3 grid gap-2 text-sm text-slate-300 sm:grid-cols-2'>
                      <div>คำตอบคุณ: {round.playerGuess ? round.playerGuess.toUpperCase() : 'หมดเวลา'}</div>
                      <div>เฉลย: {round.category.toUpperCase()}</div>
                      <div>เวลา: {formatMs(round.responseMs)} ms</div>
                      <div>แต้ม: {round.pointsAwarded}</div>
                    </div>
                  </div>
                ))}
              </div>
            </details>
          </CardContent>
        </Card>
      </div>
      <div className='mx-auto mt-4 flex max-w-6xl justify-end text-sm text-slate-400'>
        <Link href='/leaderboard' className='inline-flex items-center gap-1 hover:text-white'>
          ไปตารางคะแนน <ChevronRight className='h-4 w-4' />
        </Link>
      </div>
    </main>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className='rounded-3xl border border-white/10 bg-white/[0.04] p-4'>
      <div className='text-xs uppercase tracking-[0.24em] text-slate-400'>{label}</div>
      <div className='mt-2 font-mono text-2xl font-black text-white'>{value}</div>
    </div>
  )
}
