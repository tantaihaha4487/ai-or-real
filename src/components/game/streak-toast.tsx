import { AnimatePresence, motion } from 'framer-motion'

export function StreakToast({ streak }: { streak: number | null }) {
  return (
    <AnimatePresence>
      {streak ? (
        <motion.div
          key={streak}
          initial={{ y: 16, opacity: 0, scale: 0.96 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: -8, opacity: 0, scale: 0.96 }}
          className='pointer-events-none fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-full border border-violet-300/20 bg-violet-500/15 px-4 py-2 text-sm font-semibold text-violet-100 shadow-glow'
        >
          คอมโบ {streak}x
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}
