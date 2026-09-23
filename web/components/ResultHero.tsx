'use client'

import {useEffect, useRef} from 'react'
import {motion, useInView, animate} from 'framer-motion'
import {useLang} from '../lib/i18n'

function AnimatedAmount({value}: {value: number}) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, {once: true})

  useEffect(() => {
    if (!inView || !ref.current) return
    const controls = animate(0, value, {
      duration: 1.4,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => {
        if (!ref.current) return
        ref.current.textContent =
          v >= 100000
            ? `₹${(v / 100000).toFixed(1)} lakh`
            : `₹${Math.round(v).toLocaleString('en-IN')}`
      },
    })
    return () => controls.stop()
  }, [inView, value])

  return <span ref={ref}>₹0</span>
}

export default function ResultHero({
  summary,
  totalAnnualBenefit,
  schemeCount,
}: {
  summary: string
  totalAnnualBenefit?: number
  schemeCount: number
}) {
  const {t} = useLang()

  return (
    <motion.div
      initial={{opacity: 0, y: 24, scale: 0.98}}
      animate={{opacity: 1, y: 0, scale: 1}}
      transition={{type: 'spring', stiffness: 240, damping: 24}}
      className="relative overflow-hidden rounded-3xl bg-stone-900 p-7 text-white sm:p-9"
    >
      {/* decorative glow */}
      <div className="pointer-events-none absolute -top-24 -right-24 h-64 w-64 rounded-full bg-amber-500/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -left-16 h-64 w-64 rounded-full bg-emerald-500/10 blur-3xl" />

      <p className="relative text-[11px] font-semibold tracking-widest text-stone-400 uppercase">
        {t.results} · {schemeCount} {t.schemesFound}
      </p>
      <p className="relative mt-3 max-w-lg text-[15px] leading-relaxed text-stone-300">
        {summary}
      </p>

      {!!totalAnnualBenefit && totalAnnualBenefit > 0 && (
        <div className="relative mt-6">
          <p className="font-display text-4xl font-semibold tracking-tight text-amber-300 sm:text-5xl">
            <AnimatedAmount value={totalAnnualBenefit} />
          </p>
          <p className="mt-1.5 text-sm text-stone-400">{t.perYear}</p>
        </div>
      )}
    </motion.div>
  )
}
