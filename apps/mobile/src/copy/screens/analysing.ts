/**
 * Analysing steps — compliant wellness wording, no "68 landmarks" or
 * diagnostic claims (PRODUCT.md D4 / claimsAudit).
 */
export const analysingCopy = {
  title: 'Analysing',
  subtitle: 'Analysing your selfie…',
  ready: "Report ready. Let's look!",
  steps: [
    'Mapping your facial features',
    'Reviewing six face zones',
    'Measuring tone, texture and clarity',
    'Scoring concerns against your baseline',
  ] as const,
  footnote: 'Scores are estimates for wellness tracking, not a diagnosis.',
} as const;
