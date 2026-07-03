import { Heart } from 'lucide-react'

import { cn } from '@/lib/utils'

export function HeartsDisplay({ hearts }: { hearts: number }) {
  return (
    <div className='flex items-center gap-2'>
      {Array.from({ length: 3 }).map((_, index) => {
        const alive = index < hearts
        return (
          <span
            key={index}
            className={cn(
              'rounded-full border p-2 transition',
              alive ? 'border-rose-400/40 bg-rose-500/15 text-rose-300' : 'border-white/10 bg-white/5 text-slate-500 opacity-40',
            )}
          >
            <Heart className={cn('h-5 w-5', alive && 'fill-current')} />
          </span>
        )
      })}
    </div>
  )
}
