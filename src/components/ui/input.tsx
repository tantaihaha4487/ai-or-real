import * as React from 'react'

import { cn } from '@/lib/utils'

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(function Input(
  { className, ...props },
  ref,
) {
  return (
    <input
      ref={ref}
      className={cn(
        'h-14 w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 text-lg text-white placeholder:text-slate-500 shadow-inner outline-none transition focus:border-cyan-300/60 focus:ring-2 focus:ring-cyan-300/20',
        className,
      )}
      {...props}
    />
  )
})
