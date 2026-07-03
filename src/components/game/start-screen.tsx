'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowRight } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

const storageKey = 'ai-or-human:last-name'

export function StartScreen() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const saved = window.localStorage.getItem(storageKey)
    if (saved) setName(saved)
  }, [])

  const submit = () => {
    const trimmed = name.trim().slice(0, 24)
    if (!trimmed) {
      setError('กรุณาใส่ชื่อก่อน')
      return
    }
    window.localStorage.setItem(storageKey, trimmed)
    router.push(`/play?name=${encodeURIComponent(trimmed)}`)
  }

  return (
    <main className='mx-auto flex min-h-screen max-w-5xl items-center px-4 py-8 sm:px-6 lg:px-8'>
      <Card className='w-full overflow-hidden'>
        <div className='grid gap-0 lg:grid-cols-[1.1fr_0.9fr]'>
          <CardHeader className='gap-4 p-6 sm:p-8 lg:p-10'>
            <div className='inline-flex w-fit rounded-full border border-cyan-300/20 bg-cyan-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-cyan-100'>
              AI or Human
            </div>
            <CardTitle className='text-4xl leading-tight sm:text-5xl'>ทายภาพให้ทัน 10 วินาที</CardTitle>
            <CardDescription className='max-w-xl text-base sm:text-lg'>
              ดูภาพ 10 รอบ ตัดสินใจเร็ว เก็บคอมโบให้ได้ คะแนนจะพุ่งถ้าคุณตอบไวและตอบถูกต่อเนื่อง
            </CardDescription>
            <div className='space-y-3 pt-4'>
              <label className='text-sm uppercase tracking-[0.24em] text-slate-400'>ชื่อผู้เล่น</label>
              <Input
                value={name}
                onChange={(event) => {
                  setError(null)
                  setName(event.target.value.slice(0, 24))
                }}
                maxLength={24}
                placeholder='ใส่ชื่อของคุณ'
                onKeyDown={(event) => {
                  if (event.key === 'Enter') submit()
                }}
              />
              {error ? <p className='text-sm text-rose-300'>{error}</p> : <p className='text-sm text-slate-400'>เก็บไว้ในเครื่องนี้เป็นค่าเริ่มต้นให้ครั้งต่อไป</p>}
            </div>
            <div className='flex flex-wrap gap-3 pt-4'>
              <Button size='lg' className='min-w-44' onClick={submit}>
                เริ่มเล่น
                <ArrowRight className='h-5 w-5' />
              </Button>
              <Button variant='outline' size='lg' asChild>
                <Link href='/leaderboard'>ดูตารางคะแนน</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent className='flex items-center justify-center p-6 sm:p-8 lg:p-10'>
            <div className='grid w-full gap-4 sm:grid-cols-2 lg:grid-cols-1'>
              <div className='rounded-[1.75rem] border border-white/10 bg-gradient-to-br from-cyan-400/15 to-violet-500/10 p-5'>
                <div className='text-sm uppercase tracking-[0.24em] text-cyan-200'>ระบบคะแนน</div>
                <div className='mt-2 text-4xl font-black font-mono'>100+</div>
                <p className='mt-2 text-sm text-slate-300'>โบนัสจากความเร็ว + คอมโบต่อเนื่อง</p>
              </div>
              <div className='rounded-[1.75rem] border border-white/10 bg-white/5 p-5'>
                <div className='text-sm uppercase tracking-[0.24em] text-violet-200'>โหมด kiosk</div>
                <p className='mt-2 text-sm text-slate-300'>ปุ่มใหญ่ อ่านง่าย ใช้จอสัมผัสได้สบายทั้งจอใหญ่และโน้ตบุ๊ก</p>
              </div>
            </div>
          </CardContent>
        </div>
      </Card>
    </main>
  )
}
