'use client'

import {motion} from 'framer-motion'
import {useLang} from '../lib/i18n'

export default function LangToggle() {
  const {lang, setLang} = useLang()

  return (
    <div className="flex items-center rounded-full bg-stone-100 p-1 ring-1 ring-stone-900/5">
      {(['en', 'kn'] as const).map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => setLang(l)}
          className={`relative rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors ${
            lang === l ? 'text-white' : 'text-stone-500 hover:text-stone-800'
          }`}
        >
          {lang === l && (
            <motion.span
              layoutId="lang-pill"
              className="absolute inset-0 rounded-full bg-stone-900"
              transition={{type: 'spring', stiffness: 400, damping: 30}}
            />
          )}
          <span className="relative">{l === 'en' ? 'EN' : 'ಕನ್ನಡ'}</span>
        </button>
      ))}
    </div>
  )
}
