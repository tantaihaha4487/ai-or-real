import { AnimatePresence, motion } from 'framer-motion'

export function RoundFeedback({
  visible,
  correct,
  points,
  answerLabel,
}: {
  visible: boolean
  correct: boolean
  points: number
  answerLabel: string
}) {
  return (
    <AnimatePresence>
      {visible ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          className='absolute inset-0 z-30 flex items-center justify-center bg-black/35'
        >
          <motion.div
            initial={{ y: 14 }}
            animate={{ y: 0 }}
            className={correct ? 'rounded-[1.75rem] border border-emerald-300/20 bg-emerald-400/15 px-6 py-5 text-center shadow-[0_0_30px_rgba(16,185,129,0.18)]' : 'rounded-[1.75rem] border border-rose-300/20 bg-rose-500/15 px-6 py-5 text-center shadow-[0_0_30px_rgba(244,63,94,0.18)]'}
          >
            <div className='text-lg font-semibold text-white'>{correct ? `ถูกต้อง +${points}` : 'พลาด'}</div>
            <div className='mt-1 text-sm text-slate-200'>คำตอบที่ถูก: {answerLabel}</div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}
