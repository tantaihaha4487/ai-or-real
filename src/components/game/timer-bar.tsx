import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'

export function TimerBar({ secondsLeft }: { secondsLeft: number }) {
  const progress = (secondsLeft / 10) * 100
  const tone = secondsLeft > 6 ? 'from-emerald-400 via-cyan-400 to-violet-400' : secondsLeft > 3 ? 'from-amber-300 via-yellow-400 to-orange-500' : 'from-rose-500 via-red-500 to-orange-400'

  return (
    <div className='space-y-2'>
      <div className='flex items-center justify-between text-xs uppercase tracking-[0.24em] text-slate-400'>
        <span>เวลา</span>
        <span className={cn('font-mono text-base', secondsLeft <= 3 && 'text-rose-300')}>{secondsLeft.toFixed(1)}s</span>
      </div>
      <Progress value={progress} className='h-3' indicatorClassName={tone} />
    </div>
  )
}
