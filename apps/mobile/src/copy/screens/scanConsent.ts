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
  dailyLimit: 'You’ve used today’s 5 scans. Your scans reset at midnight — see you tomorrow.',
  analyzerFailed: 'We couldn’t analyse this photo. Try again facing soft, even light.',
  analyzerTimeout: 'Analysis is taking longer than usual. Please try again in a moment.',
  networkUnreachable: 'You’re offline. Check your connection, then take your scan again.',
  serviceUnavailable: 'Scanning is temporarily unavailable. Please try again in a few minutes.',
  imageInvalid: 'That photo couldn’t be read. Please take a new scan.',
  consentError: 'Could not save your choice. If this keeps happening, sign out and sign in again.',
  missingCapture: 'No photo to analyse — take a new scan.',
  analyzingFace: 'Checking for a clear face…',
} as const;
