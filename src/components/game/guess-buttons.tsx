import { Button } from '@/components/ui/button'

export function GuessButtons({ onGuess, disabled }: { onGuess: (guess: 'ai' | 'human') => void; disabled?: boolean }) {
  return (
    <div className='grid grid-cols-2 gap-3'>
      <Button size='lg' className='h-16 text-xl uppercase tracking-[0.18em]' onClick={() => onGuess('ai')} disabled={disabled}>
        AI
      </Button>
      <Button variant='secondary' size='lg' className='h-16 text-xl uppercase tracking-[0.18em]' onClick={() => onGuess('human')} disabled={disabled}>
        HUMAN
      </Button>
    </div>
  )
}
