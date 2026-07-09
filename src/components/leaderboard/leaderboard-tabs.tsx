import Link from 'next/link'

import { Button } from '@/components/ui/button'

export function LeaderboardTabs({ current }: { current: 'all' | 'today' | 'week' }) {
  const tabs: Array<{ key: 'all' | 'today' | 'week'; label: string }> = [
    { key: 'all', label: 'ทั้งหมด' },
    { key: 'today', label: 'วันนี้' },
    { key: 'week', label: 'สัปดาห์นี้' },
  ]

  return (
    <div className='flex flex-wrap gap-2'>
      {tabs.map((tab) => (
        <Button key={tab.key} variant={current === tab.key ? 'default' : 'outline'} size='default' asChild>
          <Link href={`/leaderboard?range=${tab.key}`}>{tab.label}</Link>
        </Button>
      ))}
    </div>
  )
}
