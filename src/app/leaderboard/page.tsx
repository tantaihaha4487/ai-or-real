import Link from 'next/link'

import { LeaderboardTable } from '@/components/leaderboard/leaderboard-table'
import { LeaderboardTabs } from '@/components/leaderboard/leaderboard-tabs'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { getLeaderboard, type LeaderboardRange } from '@/db/queries'

export const dynamic = 'force-dynamic'

export default function LeaderboardPage({ searchParams }: { searchParams: { range?: string } }) {
  const range = (searchParams.range === 'today' || searchParams.range === 'week' ? searchParams.range : 'all') as LeaderboardRange
  const rows = getLeaderboard(range)

  return (
    <main className='app-grid min-h-screen px-4 py-6 sm:px-6 lg:px-8'>
      <Card className='mx-auto max-w-7xl border-cyan-100/10 bg-slate-950/[0.68]'>
        <CardHeader className='space-y-4'>
          <div className='flex flex-wrap items-center justify-between gap-3'>
            <div>
              <Badge className='w-fit bg-cyan-300/[0.12] text-cyan-100'>Leaderboard</Badge>
              <CardTitle className='mt-3 text-4xl sm:text-5xl'>ตารางคะแนน</CardTitle>
              <CardDescription>จัดอันดับตามคะแนนสูงสุด</CardDescription>
            </div>
            <Button variant='outline' asChild>
              <Link href='/'>กลับหน้าเริ่มต้น</Link>
            </Button>
          </div>
          <LeaderboardTabs current={range} />
        </CardHeader>
        <CardContent>
          <LeaderboardTable rows={rows} />
        </CardContent>
      </Card>
    </main>
  )
}
