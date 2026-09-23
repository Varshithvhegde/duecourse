'use client'

import {useState} from 'react'
import {motion, AnimatePresence} from 'framer-motion'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import {LangProvider, useLang} from '../lib/i18n'
import type {AgentAnswer} from '../lib/types'
import SchemeCard from '../components/SchemeCard'
import ResultHero from '../components/ResultHero'
import ProgressStages from '../components/ProgressStages'
import LangToggle from '../components/LangToggle'

function App() {
  const {t, lang} = useLang()
  const [situation, setSituation] = useState('')
  const [result, setResult] = useState<AgentAnswer | null>(null)
  const [fallbackAnswer, setFallbackAnswer] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function check(text: string) {
    if (loading || !text.trim()) return
    setLoading(true)
    setResult(null)
    setFallbackAnswer('')
    setError('')

    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 150_000)

    try {
      const res = await fetch('/api/check', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({message: text, lang}),
        signal: controller.signal,
      })
      const raw = await res.text()
      let json: {error?: string; fallback?: boolean; answer?: string; result?: AgentAnswer}
      try {
        json = JSON.parse(raw)
      } catch {
        throw new Error(`Server returned ${res.status} with an unreadable response`)
      }
      if (!res.ok) throw new Error(json.error || `Server error (${res.status})`)
      if (json.fallback) setFallbackAnswer(json.answer ?? '')
      else setResult(json.result ?? null)
    } catch (e) {
      if (e instanceof Error && e.name === 'AbortError') setError(t.tooLong)
      else setError(e instanceof Error ? e.message : t.somethingWrong)
    } finally {
      clearTimeout(timeout)
      setLoading(false)
    }
  }

  return (
    <main className="relative min-h-screen overflow-x-clip">
      {/* backdrop texture */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,#fafaf9,transparent_40%)]" />
        <div className="absolute top-0 left-1/2 h-[480px] w-[900px] -translate-x-1/2 rounded-full bg-amber-100/50 blur-3xl" />
      </div>

      {/* header */}
      <header className="mx-auto flex max-w-3xl items-center justify-between px-5 pt-6">
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-stone-900 font-display text-sm font-bold text-amber-300">
            DC
          </span>
          <span className="font-display text-lg font-semibold tracking-tight text-stone-900">
            DueCourse
          </span>
        </div>
        <LangToggle />
      </header>

      <div className="mx-auto max-w-3xl px-5 pt-14 pb-24 sm:pt-20">
        {/* hero */}
        <motion.div
          initial={{opacity: 0, y: 20}}
          animate={{opacity: 1, y: 0}}
          transition={{type: 'spring', stiffness: 200, damping: 24}}
        >
          <p className="text-xs font-semibold tracking-[0.2em] text-amber-700 uppercase">
            {t.tagline}
          </p>
          <h1 className="mt-4 font-display text-5xl leading-[1.04] font-semibold tracking-tight text-stone-900 sm:text-6xl">
            {t.title1}
            <br />
            <span className="text-amber-700 italic">{t.title2}</span>
          </h1>
          <p className="mt-5 max-w-xl text-[17px] leading-relaxed text-stone-500">
            {t.subtitle}
          </p>
        </motion.div>

        {/* input card */}
        <motion.div
          initial={{opacity: 0, y: 24}}
          animate={{opacity: 1, y: 0}}
          transition={{type: 'spring', stiffness: 200, damping: 24, delay: 0.1}}
          className="mt-10 rounded-3xl bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_16px_48px_-12px_rgba(0,0,0,0.12)] ring-1 ring-stone-900/5 sm:p-6"
        >
          <textarea
            value={situation}
            onChange={(e) => setSituation(e.target.value)}
            rows={4}
            placeholder={t.placeholder}
            className="w-full resize-none rounded-2xl bg-stone-50 p-4 text-[15px] text-stone-900 ring-1 ring-stone-200 transition outline-none placeholder:text-stone-400 focus:bg-white focus:ring-2 focus:ring-amber-500"
          />
          <motion.button
            type="button"
            onClick={() => check(situation)}
            disabled={loading || !situation.trim()}
            whileTap={{scale: 0.985}}
            className="mt-4 w-full cursor-pointer rounded-2xl bg-stone-900 px-6 py-4 text-[15px] font-semibold text-white transition hover:bg-stone-700 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {loading ? (
              <span className="inline-flex items-center gap-2.5">
                <motion.span
                  className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white"
                  animate={{rotate: 360}}
                  transition={{duration: 0.8, repeat: Infinity, ease: 'linear'}}
                />
                {t.stages[1]}
              </span>
            ) : (
              t.cta
            )}
          </motion.button>

          <p className="mt-5 text-center text-[11px] font-semibold tracking-widest text-stone-400 uppercase">
            {t.tryExample}
          </p>
          <div className="mt-3 flex flex-wrap justify-center gap-2">
            {t.examples.map((ex) => (
              <motion.button
                key={ex.label}
                type="button"
                disabled={loading}
                whileHover={{y: -2}}
                whileTap={{scale: 0.97}}
                onClick={() => {
                  setSituation(ex.text)
                  check(ex.text)
                }}
                className="cursor-pointer rounded-full bg-stone-100 px-4 py-2 text-[13px] font-medium text-stone-600 ring-1 ring-stone-900/5 transition hover:bg-stone-900 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
              >
                {ex.label}
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* progress */}
        <AnimatePresence>{loading && <div className="mt-8"><ProgressStages /></div>}</AnimatePresence>

        {/* error */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{opacity: 0, y: 12}}
              animate={{opacity: 1, y: 0}}
              exit={{opacity: 0}}
              className="mt-8 flex items-center justify-between gap-4 rounded-2xl bg-red-50 p-5 ring-1 ring-red-100"
            >
              <p className="text-sm text-red-700">{error}</p>
              <button
                type="button"
                onClick={() => check(situation)}
                className="shrink-0 cursor-pointer rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
              >
                {t.tryAgain}
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* results */}
        <AnimatePresence>
          {result && !loading && (
            <motion.section
              initial={{opacity: 0}}
              animate={{opacity: 1}}
              className="mt-12"
            >
              <ResultHero
                summary={result.summary}
                totalAnnualBenefit={result.totalAnnualBenefit}
                schemeCount={result.schemes.length}
              />

              <div className="mt-6 space-y-4">
                {result.schemes.map((s, i) => (
                  <SchemeCard key={`${s.name}-${i}`} scheme={s} index={i} />
                ))}
              </div>

              {result.missingInfo && result.missingInfo.length > 0 && (
                <motion.div
                  initial={{opacity: 0, y: 16}}
                  animate={{opacity: 1, y: 0}}
                  transition={{delay: 0.3}}
                  className="mt-6 rounded-2xl bg-blue-50 p-5 ring-1 ring-blue-100"
                >
                  <p className="text-sm font-semibold text-blue-900">{t.sharpen}:</p>
                  <ul className="mt-2 space-y-1 text-sm text-blue-700">
                    {result.missingInfo.map((m) => (
                      <li key={m} className="flex gap-2">
                        <span>→</span>
                        {m}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              )}

              {result.disclaimer && (
                <p className="mt-8 text-center text-xs text-stone-400 italic">
                  {result.disclaimer}
                </p>
              )}
            </motion.section>
          )}
        </AnimatePresence>

        {/* markdown fallback */}
        {fallbackAnswer && !loading && (
          <motion.article
            initial={{opacity: 0, y: 16}}
            animate={{opacity: 1, y: 0}}
            className="prose prose-stone mt-10 max-w-none rounded-3xl bg-white p-7 ring-1 ring-stone-900/5"
          >
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{fallbackAnswer}</ReactMarkdown>
          </motion.article>
        )}

        <footer className="mt-20 border-t border-stone-200 pt-6 text-center">
          <p className="text-xs text-stone-400">{t.disclaimer}</p>
          <p className="mt-1.5 text-xs text-stone-400">{t.footer}</p>
        </footer>
      </div>
    </main>
  )
}

export default function Home() {
  return (
    <LangProvider>
      <App />
    </LangProvider>
  )
}
