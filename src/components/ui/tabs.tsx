import * as React from 'react'

import { cn } from '@/lib/utils'

type TabsProps = {
  value: string
  onValueChange: (value: string) => void
  children: React.ReactNode
}

export function Tabs({ value, onValueChange, children }: TabsProps) {
  return <div data-value={value} data-onchange={String(Boolean(onValueChange))}>{children}</div>
}

export function TabsList({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('inline-flex rounded-2xl border border-white/10 bg-white/5 p-1', className)} {...props} />
}

export function TabsTrigger({ className, active, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { active?: boolean }) {
  return (
    <button
      className={cn(
        'rounded-xl px-4 py-2 text-sm font-medium transition',
        active ? 'bg-cyan-400 text-slate-950' : 'text-slate-300 hover:bg-white/5 hover:text-white',
        className,
      )}
      {...props}
    />
  )
}
