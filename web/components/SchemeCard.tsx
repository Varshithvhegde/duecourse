'use client'

import {useState} from 'react'
import {motion, AnimatePresence} from 'framer-motion'
import type {SchemeResult} from '../lib/types'
import {useLang} from '../lib/i18n'

const VERDICT_STYLES = {
  likely: {
    bar: 'bg-emerald-500',
    badge: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
    dot: 'bg-emerald-500',
  },
  possible: {
    bar: 'bg-amber-400',
    badge: 'bg-amber-50 text-amber-700 ring-amber-200',
    dot: 'bg-amber-400',
  },
  unlikely: {
    bar: 'bg-stone-300',
    badge: 'bg-stone-100 text-stone-500 ring-stone-200',
    dot: 'bg-stone-400',
  },
} as const

export default function SchemeCard({scheme, index}: {scheme: SchemeResult; index: number}) {
  const [open, setOpen] = useState(index === 0)
  const {t} = useLang()
  const v = VERDICT_STYLES[scheme.verdict] ?? VERDICT_STYLES.possible
  const verdictLabel =
    scheme.verdict === 'likely' ? t.likely : scheme.verdict === 'unlikely' ? t.unlikely : t.possible

  return (
    <motion.article
      initial={{opacity: 0, y: 32, scale: 0.98}}
      animate={{opacity: 1, y: 0, scale: 1}}
      transition={{type: 'spring', stiffness: 260, damping: 26, delay: 0.15 + index * 0.09}}
      className="overflow-hidden rounded-2xl bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_-8px_rgba(0,0,0,0.08)] ring-1 ring-stone-900/5"
    >
      <div className={`h-1 w-full ${v.bar}`} />

      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-start justify-between gap-4 p-5 text-left sm:p-6"
      >
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
            <h3 className="font-display text-lg font-semibold text-stone-900">
              {scheme.name}
            </h3>
            {scheme.level && (
              <span className="rounded-full bg-stone-100 px-2 py-0.5 text-[11px] font-medium text-stone-500">
                {scheme.level}
              </span>
            )}
          </div>
          {scheme.fullName && scheme.fullName !== scheme.name && (
            <p className="mt-0.5 truncate text-xs text-stone-400">{scheme.fullName}</p>
          )}
          {scheme.benefit && (
            <p className="mt-2 text-sm font-semibold text-emerald-700">{scheme.benefit}</p>
          )}
        </div>

        <div className="flex shrink-0 flex-col items-end gap-2">
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ${v.badge}`}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${v.dot}`} />
            {verdictLabel}
          </span>
          <motion.span
            animate={{rotate: open ? 180 : 0}}
            transition={{type: 'spring', stiffness: 300, damping: 22}}
            className="text-stone-300"
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </motion.span>
        </div>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{height: 0, opacity: 0}}
            animate={{height: 'auto', opacity: 1}}
            exit={{height: 0, opacity: 0}}
            transition={{type: 'spring', stiffness: 220, damping: 28}}
            className="overflow-hidden"
          >
            <div className="border-t border-stone-100 px-5 pt-4 pb-6 sm:px-6">
              <p className="text-sm leading-relaxed text-stone-600">{scheme.reason}</p>

              {scheme.documents && scheme.documents.length > 0 && (
                <div className="mt-5">
                  <p className="text-[11px] font-semibold tracking-widest text-stone-400 uppercase">
                    {t.documents}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {scheme.documents.map((d) => (
                      <span
                        key={d}
                        className="rounded-lg bg-stone-100 px-2.5 py-1 text-xs font-medium text-stone-600"
                      >
                        {d}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {scheme.steps && scheme.steps.length > 0 && (
                <div className="mt-5">
                  <p className="text-[11px] font-semibold tracking-widest text-stone-400 uppercase">
                    {t.howToApply}
                  </p>
                  <ol className="mt-2.5 space-y-2">
                    {scheme.steps.map((s, i) => (
                      <li key={i} className="flex gap-3 text-sm text-stone-600">
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-stone-900 text-[10px] font-bold text-white">
                          {i + 1}
                        </span>
                        <span className="pt-px">{s}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              )}

              <div className="mt-5 flex flex-wrap gap-2.5">
                {scheme.applyUrl && (
                  <a
                    href={scheme.applyUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-xl bg-stone-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-stone-700 active:scale-[0.98]"
                  >
                    {t.applyNow}
                    <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                      <path d="M3 8h10m0 0L9 4m4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </a>
                )}
                {scheme.source && (
                  <a
                    href={scheme.source}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-medium text-stone-500 ring-1 ring-stone-200 transition hover:bg-stone-50"
                  >
                    {t.source} ↗
                  </a>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.article>
  )
}
