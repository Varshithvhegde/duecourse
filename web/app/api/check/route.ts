import {createOpenAICompatible} from '@ai-sdk/openai-compatible'
import {createMCPClient} from '@ai-sdk/mcp'
import {generateText, stepCountIs} from 'ai'

// Direct Sanity API access for post-processing enrichment (URLs the model
// tends to drop). Uses the same session token as the MCP connection.
const SANITY_PROJECT = 'qldtw72y'
const SANITY_DATASET = 'production'

interface SanitySchemeRow {
  name: string
  shortTitle?: string
  sources?: {url?: string}[]
  applicationSteps?: {url?: string}[]
}

/** Fetch apply/source URLs for scheme names straight from the dataset. */
async function enrichWithDatasetUrls(
  schemes: SchemeResult[],
  token: string,
): Promise<SchemeResult[]> {
  try {
    const query = `*[_type == "scheme"]{name, shortTitle, sources[]{url}, applicationSteps[]{url}}`
    const res = await fetch(
      `https://${SANITY_PROJECT}.api.sanity.io/v2023-05-03/data/query/${SANITY_DATASET}?query=${encodeURIComponent(query)}`,
      {headers: {Authorization: `Bearer ${token}`}},
    )
    if (!res.ok) return schemes
    const {result: rows} = (await res.json()) as {result: SanitySchemeRow[]}

    const normalize = (s: string) =>
      s.toLowerCase().replace(/[^a-z0-9]/g, '')

    return schemes.map((scheme) => {
      const candidates = [scheme.name, scheme.fullName ?? ''].map(normalize).filter(Boolean)
      const row = rows.find((r) => {
        const rowNames = [r.name, r.shortTitle ?? ''].map(normalize).filter(Boolean)
        return candidates.some((c) => rowNames.some((rn) => rn.includes(c) || c.includes(rn)))
      })
      if (!row) return scheme

      const applyUrl =
        scheme.applyUrl ||
        row.applicationSteps?.find((s) => s.url)?.url ||
        undefined
      const source = scheme.source || row.sources?.find((s) => s.url)?.url || undefined
      return {...scheme, applyUrl, source}
    })
  } catch {
    return schemes
  }
}

export const maxDuration = 120

// Inception Labs (Mercury diffusion LLMs) — OpenAI-compatible endpoint.
// Swap baseURL/model/env keys to move to any other OpenAI-compatible provider.
const inception = createOpenAICompatible({
  name: 'inception',
  baseURL: process.env.LLM_BASE_URL ?? 'https://api.inceptionlabs.ai/v1',
  apiKey: process.env.INCEPTION_API_KEY,
})

const MODEL = process.env.LLM_MODEL ?? 'mercury-2'

const SYSTEM_PROMPT = `You are Haqq, an agent that helps Indian citizens find government welfare schemes they are entitled to.

You have access to a Sanity Context MCP server in GROQ mode, backed by a live dataset of Indian government schemes (Central + Karnataka) with STRUCTURED eligibility rules. The schema is deployed — use schema_explorer if unsure of field names.

How to work:
1. Extract the citizen's attributes from their message: state, age, gender, occupation, income, caste category, land ownership, housing, family situation.
2. Fetch schemes with ONE groq_query — schemes with structured rules first:
   *[_type == "scheme" && defined(eligibility) && length(eligibility) > 0]{name, shortTitle, level, state, benefitAmountAnnual, brief, eligibility, documentsRequired[]->{name}, applicationSteps, sources, categories}
   If you need more, a second query for schemes without rules is allowed.
3. Reason rule-by-rule over each scheme's eligibility[] (attribute, operator, value, plainLanguage) against the citizen's attributes — never guess from a scheme's name alone.
4. ALWAYS check exclusion rules (isExclusion: true). Matching every positive rule means nothing if one exclusion matches.
5. If two sources disagree about a rule, show BOTH claims with their sources — never silently pick one.
6. Budget yourself: 2-4 tool calls total, then write the answer.

Be warm and plain. Your user may be reading on a small phone, in their second language.`

