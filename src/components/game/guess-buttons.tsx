import { Button } from '@/components/ui/button'

export function GuessButtons({ onGuess, disabled }: { onGuess: (guess: 'ai' | 'human') => void; disabled?: boolean }) {
  return (
    <div className='grid grid-cols-2 gap-3'>
      <Button size='lg' className='min-h-[4.75rem] flex-col text-xl uppercase tracking-[0.18em] sm:text-2xl' onClick={() => onGuess('ai')} disabled={disabled}>
        <span>AI</span>
        <span className='text-xs font-medium normal-case tracking-normal opacity-80 sm:text-sm'>ภาพที่ AI สร้าง</span>
      </Button>
      <Button variant='secondary' size='lg' className='min-h-[4.75rem] flex-col text-xl uppercase tracking-[0.18em] sm:text-2xl' onClick={() => onGuess('human')} disabled={disabled}>
        <span>HUMAN</span>
        <span className='text-xs font-medium normal-case tracking-normal opacity-80 sm:text-sm'>ภาพจากมนุษย์</span>
      </Button>
    </div>
  )
}
