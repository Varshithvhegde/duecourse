export interface SchemeResult {
  name: string
  fullName?: string
  verdict: 'likely' | 'possible' | 'unlikely'
  excludedBy?: string | null
  reason: string
  benefit?: string
  benefitAmountAnnual?: number | null
  level?: string
  documents?: string[]
  steps?: string[]
  applyUrl?: string
  source?: string
}

export interface AgentAnswer {
  summary: string
  totalAnnualBenefit?: number
  schemes: SchemeResult[]
  missingInfo?: string[]
  disclaimer?: string
}
