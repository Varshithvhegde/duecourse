'use client'

import {useEffect, useRef, useState} from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

/* ---------------------------------- types --------------------------------- */

interface SchemeResult {
  name: string
  fullName?: string
  verdict: 'likely' | 'possible' | 'unlikely'
  reason: string
  benefit?: string
  benefitAmountAnnual?: number | null
  level?: string
  documents?: string[]
  steps?: string[]
  applyUrl?: string
  source?: string
}

interface AgentAnswer {
  summary: string
  totalAnnualBenefit?: number
  schemes: SchemeResult[]
  missingInfo?: string[]
  disclaimer?: string
}

type Stage = 'idle' | 'reading' | 'reasoning' | 'writing'

/* --------------------------------- content -------------------------------- */

const EXAMPLES = [
  {
    label: 'Widowed farmer, Karnataka',
    text: 'I am a widowed farmer in Karnataka with two school-age daughters. We own 1 acre of land.',
  },
  {
    label: 'New graduate, Bengaluru',
    text: 'I just finished my degree in Bengaluru this year and I am still looking for a job.',
  },
  {
    label: 'Delivery rider, expecting',
    text: 'My wife is pregnant with our first child. I work as a delivery rider, no PF or anything.',
  },
  {
    label: 'BPL family, elderly mother',
    text: 'We are a BPL family of five in Kalaburagi. My mother is 65 and has no pension.',
  },
]

const STAGES: {key: Exclude<Stage, 'idle'>; label: string}[] = [
  {key: 'reading', label: 'Reading the scheme database'},
  {key: 'reasoning', label: 'Checking rules against your situation'},
  {key: 'writing', label: 'Preparing your results'},
]

const VERDICT = {
  likely: {
    label: 'Likely eligible',
    chip: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
    bar: 'bg-emerald-500',
  },
  possible: {
    label: 'Worth checking',
    chip: 'bg-amber-50 text-amber-700 ring-amber-600/25',
    bar: 'bg-amber-400',
  },
  unlikely: {
    label: 'Probably not',
    chip: 'bg-stone-100 text-stone-500 ring-stone-400/20',
    bar: 'bg-stone-300',
  },
} as const

const inr = (n: number) =>
  n >= 100000
    ? `₹${(n / 100000).toFixed(n % 100000 ? 1 : 0)} lakh`
    : `₹${n.toLocaleString('en-IN')}`

/* -------------------------------- scheme card ------------------------------ */

