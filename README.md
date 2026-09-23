# DueCourse — what you're due, of course

An AI agent that tells Indian citizens which government welfare schemes they
qualify for — in plain language, with citations — built on Sanity structured
content for the DEV Sanity Challenge (Path One).

India runs 4,700+ welfare schemes worth ₹1.5 lakh crore a year. Much of it goes
unclaimed because eligibility rules are scattered, written in legalese, and
contradict each other across central and state sources. DueCourse models those
rules as structured content so an agent can *reason* over them instead of
keyword-searching PDFs.

## Repo layout

| Folder | What |
|---|---|
| `studio/` | Sanity Studio — schema (`scheme`, `eligibilityRule`, `document`, `applicationStep`, `source`) |
| `scripts/` | Seed scripts — bulk import from the myScheme ecosystem + hand-curated flagship rules |
| `web/` | Next.js app — plain-language intake → agent (Context MCP) → verdict cards |

## Setup

```bash
# 1. Studio
cd studio && npm install
# create .env with SANITY_STUDIO_PROJECT_ID=<your project id>
npm run dev

# 2. Seed (~100 schemes: Central + Karnataka)
cd ../scripts && npm install
SANITY_PROJECT_ID=xxx SANITY_TOKEN=<write token> APIMITRA_KEY=<key> node seed.mjs
SANITY_PROJECT_ID=xxx SANITY_TOKEN=<write token> node seed-curated.mjs

# 3. Deploy the schema (required for Context MCP GROQ mode)
cd ../studio && npx sanity schema deploy

# 4. Knowledge Base + Context MCP
#    Sanity Manage → Labs → enable Knowledge Bases (beta)
#    Create a KB from this dataset → create a Context MCP endpoint
#    Auth: ORGANIZATION-level token with Context Viewer grant (project tokens 403!)

# 5. Web app
cd ../web && npm install
# .env.local: SANITY_CONTEXT_MCP_URL, SANITY_CONTEXT_TOKEN, ANTHROPIC_API_KEY
npm run dev
```

## Data sources

- [myscheme.gov.in](https://www.myscheme.gov.in) — official GoI national scheme
  platform (public API, 4,700+ schemes)
- [API Mitra schemes mirror](https://docs.apimitra.in/india/schemes) — bulk
  list/search over the myScheme index
- Karnataka state portals (Seva Sindhu) for state-scheme verification

Every scheme document carries `sources[]` with official URLs; the agent cites
them in every answer. When sources disagree (central vs. state rules), the
Knowledge Base surfaces both claims side by side.

## Disclaimer

DueCourse is an information tool, not legal or financial advice. Final
eligibility is determined by the administering department.
