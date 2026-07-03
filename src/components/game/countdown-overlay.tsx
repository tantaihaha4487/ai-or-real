import { AnimatePresence, motion } from 'framer-motion'

export function CountdownOverlay({ value, visible }: { value: number | 'GO'; visible: boolean }) {
  return (
    <AnimatePresence>
      {visible ? (
        <motion.div
          key='countdown'
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.04 }}
          className='absolute inset-0 z-40 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm'
        >
          <motion.div
            initial={{ y: 16, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className='rounded-[2rem] border border-cyan-300/20 bg-slate-950/70 px-10 py-8 text-center shadow-neon'
          >
            <div className='text-sm uppercase tracking-[0.4em] text-cyan-200/80'>เตรียมตัว</div>
            <div className='mt-3 text-7xl font-black text-white md:text-8xl'>{value}</div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}