function SchemeCard({scheme, index}: {scheme: SchemeResult; index: number}) {
  const [open, setOpen] = useState(index === 0)
  const v = VERDICT[scheme.verdict] ?? VERDICT.possible

  return (
    <div
      className="animate-rise overflow-hidden rounded-2xl bg-white shadow-[0_1px_3px_rgba(0,0,0,0.06),0_8px_24px_-12px_rgba(0,0,0,0.12)] ring-1 ring-stone-900/5"
      style={{animationDelay: `${index * 90}ms`}}
    >
      <div className={`h-1 ${v.bar}`} />
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-start justify-between gap-4 p-5 text-left sm:p-6"
      >
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
            <h3 className="font-display text-xl font-semibold text-stone-900">
              {scheme.name}
            </h3>
            <span
              className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ${v.chip}`}
            >
              {v.label}
            </span>
          </div>
          {scheme.fullName && scheme.fullName !== scheme.name && (
            <p className="mt-1 truncate text-xs text-stone-400">{scheme.fullName}</p>
          )}
          {scheme.benefit && (
            <p className="mt-2.5 text-[15px] font-semibold text-stone-900">
              {scheme.benefit}
            </p>
          )}
        </div>
        <span
          className={`mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-stone-100 text-stone-500 transition-transform duration-300 ${open ? 'rotate-180' : ''}`}
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </button>

      <div
        className={`grid transition-[grid-template-rows] duration-300 ease-out ${open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}
      >
        <div className="overflow-hidden">
          <div className="border-t border-stone-100 px-5 pt-4 pb-6 sm:px-6">
            <p className="text-[15px] leading-relaxed text-stone-600">{scheme.reason}</p>

            {scheme.documents && scheme.documents.length > 0 && (
              <div className="mt-5">
                <p className="text-[11px] font-bold tracking-widest text-stone-400 uppercase">
                  Have these ready
                </p>
                <div className="mt-2.5 flex flex-wrap gap-1.5">
                  {scheme.documents.map((d) => (
                    <span
                      key={d}
                      className="rounded-lg bg-stone-100 px-2.5 py-1.5 text-xs font-medium text-stone-600"
                    >
                      {d}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {scheme.steps && scheme.steps.length > 0 && (
              <div className="mt-5">
                <p className="text-[11px] font-bold tracking-widest text-stone-400 uppercase">
                  How to claim it
                </p>
                <ol className="mt-2.5 space-y-2.5">
                  {scheme.steps.map((s, i) => (
                    <li key={i} className="flex gap-3 text-[15px] text-stone-600">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-stone-900 text-[11px] font-bold text-white">
                        {i + 1}
                      </span>
                      <span className="pt-0.5">{s}</span>
                    </li>
                  ))}
                </ol>
              </div>
            )}

            <div className="mt-6 flex flex-wrap gap-2.5">
              {scheme.applyUrl && (
                <a
                  href={scheme.applyUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-xl bg-stone-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-stone-700"
                >
                  Apply now →
                </a>
              )}
              {scheme.source && (
                <a
                  href={scheme.source}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-xl px-5 py-2.5 text-sm font-medium text-stone-500 ring-1 ring-stone-200 transition hover:bg-stone-50"
                >
                  Official source ↗
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ---------------------------------- page ---------------------------------- */

export default function Home() {
  const [situation, setSituation] = useState('')
  const [result, setResult] = useState<AgentAnswer | null>(null)
  const [fallbackAnswer, setFallbackAnswer] = useState('')
  const [error, setError] = useState('')
  const [stage, setStage] = useState<Stage>('idle')
  const loading = stage !== 'idle'
  const timers = useRef<ReturnType<typeof setTimeout>[]>([])
  const resultsRef = useRef<HTMLDivElement>(null)

  useEffect(() => () => timers.current.forEach(clearTimeout), [])

  useEffect(() => {
    if ((result || fallbackAnswer || error) && resultsRef.current) {
      resultsRef.current.scrollIntoView({behavior: 'smooth', block: 'start'})
    }
  }, [result, fallbackAnswer, error])

  async function check(text: string) {
    if (loading || !text.trim()) return
    setResult(null)
    setFallbackAnswer('')
    setError('')
    setStage('reading')

    // Stage progression for honest feedback during the long agent run
    timers.current = [
      setTimeout(() => setStage('reasoning'), 6000),
      setTimeout(() => setStage('writing'), 20000),
    ]

    const controller = new AbortController()
    const hardTimeout = setTimeout(() => controller.abort(), 150_000)

    try {
      const res = await fetch('/api/check', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({message: text}),
        signal: controller.signal,
      })
      const raw = await res.text()
      let json: {
        error?: string
        fallback?: boolean
        answer?: string
        result?: AgentAnswer
      }
      try {
        json = JSON.parse(raw)
      } catch {
        throw new Error(`The server returned an unreadable response (${res.status})`)
      }
      if (!res.ok) throw new Error(json.error || `Server error (${res.status})`)
      if (json.fallback) setFallbackAnswer(json.answer ?? '')
      else setResult(json.result ?? null)
    } catch (e) {
      setError(
        e instanceof Error && e.name === 'AbortError'
          ? 'That took too long — the service may be busy. Please try again.'
          : e instanceof Error
            ? e.message
            : 'Something went wrong',
      )
    } finally {
      clearTimeout(hardTimeout)
      timers.current.forEach(clearTimeout)
      setStage('idle')
    }
  }

  const stageIndex = STAGES.findIndex((s) => s.key === stage)

  return (
    <main className="mx-auto max-w-2xl px-5 pt-16 pb-24 sm:pt-20">
      {/* header */}
      <header className="animate-rise">
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-stone-900 font-display text-sm font-bold text-white">
            DC
          </span>
          <span className="text-sm font-semibold tracking-wide text-stone-500">
            DueCourse · ನಿಮ್ಮ ಹಕ್ಕು
          </span>
        </div>
        <h1 className="font-display mt-6 text-[2.6rem] leading-[1.08] font-semibold tracking-tight text-stone-900 sm:text-5xl">
          The government owes you more than you think.
        </h1>
        <p className="mt-4 max-w-lg text-[17px] leading-relaxed text-stone-500">
          India runs 4,700+ welfare schemes — most go unclaimed because the rules
          are unreadable. Describe your situation in plain words. We&rsquo;ll find
          what you qualify for, explain why, and show you exactly how to claim it.
        </p>
      </header>

      {/* input */}
      <div className="animate-rise mt-10" style={{animationDelay: '120ms'}}>
        <div className="rounded-2xl bg-white p-2 shadow-[0_1px_3px_rgba(0,0,0,0.06),0_12px_32px_-12px_rgba(0,0,0,0.15)] ring-1 ring-stone-900/5">
          <textarea
            value={situation}
            onChange={(e) => setSituation(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) check(situation)
            }}
            rows={4}
            placeholder="For example: I am a widowed farmer in Karnataka with two school-age daughters. We own 1 acre of land…"
            className="w-full resize-none rounded-xl bg-transparent p-4 text-[16px] leading-relaxed text-stone-900 placeholder:text-stone-400 focus:outline-none"
          />
          <div className="flex items-center justify-between gap-3 px-2 pb-2">
            <p className="hidden text-xs text-stone-400 sm:block">
              Every answer cites the official source
            </p>
            <button
              type="button"
              onClick={() => check(situation)}
              disabled={loading || !situation.trim()}
              className="ml-auto rounded-xl bg-stone-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-stone-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
            >
              {loading ? 'Working…' : 'Find my schemes'}
            </button>
          </div>
        </div>

        {/* examples */}
        <div className="mt-5 flex flex-wrap gap-2">
          {EXAMPLES.map((ex) => (
            <button
              key={ex.label}
              type="button"
              disabled={loading}
              onClick={() => {
                setSituation(ex.text)
                check(ex.text)
              }}
              className="cursor-pointer rounded-full bg-white px-4 py-2 text-[13px] font-medium text-stone-600 ring-1 ring-stone-200 transition hover:bg-stone-900 hover:text-white hover:ring-stone-900 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {ex.label}
            </button>
          ))}
        </div>
      </div>

      {/* loading state */}
      {loading && (
        <div className="animate-rise mt-12" ref={resultsRef}>
          <div className="rounded-2xl bg-white p-6 ring-1 ring-stone-900/5">
            <div className="flex items-center gap-3">
              <div className="flex gap-1">
                <span className="thinking-dot h-2 w-2 rounded-full bg-stone-900" />
                <span className="thinking-dot h-2 w-2 rounded-full bg-stone-900" />
                <span className="thinking-dot h-2 w-2 rounded-full bg-stone-900" />
              </div>
              <p className="text-sm font-medium text-stone-700">
                {STAGES[stageIndex]?.label ?? 'Working'}…
              </p>
            </div>
            <div className="mt-4 flex gap-1.5">
              {STAGES.map((s, i) => (
                <div
                  key={s.key}
                  className={`h-1 flex-1 rounded-full transition-colors duration-500 ${i <= stageIndex ? 'bg-stone-900' : 'bg-stone-200'}`}
                />
              ))}
            </div>
            <p className="mt-4 text-xs leading-relaxed text-stone-400">
              This takes 20–60 seconds — an agent is reading official scheme rules
              and checking each one against your situation.
            </p>
          </div>
          <div className="mt-4 space-y-3">
            {[0, 1].map((i) => (
              <div key={i} className="shimmer h-32 rounded-2xl" />
            ))}
          </div>
        </div>
      )}

      {/* error */}
      {error && !loading && (
        <div ref={resultsRef} className="animate-rise mt-10 rounded-2xl bg-red-50 p-5 ring-1 ring-red-100">
          <p className="text-sm font-semibold text-red-800">Something went wrong</p>
          <p className="mt-1 text-sm text-red-600">{error}</p>
          <button
            type="button"
            onClick={() => check(situation)}
            className="mt-3 rounded-lg bg-red-800 px-4 py-2 text-xs font-semibold text-white transition hover:bg-red-700"
          >
            Try again
          </button>
        </div>
      )}

      {/* structured result */}
      {result && !loading && (
        <section ref={resultsRef} className="mt-14 scroll-mt-8">
          <div className="animate-rise rounded-2xl bg-stone-900 p-6 text-white sm:p-8">
            <p className="text-[11px] font-bold tracking-widest text-stone-400 uppercase">
              Your result
            </p>
            <p className="mt-3 text-[17px] leading-relaxed text-stone-100">
              {result.summary}
            </p>
            {!!result.totalAnnualBenefit && result.totalAnnualBenefit > 0 && (
              <div className="mt-5 border-t border-white/10 pt-5">
                <p className="font-display text-4xl font-semibold">
                  {inr(result.totalAnnualBenefit)}
                </p>
                <p className="mt-1 text-sm text-stone-400">
                  per year in benefits you&rsquo;re likely owed
                </p>
              </div>
            )}
          </div>

          <div className="mt-6 space-y-4">
            {result.schemes.map((s, i) => (
              <SchemeCard key={`${s.name}-${i}`} scheme={s} index={i} />
            ))}
          </div>

          {result.missingInfo && result.missingInfo.length > 0 && (
            <div className="animate-rise mt-6 rounded-2xl bg-sky-50 p-5 ring-1 ring-sky-100">
              <p className="text-sm font-semibold text-sky-900">
                Sharpen these results — tell me:
              </p>
              <ul className="mt-2 space-y-1.5">
                {result.missingInfo.map((m) => (
                  <li key={m} className="flex gap-2 text-sm text-sky-800">
                    <span className="text-sky-400">→</span>
                    {m}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {result.disclaimer && (
            <p className="mt-8 text-center text-xs text-stone-400 italic">
              {result.disclaimer}
            </p>
          )}
        </section>
      )}

      {/* markdown fallback */}
      {fallbackAnswer && !loading && (
        <article
          ref={resultsRef}
          className="prose prose-stone animate-rise mt-10 max-w-none rounded-2xl bg-white p-6 ring-1 ring-stone-900/5 sm:p-8"
        >
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{fallbackAnswer}</ReactMarkdown>
        </article>
      )}

      {/* footer */}
      <footer className="mt-20 border-t border-stone-200 pt-8">
        <p className="text-xs leading-relaxed text-stone-400">
          DueCourse is an information tool, not legal or financial advice. Final
          eligibility is decided by the administering department. Built on Sanity
          structured content — every claim links to its official source.
        </p>
      </footer>
    </main>
  )
}
