import { motion } from 'framer-motion'

import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'

export function ImageCard({
  src,
  label,
  debugLabel,
  className,
  frameClassName,
  imageClassName,
}: {
  src: string
  label: string
  debugLabel?: string
  className?: string
  frameClassName?: string
  imageClassName?: string
}) {
  return (
    <Card className={cn('overflow-hidden p-0', className)}>
      <motion.div layout className={cn('relative aspect-[4/3] w-full overflow-hidden bg-slate-950', frameClassName)}>
        <img src={src} alt={label} className={cn('h-full w-full object-contain', imageClassName)} draggable={false} />
        {debugLabel ? (
          <div className='absolute left-3 top-3 rounded-full border border-white/15 bg-slate-950/75 px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-cyan-200'>
            {debugLabel}
          </div>
        ) : null}
        <div className='absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent p-3'>
          <Badge className='bg-slate-950/65 text-slate-100'>{label}</Badge>
        </div>
      </motion.div>
    </Card>
  )
}
