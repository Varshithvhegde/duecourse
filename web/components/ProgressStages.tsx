'use client'

import {useEffect, useState} from 'react'
import {motion, AnimatePresence} from 'framer-motion'
import {useLang} from '../lib/i18n'

export default function ProgressStages() {
  const {t} = useLang()
  const [stage, setStage] = useState(0)

  useEffect(() => {
    const timers = [setTimeout(() => setStage(1), 2500), setTimeout(() => setStage(2), 7000)]
    return () => timers.forEach(clearTimeout)
  }, [])

  return (
    <motion.div
      initial={{opacity: 0, y: 16}}
      animate={{opacity: 1, y: 0}}
      exit={{opacity: 0, y: -8}}
      className="rounded-2xl bg-white p-6 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_-8px_rgba(0,0,0,0.08)] ring-1 ring-stone-900/5"
    >
      <div className="space-y-3.5">
        {t.stages.map((label, i) => {
          const done = i < stage
          const active = i === stage
          return (
            <div key={label} className="flex items-center gap-3">
              <span className="relative flex h-5 w-5 items-center justify-center">
                {done ? (
                  <motion.span
                    initial={{scale: 0}}
                    animate={{scale: 1}}
                    className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-[10px] font-bold text-white"
                  >
                    ✓
                  </motion.span>
                ) : active ? (
                  <>
                    <motion.span
                      className="absolute inset-0 rounded-full bg-amber-400/40"
                      animate={{scale: [1, 1.6], opacity: [0.8, 0]}}
                      transition={{duration: 1.2, repeat: Infinity, ease: 'easeOut'}}
                    />
                    <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
                  </>
                ) : (
                  <span className="h-2 w-2 rounded-full bg-stone-200" />
                )}
              </span>
              <span
                className={`text-sm transition-colors ${
                  done
                    ? 'text-stone-400 line-through decoration-stone-300'
                    : active
                      ? 'font-medium text-stone-800'
                      : 'text-stone-400'
                }`}
              >
                {label}
              </span>
            </div>
          )
        })}
      </div>

      <div className="mt-5 h-1 overflow-hidden rounded-full bg-stone-100">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-amber-500 to-amber-400"
          initial={{width: '4%'}}
          animate={{width: `${[18, 55, 88][stage]}%`}}
          transition={{type: 'spring', stiffness: 60, damping: 20}}
        />
      </div>
    </motion.div>
  )
}
