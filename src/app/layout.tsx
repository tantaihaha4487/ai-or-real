import type { Metadata } from 'next'
import { Kanit } from 'next/font/google'

import './globals.css'

const kanit = Kanit({
  subsets: ['latin', 'thai'],
  weight: ['300', '400', '500', '600', '700', '800'],
  display: 'swap',
  variable: '--font-kanit',
})

export const metadata: Metadata = {
  title: 'AI or Human',
  description: 'เกมทายภาพ AI หรือ Human สำหรับบูธวิทยาศาสตร์',
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang='th' className={kanit.variable}>
      <body className='font-sans antialiased'>{children}</body>
    </html>
  )
}
