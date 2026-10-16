import { complianceCopy } from '../compliance';

/** In-app privacy overview (DERM-060/061) — not a substitute for the public Privacy Policy. */
export const privacyCopy = {
  title: 'Privacy & analysis',
  headline: 'How Dermis uses your selfie',
  body:
    'Photos are sent securely to our servers for analysis using Google’s Gemini API. ' +
    'Scores and insights are wellness estimates, not a diagnosis.',
  bulletCloud: 'Your selfie is analysed in the cloud on our servers.',
  bulletKeys: 'Gemini API keys stay on the server; they are never in the app bundle.',
  bulletControl: 'You can export data or delete your account in Profile.',
  // TODO(spec): exact retention sentence after legal review.
  retentionNote: 'Photo and score retention details are in our Privacy Policy.',
  openPolicy: 'Open Privacy Policy',
  openTerms: 'Open Terms of Use',
  missingUrl: 'Add Privacy and Terms URLs in env to open these links.',
  notMedical: complianceCopy.healthDeclaration,
} as const;
