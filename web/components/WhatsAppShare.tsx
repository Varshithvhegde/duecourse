'use client'

import {motion} from 'framer-motion'
import type {AgentAnswer} from '../lib/types'
import {useLang} from '../lib/i18n'

const VERDICT_EMOJI = {likely: '✅', possible: '🟡', unlikely: '❌'} as const

export default function WhatsAppShare({result}: {result: AgentAnswer}) {
  const {t} = useLang()

  function share() {
    const lines: string[] = [t.whatsappHeader, '', result.summary, '']
    if (result.totalAnnualBenefit && result.totalAnnualBenefit > 0) {
      lines.push(`💰 ₹${result.totalAnnualBenefit.toLocaleString('en-IN')} ${t.perYear}`, '')
    }
    for (const s of result.schemes) {
      lines.push(`${VERDICT_EMOJI[s.verdict] ?? '•'} *${s.name}*${s.benefit ? ` — ${s.benefit}` : ''}`)
      if (s.applyUrl) lines.push(`   ${s.applyUrl}`)
    }
    lines.push('', t.disclaimer)
    const url = `https://wa.me/?text=${encodeURIComponent(lines.join('\n'))}`
    window.open(url, '_blank', 'noopener')
  }

  return (
    <motion.button
      whileHover={{y: -1}}
      whileTap={{scale: 0.97}}
      onClick={share}
      className="inline-flex items-center gap-2 rounded-full bg-[#25D366] px-5 py-2.5 text-sm font-bold text-white shadow-md transition hover:brightness-105"
    >
      <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden>
        <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38a9.87 9.87 0 0 0 4.74 1.21c5.46 0 9.91-4.45 9.91-9.91S17.5 2 12.04 2Zm0 18.03a8.1 8.1 0 0 1-4.13-1.13l-.3-.18-3.12.82.83-3.04-.2-.31a8.08 8.08 0 0 1-1.24-4.28c0-4.47 3.64-8.1 8.12-8.1 4.47 0 8.1 3.63 8.1 8.1s-3.59 8.12-8.06 8.12Zm4.45-6.07c-.24-.12-1.44-.71-1.66-.79-.22-.08-.39-.12-.55.12-.16.24-.63.79-.77.95-.14.16-.28.18-.53.06-.24-.12-1.03-.38-1.96-1.21-.72-.64-1.21-1.44-1.35-1.68-.14-.24-.02-.37.11-.5.11-.11.24-.28.37-.42.12-.14.16-.24.24-.4.08-.16.04-.31-.02-.43-.06-.12-.55-1.32-.75-1.81-.2-.48-.4-.41-.55-.42h-.47c-.16 0-.43.06-.65.31-.22.24-.86.84-.86 2.05 0 1.21.88 2.37 1 2.53.12.16 1.72 2.63 4.18 3.69.58.25 1.04.4 1.4.52.59.19 1.12.16 1.54.1.47-.07 1.44-.59 1.64-1.16.2-.57.2-1.05.14-1.16-.06-.1-.22-.16-.47-.28Z" />
      </svg>
      {t.whatsapp}
    </motion.button>
  )
}