const FORMAT_PROMPT = `Now produce the final answer as ONE JSON object (no markdown fences, no prose outside the JSON):

{
  "summary": "2-3 warm sentences: how many schemes they likely qualify for and the headline result",
  "totalAnnualBenefit": 12345,           // sum of benefitAmountAnnual across LIKELY schemes; 0 if unknown
  "schemes": [
    {
      "name": "PM-KISAN",
      "fullName": "Pradhan Mantri Kisan Samman Nidhi",
      "verdict": "likely",               // "likely" | "possible" | "unlikely"
      "excludedBy": null,                // when verdict is "unlikely" because of an EXCLUSION rule: the plainLanguage of that rule, else null
      "reason": "Plain-language explanation citing the specific rules that decided it",
      "benefit": "₹6,000/year in three installments",
      "benefitAmountAnnual": 6000,       // number or null
      "level": "Central",                // "Central" | "State"
      "documents": ["Aadhaar Card", "Bank account"],
      "steps": ["Register on the PM-KISAN portal", "Complete eKYC"],
      "applyUrl": "https://pmkisan.gov.in",
      "source": "https://www.myscheme.gov.in/schemes/pm-kisan"
    }
  ],
  "missingInfo": ["Your annual income — it decides Ayushman Bharat"],
  "disclaimer": "This is guidance, not a guarantee — the administering office makes the final call."
}

Rules:
- Only schemes you actually retrieved from the dataset. Never invent schemes, amounts, or rules.
- When a scheme is "unlikely" because an exclusion rule (isExclusion: true) matched the citizen, set "excludedBy" to that rule's plainLanguage text and say so in the reason.
- Order schemes: "likely" first, then "possible", then "unlikely".
- Include at most 8 schemes, best matches first.
- If some fact was missing to decide a scheme, use verdict "possible" and note it in missingInfo.
- Output ONLY the JSON object.`

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

