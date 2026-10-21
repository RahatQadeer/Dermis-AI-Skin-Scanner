export const resultsCopy = {
  title: 'Your report',
  reportTitle: (when: string) => `Report · ${when}`,
  shareCta: 'Share',
  indexTitle: 'SKIN HEALTH INDEX',
  indexCaption: 'Overall wellness estimate from this scan',
  indexInsight: 'A calm baseline from this selfie — track habits over time.',
  indexInsightDelta: (delta: number, when: string) =>
    delta >= 0
      ? `Up ${String(delta)} since ${when}. Texture improved the most!`
      : `Down ${String(Math.abs(delta))} since ${when}. Soft light and gentle care help the next scan.`,
  deltaVs: (delta: number, when: string) => `${delta >= 0 ? '+' : ''}${String(delta)} vs ${when}`,
  /** Must keep “estimate” — D4 bans bare “skin age”. */
  skinAgeEstimate: (age: number) => `Skin age estimate ${String(age)}`,
  zonesTitle: 'Zone map',
  zonesTapHint: 'Tap a zone',
  zonesLockedHint: 'Zone map is included on each Pro scan',
  concernsTitle: 'Per-concern scores',
  concernsHigherBetter: 'higher is better',
  professorEyebrow: "PROFESSOR PUFF'S NOTE",
  professorTitle: 'How to improve',
  professorNext: 'Next note →',
  emptyTitle: 'No report yet',
  emptyBody: 'Take a scan to see your Skin Health Index and concern scores.',
  emptyCta: 'Take a scan',
  doneCta: 'Back to home',
  compareCta: 'Compare over time',
  updateRoutineCta: 'Update routine',
  recommendationsCta: 'Product ideas',
  pdfExportCta: 'Export PDF',
  pdfUnlockCta: 'Unlock PDF with Pro',
  pdfDocumentTitle: 'Dermis skin report',
  pdfGenerated: (date: string) => `Generated ${date}`,
  pdfExportOk: 'Report ready — use the share sheet to save or send.',
  pdfExportFail: 'Could not create the PDF. Try again.',
  pdfExportUnavailable: 'Sharing is not available on this device.',
  freePreviewHint: 'Free includes your index and one priority concern. Unlock Pro for the rest.',
  zoneBlurbs: {
    forehead: 'Often first to show dryness or stress lines. Soft cleanser and daily SPF help.',
    tZone: 'Highest oil activity here. Pores look larger; mild redness at the sides of the nose.',
    leftCheek: 'Tone and texture often show here first. Even light helps you compare fairly.',
    rightCheek: 'Tone and texture often show here first. Even light helps you compare fairly.',
    periorbital: 'The eye area looks thinner. Hydration and sunscreen support a softer look.',
    chin: 'Chin can feel reactive to products. Keep routines simple and note what stings.',
  },
  concernBlurbs: {
    redness: 'Mild warmth on the sides of the nose; within a typical range for this selfie.',
    fineLines: 'Soft lines near the eyes, light depth. Looking steady vs your last scan.',
    hydration: 'Cheeks hold moisture better; the plump look is trending up.',
    darkSpots: 'Post-blemish marks on the left cheek look softer over time.',
    texture: 'Surface feel looks smoother since retinol nights started.',
    pores: 'Pores look larger in the T-zone; oil balance is the main focus here.',
  },
  notes: {
    redness: {
      headline: 'Ease visible redness with calmer habits.',
      body: 'Cool water, a gentle cleanser, and skipping harsh scrubs help. Note heat or new products as triggers.',
    },
    fineLines: {
      headline: 'Support fine lines with SPF and moisture.',
      body: 'Daily sunscreen, steady hydration, and consistent photos help you track calm changes.',
    },
    hydration: {
      headline: 'Boost the plump look with simple moisture.',
      body: 'Drink water, use a simple moisturizer, and avoid over-washing for a softer feel.',
    },
    darkSpots: {
      headline: 'Even tone takes patience and daily SPF.',
      body: 'Sunscreen and gentle care matter most — marks soften slowly with steady habits.',
    },
    texture: {
      headline:
        'Texture rose since retinol nights started. That is the clearest win in this report.',
      body: 'Keep retinol on Mon/Wed/Fri. Adding a fourth night now may feel too strong.',
    },
    pores: {
      headline: 'Pore look calms with balance, not scrubbing.',
      body: 'Cleanse gently, keep oil balanced, and shoot selfies in the same soft light each time.',
    },
  },
} as const;
