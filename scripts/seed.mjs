/**
 * DueCourse seed script
 *
 * Pulls Indian welfare schemes into the Sanity dataset:
 *   1. Bulk list from the API Mitra mirror of myScheme (filterable, fast)
 *   2. Per-scheme detail from the official myScheme API where available
 *
 * Usage:
 *   SANITY_PROJECT_ID=xxx SANITY_TOKEN=xxx node seed.mjs
 *
 * Env:
 *   SANITY_PROJECT_ID  (required)
 *   SANITY_DATASET     (default: production)
 *   SANITY_TOKEN       (required — a write token for the project)
 *   APIMITRA_KEY       (optional — api.apimitra.in key; without it we seed
 *                       from the curated list in curated-schemes.json instead)
 *   STATE              (default: Karnataka)
 *   MAX_SCHEMES        (default: 100 — stay under the KB free-tier doc cap)
 */

import {createClient} from '@sanity/client'
import {readFile} from 'node:fs/promises'

// Load .env sitting next to this script (no dotenv dependency)
try {
  const env = await readFile(new URL('./.env', import.meta.url), 'utf8')
  for (const line of env.split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/)
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2]
  }
} catch {
  /* .env optional — vars can come from the shell */
}

const PROJECT_ID = process.env.SANITY_PROJECT_ID
const DATASET = process.env.SANITY_DATASET || 'production'
const TOKEN = process.env.SANITY_TOKEN
const APIMITRA_KEY = process.env.GOVT_SCHEME_API_KEY
const STATE = process.env.STATE || 'Karnataka'
const MAX = Number(process.env.MAX_SCHEMES || 100)

// Search queries that guarantee the flagship schemes land in the dataset
const FLAGSHIP_QUERIES = [
  'pm kisan',
  'ayushman bharat',
  'pm awas urban',
  'ujjwala',
  'matru vandana',
  'jan dhan',
  'e shram',
]

if (!PROJECT_ID || !TOKEN) {
  console.error('Set SANITY_PROJECT_ID and SANITY_TOKEN')
  process.exit(1)
}

const sanity = createClient({
  projectId: PROJECT_ID,
  dataset: DATASET,
  token: TOKEN,
  apiVersion: '2025-01-01',
  useCdn: false,
})

const key = () => Math.random().toString(36).slice(2, 12)

/** Portable-text block from a plain string */
const block = (text) => ({
  _type: 'block',
  _key: key(),
  style: 'normal',
  markDefs: [],
  children: [{_type: 'span', _key: key(), text: String(text || ''), marks: []}],
})

const markdownToBlocks = (md) =>
  String(md || '')
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean)
    .map(block)

async function fetchList() {
  const api = (q) => `https://api.apimitra.in/schemes?${q}`
  const get = async (url) => {
    const res = await fetch(url, {headers: {'x-api-key': APIMITRA_KEY}})
    if (!res.ok) throw new Error(`API Mitra ${res.status} for ${url}`)
    return (await res.json()).data || []
  }

  // Flagship schemes by name FIRST — the bulk list is alphabetical and would
  // otherwise fill the cap before the schemes we actually demo get in
  const results = []
  for (const q of FLAGSHIP_QUERIES) {
    results.push(...(await get(api(`q=${encodeURIComponent(q)}&limit=3`))))
  }

  // Bulk: Central schemes + schemes for the chosen state
  results.push(
    ...(await get(api(`level=central&limit=100`))),
    ...(await get(api(`state=${encodeURIComponent(STATE.toLowerCase())}&limit=100`))),
  )

  // de-dupe by slug
  const seen = new Set()
  return results.filter((s) => !seen.has(s.slug) && seen.add(s.slug)).slice(0, MAX)
}

async function fetchDetail(slug) {
  // Official myScheme detail API (public, powers the portal)
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 8000)
  try {
    const res = await fetch(`${process.env.MYSCHEME_API_URL}/${slug}`, {
      signal: controller.signal,
    })
    if (!res.ok) return null
    const json = await res.json()
    return json?.data || null
  } catch {
    return null
  } finally {
    clearTimeout(timer)
  }
}

function toSchemeDoc(item, detail) {
  const isState = item.level === 'State'
  return {
    _id: `scheme-${item.slug}`,
    _type: 'scheme',
    name: item.scheme_name,
    shortTitle: item.short_title || undefined,
    slug: {_type: 'slug', current: item.slug},
    level: isState ? 'State' : 'Central',
    state: isState ? STATE : undefined,
    ministry: item.ministry || undefined,
    brief: (item.brief || '').slice(0, 300),
    categories: (item.categories || '').split(',').map((c) => c.trim()).filter(Boolean),
    benefits: detail?.benefits ? markdownToBlocks(detail.benefits) : undefined,
    eligibilityNotes: detail?.eligibility ? markdownToBlocks(detail.eligibility) : undefined,
    sources: [
      {
        _type: 'source',
        _key: key(),
        title: `${item.scheme_name} — myScheme`,
        url: `https://www.myscheme.gov.in/schemes/${item.slug}`,
        publisher: 'myscheme.gov.in',
        accessedAt: new Date().toISOString().slice(0, 10),
      },
      ...(detail?.references || []).map((ref) => ({
        _type: 'source',
        _key: key(),
        title: ref.title || 'Official reference',
        url: ref.url,
        publisher: new URL(ref.url).hostname,
        accessedAt: new Date().toISOString().slice(0, 10),
      })),
    ],
    lastVerified: new Date().toISOString().slice(0, 10),
    status: 'active',
  }
}

async function main() {
  let list
  if (APIMITRA_KEY) {
    console.log(`Fetching scheme list (Central + ${STATE}) from API Mitra…`)
    list = await fetchList()
  } else {
    console.log('No APIMITRA_KEY — seeding from curated-schemes.json')
    list = JSON.parse(await readFile(new URL('./curated-schemes.json', import.meta.url), 'utf8'))
  }

  console.log(`${list.length} schemes to seed`)
  let created = 0
  for (const item of list) {
    let detail = null
    try {
      detail = await fetchDetail(item.slug)
    } catch {
      /* detail is best-effort; list data alone still seeds */
    }
    const doc = toSchemeDoc(item, detail)
    await sanity.createOrReplace(doc)
    created++
    if (created % 10 === 0) console.log(`  ${created}/${list.length}`)
  }
  console.log(`Done — ${created} scheme documents in ${PROJECT_ID}/${DATASET}`)
  console.log('NOTE: structured eligibility[] rules are curated by hand in the Studio')
  console.log('for the ~20 flagship schemes (see scripts/flagship-rules.json).')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
