import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { formatMs } from '@/lib/utils'
import type { LeaderboardRow } from '@/db/queries'

export function LeaderboardTable({ rows }: { rows: LeaderboardRow[] }) {
  return (
    <Card className='border-white/10 bg-slate-950/70'>
      <CardContent className='p-0'>
        <div className='overflow-hidden rounded-3xl'>
          <table className='w-full border-collapse text-left'>
            <thead className='bg-white/5 text-xs uppercase tracking-[0.24em] text-slate-400'>
              <tr>
                <th className='px-4 py-4'>#</th>
                <th className='px-4 py-4'>ชื่อ</th>
                <th className='px-4 py-4'>คะแนน</th>
                <th className='px-4 py-4'>Accuracy</th>
                <th className='px-4 py-4'>เวลาเฉลี่ย</th>
                <th className='px-4 py-4'>วันที่</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => (
                <tr key={row.runId} className='border-t border-white/10'>
                  <td className='px-4 py-4 font-mono text-slate-400'>{index + 1}</td>
                  <td className='px-4 py-4 font-semibold text-white'>{row.playerName}</td>
                  <td className='px-4 py-4 font-mono text-cyan-200'>{row.score}</td>
                  <td className='px-4 py-4'>
                    <Badge className='bg-white/5'>{row.accuracy.toFixed(0)}%</Badge>
                  </td>
                  <td className='px-4 py-4 font-mono text-slate-300'>{formatMs(row.avgResponseMs)} ms</td>
                  <td className='px-4 py-4 text-slate-400'>{new Intl.DateTimeFormat('th-TH', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(row.createdAt))}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
