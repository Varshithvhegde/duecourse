/**
 * Applies hand-curated structured eligibility rules, documents and
 * application steps to the flagship schemes (flagship-rules.json).
 * Run AFTER seed.mjs has created the scheme documents.
 *
 *   SANITY_PROJECT_ID=xxx SANITY_TOKEN=xxx node seed-curated.mjs
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
const rules = JSON.parse(await readFile(new URL('./flagship-rules.json', import.meta.url), 'utf8'))

/** Find-or-create a shared document (Aadhaar etc.), return its _id */
async function docRef(name) {
  const id = `doc-${name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`
  await sanity.createIfNotExists({_id: id, _type: 'identityDocument', name})
  return id
}

for (const flagship of rules) {
  const schemeId = `scheme-${flagship.slug}`
  const exists = await sanity.getDocument(schemeId)
  if (!exists) {
    console.warn(`⚠ ${schemeId} not found — run seed.mjs first (skipping)`)
    continue
  }

  const docRefs = []
  for (const name of flagship.documentsRequired || []) {
    docRefs.push({_type: 'reference', _key: key(), _ref: await docRef(name)})
  }

  await sanity
    .patch(schemeId)
    .set({
      benefitAmountAnnual: flagship.benefitAmountAnnual ?? undefined,
      eligibility: (flagship.eligibility || []).map((r) => ({_type: 'eligibilityRule', _key: key(), ...r})),
      documentsRequired: docRefs,
      applicationSteps: (flagship.applicationSteps || []).map((s) => ({
        _type: 'applicationStep',
        _key: key(),
        ...s,
      })),
    })
    .commit()
  console.log(`✓ ${flagship.slug}`)
}
console.log('Flagship rules applied.')