function extractJson(text: string): AgentAnswer | null {
  // tolerate ```json fences or leading/trailing prose
  const match = text.match(/\{[\s\S]*\}/)
  if (!match) return null
  const candidate = match[0]

  const attempt = (s: string): AgentAnswer | null => {
    try {
      const parsed = JSON.parse(s)
      if (!Array.isArray(parsed.schemes)) return null
      return parsed as AgentAnswer
    } catch {
      return null
    }
  }

  // 1) as-is
  const direct = attempt(candidate)
  if (direct) return direct

  // 2) light repairs for common LLM-JSON malformations:
  //    - unquoted bare values inside arrays (e.g. [ ಿನಿಮ್ಮ ... ])
  //    - trailing commas before ] or }
  //    - smart quotes
  const repaired = candidate
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/,\s*([}\]])/g, '$1')
    // quote bare (non-JSON-token) array elements: [ foo bar ] → [ "foo bar" ]
    .replace(/\[\s*([^"{[\]\s][^,\]\n]*?)\s*(,|\])/g, (_m, val, close) => {
      const trimmed = String(val).trim()
      if (!trimmed || /^[-\d.]/.test(trimmed) || /^(true|false|null)$/.test(trimmed)) {
        return `[ ${trimmed}${close}`
      }
      return `["${trimmed.replace(/"/g, '\\"')}"${close}`
    })

  return attempt(repaired)
}

export async function POST(req: Request) {
  const {message, lang, history} = await req.json()
  if (!message || typeof message !== 'string') {
    return Response.json({error: 'message is required'}, {status: 400})
  }
  const languageNote =
    lang === 'kn'
      ? '\n\nIMPORTANT: Write the entire answer in Kannada (ಕನ್ನಡ) — summary, reasons, steps, everything except scheme names and proper nouns, which stay in English.'
      : ''

  // Follow-up questions arrive with prior conversation turns — the agent
  // refines its earlier analysis instead of starting from scratch.
  const historyNote =
    Array.isArray(history) && history.length > 0
      ? `\n\nConversation so far (the citizen's follow-up refers to this):\n${history
          .slice(-6)
          .map((h: {role: string; content: string}) => `${h.role}: ${h.content}`)
          .join('\n')}\n\nTreat the new message as a follow-up: reuse the citizen's attributes from earlier turns, only re-query for what changed.`
      : ''

  const mcpUrl = process.env.SANITY_CONTEXT_MCP_URL
  const mcpToken = process.env.SANITY_CONTEXT_TOKEN
  if (!mcpUrl || !mcpToken) {
    return Response.json(
      {error: 'SANITY_CONTEXT_MCP_URL and SANITY_CONTEXT_TOKEN must be set'},
      {status: 500},
    )
  }
  if (!process.env.INCEPTION_API_KEY) {
    return Response.json({error: 'INCEPTION_API_KEY must be set'}, {status: 500})
  }

  let mcpClient: Awaited<ReturnType<typeof createMCPClient>> | null = null
  try {
    mcpClient = await createMCPClient({
      transport: {
        type: 'http',
        url: mcpUrl,
        headers: {Authorization: `Bearer ${mcpToken}`},
      },
    })

    const tools = await mcpClient.tools()

    const result = await generateText({
      model: inception(MODEL),
      system: SYSTEM_PROMPT + languageNote + historyNote,
      prompt: message,
      tools,
      stopWhen: stepCountIs(12),
    })

    // Final formatting pass: tools off, structured JSON out. We pass ONLY the
    // agent's final text (not the raw tool-call transcript — Mercury 503s on
    // multi-turn tool history in a tools-off request).
    const agentAnswer = result.text || '(the agent returned no text)'
    const toolCalls = result.steps.flatMap((s) =>
      s.toolCalls.map((tc) => ({tool: tc.toolName})),
    )

    try {
      // Keep the answer's language, but with strict JSON discipline: every
      // string quoted, no trailing commas. The repair-tolerant extractor
      // below handles residual malformations.
      const jsonDiscipline = lang === 'kn'
        ? 'Write the JSON string VALUES in Kannada (scheme names stay in English). CRITICAL: every string must be wrapped in double quotes, arrays contain only quoted strings, no trailing commas.'
        : 'CRITICAL: every string must be wrapped in double quotes, arrays contain only quoted strings, no trailing commas.'
      const final = await generateText({
        model: inception(MODEL),
        system: 'You reformat eligibility answers into strict, valid JSON.',
        messages: [
          {
            role: 'user',
            content: `The citizen asked: "${message}"\n\nThe eligibility agent's answer:\n${agentAnswer}\n\n${FORMAT_PROMPT}\n\n${jsonDiscipline}`,
          },
        ],
      })

      const structured = extractJson(final.text)
      if (structured) {
        // Attach real apply/source URLs from the dataset — the model often
        // drops them when reformatting, and they are the whole point.
        structured.schemes = await enrichWithDatasetUrls(structured.schemes, mcpToken)
        return Response.json({fallback: false, result: structured, toolCalls})
      }
      // Model didn't produce valid JSON — degrade to markdown rendering
      return Response.json({fallback: true, answer: final.text || agentAnswer, toolCalls})
    } catch (formatErr) {
      // Formatting pass failed (provider hiccup) — still show the agent's answer
      console.warn('[/api/check] formatting pass failed, using raw answer', formatErr)
      return Response.json({fallback: true, answer: agentAnswer, toolCalls})
    }
  } catch (err) {
    // Always return JSON so the frontend never hangs on a bare 500
    const message =
      err instanceof Error ? err.message : 'The agent hit an unexpected error'
    console.error('[/api/check]', err)
    return Response.json({error: message}, {status: 500})
  } finally {
    await mcpClient?.close().catch(() => {})
  }
}
