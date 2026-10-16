/** Wellness disclaimers — must stay aligned with PRODUCT.md and store rules (DERM-064). */
export const complianceCopy = {
  notMedicalDevice: 'Not a medical device.',
  notMedicalDeviceFootnote: '4 questions · about 1 minute · not a medical device',
  consultProfessional:
    'For medical concerns, consult a dermatologist or other qualified professional.',
  aiConsentRequired:
    'Before your first scan, we will ask permission to send your photo for analysis using Google Gemini.',
  estimatesOnly: 'Scores and insights are estimates for wellness tracking, not a diagnosis.',
  /** Full in-app footer block — Welcome, Results, Profile, etc. */
  healthDeclaration:
    'Dermis is not a medical device. Scores and insights are wellness estimates, not a diagnosis or treatment. For medical concerns, consult a dermatologist or other qualified professional.',
  /** Store listing / questionnaire helper text (not shown as UI chrome). */
  storeListingNotMedicalDevice:
    'Dermis is a wellness app, not a medical device. It does not diagnose, treat, cure, or prevent disease.',
  storeListingWellnessEstimates: 'Skin scores are estimates for personal wellness tracking only.',
} as const;
