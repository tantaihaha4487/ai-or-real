import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'

import { cn } from '@/lib/utils'

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'default' | 'secondary' | 'ghost' | 'destructive' | 'outline'
  size?: 'default' | 'lg' | 'icon'
  asChild?: boolean
}

const variantStyles: Record<NonNullable<ButtonProps['variant']>, string> = {
  default: 'bg-cyan-400 text-slate-950 shadow-neon hover:bg-cyan-300',
  secondary: 'bg-violet-500/15 text-violet-100 border border-violet-400/30 hover:bg-violet-500/25',
  ghost: 'bg-transparent text-slate-100 hover:bg-white/5',
  destructive: 'bg-rose-500 text-white hover:bg-rose-400',
  outline: 'border border-white/15 bg-white/5 text-slate-100 hover:bg-white/10',
}

const sizeStyles: Record<NonNullable<ButtonProps['size']>, string> = {
  default: 'h-11 px-4 py-2',
  lg: 'h-14 px-6 text-lg',
  icon: 'h-10 w-10',
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant = 'default', size = 'default', asChild = false, ...props },
  ref,
) {
  const Comp = asChild ? Slot : 'button'
  return (
    <Comp
      ref={ref}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-2xl font-medium transition-all duration-200 active:scale-[0.99] disabled:pointer-events-none disabled:opacity-50',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/80 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950',
        variantStyles[variant],
        sizeStyles[size],
        className,
      )}
      {...props}
    />
  )
})
