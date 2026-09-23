'use client'

import {useState} from 'react'
import {motion} from 'framer-motion'
import {useLang} from '../lib/i18n'

export default function FollowUp({
  onAsk,
  loading,
}: {
  onAsk: (question: string) => void
  loading: boolean
}) {
  const {t} = useLang()
  const [question, setQuestion] = useState('')

  function submit() {
    const q = question.trim()
    if (!q || loading) return
    onAsk(q)
    setQuestion('')
  }

  return (
    <motion.div
      initial={{opacity: 0, y: 16}}
      animate={{opacity: 1, y: 0}}
      transition={{delay: 0.4}}
      className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm"
    >
      <p className="text-sm font-bold text-stone-900">{t.followUpTitle}</p>
      <div className="mt-3 flex gap-2">
        <input
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && submit()}
          placeholder={t.followUpPlaceholder}
          disabled={loading}
          className="min-w-0 flex-1 rounded-xl border border-stone-200 bg-stone-50 px-4 py-2.5 text-sm text-stone-900 transition outline-none placeholder:text-stone-400 focus:border-amber-400 focus:bg-white focus:ring-4 focus:ring-amber-100 disabled:opacity-50"
        />
        <motion.button
          whileTap={{scale: 0.95}}
          onClick={submit}
          disabled={loading || !question.trim()}
          className="shrink-0 rounded-xl bg-stone-900 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-stone-700 disabled:opacity-40"
        >
          {t.followUpCta} →
        </motion.button>
      </div>
    </motion.div>
  )
}
