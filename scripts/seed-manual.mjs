/**
 * Creates scheme documents that myScheme doesn't carry (or carries poorly):
 * PM Jan Dhan, e-Shram, and Karnataka's three flagship state schemes.
 * Their structured rules come from flagship-rules.json via seed-curated.mjs.
 *
 *   node seed-manual.mjs   (env via .env, same as seed.mjs)
 */

import {createClient} from '@sanity/client'
import {readFile} from 'node:fs/promises'

try {
  const env = await readFile(new URL('./.env', import.meta.url), 'utf8')
  for (const line of env.split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/)
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2]
  }
} catch {}

const {SANITY_PROJECT_ID, SANITY_DATASET = 'production', SANITY_TOKEN} = process.env
if (!SANITY_PROJECT_ID || !SANITY_TOKEN) {
  console.error('Set SANITY_PROJECT_ID and SANITY_TOKEN')
  process.exit(1)
}

const sanity = createClient({
  projectId: SANITY_PROJECT_ID,
  dataset: SANITY_DATASET,
  token: SANITY_TOKEN,
  apiVersion: '2025-01-01',
  useCdn: false,
})

const key = () => Math.random().toString(36).slice(2, 12)
const today = new Date().toISOString().slice(0, 10)
const src = (title, url) => ({
  _type: 'source',
  _key: key(),
  title,
  url,
  publisher: new URL(url).hostname,
  accessedAt: today,
})

const schemes = [
  {
    slug: 'pmjdy',
    name: 'Pradhan Mantri Jan Dhan Yojana (PMJDY)',
    shortTitle: 'PMJDY',
    level: 'Central',
    ministry: 'Ministry of Finance',
    brief: 'National mission for financial inclusion — zero-balance bank account with RuPay debit card, accident insurance and overdraft facility.',
    categories: ['Banking, Financial Services and Insurance'],
    sources: [src('PMJDY — official portal', 'https://pmjdy.gov.in')],
  },
  {
    slug: 'e-shram',
    name: 'e-Shram — National Database of Unorganised Workers',
    shortTitle: 'e-Shram',
    level: 'Central',
    ministry: 'Ministry of Labour and Employment',
    brief: 'Registration portal for unorganised-sector workers; the e-Shram card is the gateway to central and state welfare schemes for informal workers.',
    categories: ['Social welfare & Empowerment', 'Skills & Employment'],
    sources: [src('e-Shram — official portal', 'https://eshram.gov.in')],
  },
  {
    slug: 'karnataka-gruha-lakshmi',
    name: 'Gruha Lakshmi Scheme (Karnataka)',
    shortTitle: 'Gruha Lakshmi',
    level: 'State',
    state: 'Karnataka',
    ministry: 'Department of Women and Child Development, Karnataka',
    brief: '₹2,000 monthly direct transfer to women heads of household in Karnataka.',
    categories: ['Social welfare & Empowerment', 'Women and Child'],
    sources: [src('Gruha Lakshmi — Seva Sindhu', 'https://sevasindhu.karnataka.gov.in')],
  },
  {
    slug: 'karnataka-yuva-nidhi',
    name: 'Yuva Nidhi Scheme (Karnataka)',
    shortTitle: 'Yuva Nidhi',
    level: 'State',
    state: 'Karnataka',
    ministry: 'Department of Skill Development, Karnataka',
    brief: 'Monthly unemployment allowance for Karnataka graduates (₹3,000) and diploma holders (₹1,500) for up to 2 years.',
    categories: ['Skills & Employment', 'Education & Learning'],
    sources: [src('Yuva Nidhi — Seva Sindhu', 'https://sevasindhu.karnataka.gov.in')],
  },
  {
    slug: 'karnataka-anna-bhagya',
    name: 'Anna Bhagya Scheme (Karnataka)',
    shortTitle: 'Anna Bhagya',
    level: 'State',
    state: 'Karnataka',
    ministry: 'Department of Food, Civil Supplies & Consumer Affairs, Karnataka',
    brief: 'Free rice (10 kg per person per month) for BPL and Antyodaya ration card holders in Karnataka.',
    categories: ['Social welfare & Empowerment'],
    sources: [src('Anna Bhagya — Karnataka Food & Civil Supplies', 'https://ahara.kar.nic.in')],
  },
]

for (const s of schemes) {
  const {_id, ...rest} = {_id: `scheme-${s.slug}`, ...s}
  await sanity.createOrReplace({
    _id,
    _type: 'scheme',
    slug: {_type: 'slug', current: s.slug},
    lastVerified: today,
    status: 'active',
    ...rest,
  })
  console.log(`✓ ${s.slug}`)
}
console.log('Manual schemes created.')
