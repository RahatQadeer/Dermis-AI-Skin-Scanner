/** AI consent — full screen before first scan (DERM-060); sheet reuses these strings. */
export const scanConsentCopy = {
  title: 'Allow face analysis?',
  headline: 'Before your first scan',
  body:
    'Photos are sent securely to our servers for analysis using Google’s Gemini API. ' +
    'Dermis estimates wellness scores — not a diagnosis or medical device. Only scan your own face.',
  bulletTransit: 'Your selfie leaves the device and is encrypted in transit.',
  bulletGemini: 'Analysis runs with Google Gemini on our backend — API keys never ship in the app.',
  bulletScores: 'We keep scores and scan metadata per our Privacy Policy.',
  bulletDelete: 'You can export or delete your account and data in Profile.',
  retention:
    // TODO(spec): final retention wording after legal sign-off (photo delete-after-analysis proposal).
    'Photo retention follows our Privacy Policy. You can delete your account and data in the app.',
  privacyLink: 'How we handle photos & data',
  allow: 'Allow analysis',
  notNow: 'Not now',
  uploadError: 'Could not complete your scan. Try again.',
  freeLimit:
    'You’ve used your free scan. Upgrade to Pro for more scans, or restore purchases if you already subscribed.',
  dailyLimit:
    'You’ve reached today’s scan limit. Try again tomorrow, or keep testing with local unlock enabled.',
  analyzerFailed: 'Analysis failed. Check your connection and try another clear selfie.',
  analyzerTimeout: 'Analysis took too long. Try again with a clearer, closer face photo.',
  consentError: 'Could not save your choice. If this keeps happening, sign out and sign in again.',
  missingCapture: 'No photo to analyse — take a new scan.',
  analyzingFace: 'Checking for a clear face…',
} as const;
