'use client'

import {createContext, useContext, useEffect, useState, type ReactNode} from 'react'

export type Lang = 'en' | 'kn'

const STRINGS = {
  en: {
    tagline: 'India has 4,700+ welfare schemes',
    title1: 'The government owes you',
    title2: 'more than you think.',
    subtitle:
      'Tell me about your situation in plain words. I will find every scheme you qualify for, explain why, and show you exactly how to claim it — with official sources.',
    placeholder:
      'e.g. I am a widowed farmer in Karnataka with two school-age daughters. We own 1 acre of land…',
    cta: 'Find my schemes',
    tryExample: 'Or try one of these',
    examples: [
      {label: 'Widowed farmer, Karnataka', text: 'I am a widowed farmer in Karnataka with two school-age daughters. We own 1 acre of land.'},
      {label: 'New graduate, Bengaluru', text: 'I just finished my degree in Bengaluru this year and I am still looking for a job.'},
      {label: 'Delivery rider, expecting a child', text: 'My wife is pregnant with our first child. I work as a delivery rider, no PF or anything.'},
      {label: 'BPL family, elderly mother', text: 'We are a BPL family of five in Kalaburagi. My mother is 65 and has no pension.'},
      {label: 'Farmer with a government job', text: 'I am a farmer with 2 acres of land in Karnataka, but I also work as a government clerk. What schemes can I get?'},
    ],
    stages: [
      'Reading the scheme database…',
      'Checking your situation against the rules…',
      'Preparing your results…',
    ],
    results: 'Your results',
    perYear: 'per year in benefits you are likely owed',
    likely: 'Likely eligible',
    possible: 'Worth checking',
    unlikely: 'Probably not',
    documents: 'Documents you will need',
    howToApply: 'How to apply',
    applyNow: 'Apply now',
    source: 'Official source',
    sharpen: 'Tell me more to sharpen these results',
    tryAgain: 'Try again',
    somethingWrong: 'Something went wrong',
    tooLong: 'The agent took too long — please try again.',
    disclaimer:
      'Entitled is an information tool, not legal or financial advice. Final eligibility is decided by the administering department.',
    footer: 'Built on Sanity structured content — every claim links to its official source.',
    schemesFound: 'schemes matched to you',
    disqualifiedBy: 'Disqualifying rule',
    followUpTitle: 'Ask a follow-up',
    followUpPlaceholder: 'e.g. What about scholarships for my daughters?',
    followUpCta: 'Ask',
    whatsapp: 'Share on WhatsApp',
    whatsappHeader: '*My welfare scheme results (Entitled)*',
  },
  kn: {
    tagline: 'ಭಾರತದಲ್ಲಿ 4,700+ ಕಲ್ಯಾಣ ಯೋಜನೆಗಳಿವೆ',
    title1: 'ಸರ್ಕಾರ ನಿಮಗೆ ನೀಡಬೇಕಾದ್ದು',
    title2: 'ನೀವು ಭಾವಿಸುವಷ್ಟಕ್ಕಿಂತ ಹೆಚ್ಚು.',
    subtitle:
      'ನಿಮ್ಮ ಪರಿಸ್ಥಿತಿಯನ್ನು ಸರಳ ಮಾತುಗಳಲ್ಲಿ ಹೇಳಿ. ನೀವು ಅರ್ಹರಾದ ಪ್ರತಿ ಯೋಜನೆಯನ್ನು ಹುಡುಕಿ, ಏಕೆಂದು ವಿವರಿಸಿ, ಅಧಿಕೃತ ಮೂಲಗಳೊಂದಿಗೆ ಹೇಗೆ ಅರ್ಜಿ ಹಾಕುವುದು ಎಂದು ತೋರಿಸುತ್ತೇನೆ.',
    placeholder:
      'ಉದಾ: ನಾನು ಕರ್ನಾಟಕದ ವಿಧವೆ ರೈತೆ, ಇಬ್ಬರು ಶಾಲೆಯ ಮಕ್ಕಳಿದ್ದಾರೆ. ನಮ್ಮ ಬಳಿ 1 ಎಕರೆ ಜಮೀನಿದೆ…',
    cta: 'ನನ್ನ ಯೋಜನೆಗಳನ್ನು ಹುಡುಕಿ',
    tryExample: 'ಅಥವಾ ಇವುಗಳಲ್ಲಿ ಒಂದನ್ನು ಪ್ರಯತ್ನಿಸಿ',
    examples: [
      {label: 'ವಿಧವೆ ರೈತೆ, ಕರ್ನಾಟಕ', text: 'I am a widowed farmer in Karnataka with two school-age daughters. We own 1 acre of land.'},
      {label: 'ಹೊಸ ಪದವೀಧರ, ಬೆಂಗಳೂರು', text: 'I just finished my degree in Bengaluru this year and I am still looking for a job.'},
      {label: 'ಡೆಲಿವರಿ ಸಿಬ್ಬಂದಿ, ಮಗು ನಿರೀಕ್ಷೆ', text: 'My wife is pregnant with our first child. I work as a delivery rider, no PF or anything.'},
      {label: 'BPL ಕುಟುಂಬ, ವೃದ್ಧ ತಾಯಿ', text: 'We are a BPL family of five in Kalaburagi. My mother is 65 and has no pension.'},
      {label: 'ಸರ್ಕಾರಿ ಉದ್ಯೋಗಿಯ ರೈತ', text: 'I am a farmer with 2 acres of land in Karnataka, but I also work as a government clerk. What schemes can I get?'},
    ],
    stages: [
      'ಯೋಜನೆಗಳ ದತ್ತಾಂಶವನ್ನು ಓದಲಾಗುತ್ತಿದೆ…',
      'ನಿಮ್ಮ ಪರಿಸ್ಥಿತಿಯನ್ನು ನಿಯಮಗಳ ವಿರುದ್ಧ ಪರಿಶೀಲಿಸಲಾಗುತ್ತಿದೆ…',
      'ನಿಮ್ಮ ಫಲಿತಾಂಶಗಳನ್ನು ಸಿದ್ಧಪಡಿಸಲಾಗುತ್ತಿದೆ…',
    ],
    results: 'ನಿಮ್ಮ ಫಲಿತಾಂಶಗಳು',
    perYear: 'ಪ್ರತಿ ವರ್ಷ ನೀವು ಪಡೆಯಬಹುದಾದ ಪ್ರಯೋಜನ',
    likely: 'ಹೆಚ್ಚು ಸಾಧ್ಯತೆ ಅರ್ಹರು',
    possible: 'ಪರಿಶೀಲಿಸಬಹುದು',
    unlikely: 'ಬಹುಶಃ ಅರ್ಹರಲ್ಲ',
    documents: 'ಬೇಕಾದ ದಾಖಲೆಗಳು',
    howToApply: 'ಅರ್ಜಿ ಹಾಕುವ ವಿಧಾನ',
    applyNow: 'ಈಗಲೇ ಅರ್ಜಿ ಹಾಕಿ',
    source: 'ಅಧಿಕೃತ ಮೂಲ',
    sharpen: 'ಫಲಿತಾಂಶಗಳನ್ನು ಸುಧಾರಿಸಲು ಇನ್ನಷ್ಟು ಹೇಳಿ',
    tryAgain: 'ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ',
    somethingWrong: 'ಏನೋ ತಪ್ಪಾಗಿದೆ',
    tooLong: 'ಏಜೆಂಟ್ ಹೆಚ್ಚು ಸಮಯ ತೆಗೆದುಕೊಂಡಿತು — ದಯವಿಟ್ಟು ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.',
    disclaimer:
      'Entitled ಒಂದು ಮಾಹಿತಿ ಸಾಧನ, ಕಾನೂನು ಅಥವಾ ಹಣಕಾಸು ಸಲಹೆಯಲ್ಲ. ಅಂತಿಮ ಅರ್ಹತೆಯನ್ನು ಸಂಬಂಧಪಟ್ಟ ಇಲಾಖೆ ನಿರ್ಧರಿಸುತ್ತದೆ.',
    footer: 'Sanity ರಚನಾತ್ಮಕ ವಿಷಯದ ಮೇಲೆ ನಿರ್ಮಿತ — ಪ್ರತಿ ಹೇಳಿಕೆ ಅಧಿಕೃತ ಮೂಲಕ್ಕೆ ಸಂಪರ್ಕ ಹೊಂದಿದೆ.',
    schemesFound: 'ಯೋಜನೆಗಳು ನಿಮಗೆ ಹೊಂದಿಕೆಯಾದವು',
    disqualifiedBy: 'ಅನರ್ಹಗೊಳಿಸುವ ನಿಯಮ',
    followUpTitle: 'ಮುಂದಿನ ಪ್ರಶ್ನೆ ಕೇಳಿ',
    followUpPlaceholder: 'ಉದಾ: ನನ್ನ ಮಗಳಿಗೆ ವಿದ್ಯಾರ್ಥಿವೇತನ ಇದೆಯೇ?',
    followUpCta: 'ಕೇಳಿ',
    whatsapp: 'WhatsApp ನಲ್ಲಿ ಹಂಚಿಕೊಳ್ಳಿ',
    whatsappHeader: '*ನನ್ನ ಕಲ್ಯಾಣ ಯೋಜನೆ ಫಲಿತಾಂಶಗಳು (Entitled)*',
  },
} as const

export type Strings = (typeof STRINGS)['en']

const LangContext = createContext<{lang: Lang; setLang: (l: Lang) => void; t: Strings}>({
  lang: 'en',
  setLang: () => {},
  t: STRINGS.en,
})

export function LangProvider({children}: {children: ReactNode}) {
  const [lang, setLangState] = useState<Lang>('en')

  // Restore the visitor's language choice on first paint
  useEffect(() => {
    const saved = localStorage.getItem('entitled-lang')
    if (saved === 'kn' || saved === 'en') setLangState(saved)
  }, [])

  const setLang = (l: Lang) => {
    setLangState(l)
    localStorage.setItem('entitled-lang', l)
  }

  return (
    <LangContext.Provider value={{lang, setLang, t: STRINGS[lang] as Strings}}>
      {children}
    </LangContext.Provider>
  )
}

export const useLang = () => useContext(LangContext)
