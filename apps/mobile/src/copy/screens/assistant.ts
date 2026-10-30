/** AI skincare assistant (Pro). Informational only — never diagnosis. */
export const assistantCopy = {
  title: 'Ask Dermis',
  subtitle: 'Skincare questions, explained simply',
  disclaimer:
    'AI answers are general wellness information, not a diagnosis. For anything worrying, see a dermatologist.',
  welcome:
    "Hi! I can explain your scores, suggest routine steps and answer skincare questions. I use your saved skin profile and recent scans — I'll tell you when I need more info.",
  suggestions: [
    'Explain my latest scan',
    'What should my evening routine be?',
    'How do I use retinol safely?',
    'Why did my score change?',
  ] as const,
  inputPlaceholder: 'Ask about your skin or routine…',
  send: 'Send',
  addPhoto: 'Add photo',
  removePhoto: 'Remove photo',
  photoAttached: 'Photo attached — sent with your next message',
  photoNote: 'Photos are only used to answer this message and are not saved.',
  takePhoto: 'Take photo',
  cancel: 'Cancel',
  thinking: 'Dermis is thinking…',
  seeProfessional: 'Worth showing a dermatologist',
  remaining: (n: number) => `${String(n)} messages left today`,
  lockedHint: 'The skincare assistant is part of Dermis Pro.',
  errorDailyLimit: "You've reached today's assistant limit. It resets at midnight (UTC).",
  errorUnavailable: "The assistant couldn't answer right now. Please try again in a moment.",
  errorOffline: "You're offline. Check your connection and try again.",
  errorNotConfigured: 'The assistant is not available yet.',
  errorPhoto: "Couldn't use that photo. Try again in good light.",
  openCta: 'Ask Dermis',
  openCtaHint: 'Questions about your skin or routine',
} as const;
