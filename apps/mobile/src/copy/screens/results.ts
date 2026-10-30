export const resultsCopy = {
  title: 'Your report',
  reportTitle: (when: string) => `Report · ${when}`,
  shareCta: 'Share',
  indexTitle: 'SKIN HEALTH INDEX',
  indexCaption: 'Wellness estimate from this photo — not a diagnosis',
  indexInsight: 'A calm baseline from this selfie — track habits over time.',
  indexInsightDelta: (delta: number, when: string) =>
    delta >= 0
      ? `Up ${String(delta)} since ${when}. See which concerns moved below.`
      : `Down ${String(Math.abs(delta))} since ${when}. Lighting changes scores too — scan in the same soft light to compare fairly.`,
  deltaVs: (delta: number, when: string) => `${delta >= 0 ? '+' : ''}${String(delta)} vs ${when}`,
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
  // Describe what each zone/concern score reflects — never claim to have seen
  // something specific on this user's face (the same text shows for everyone).
  zoneBlurbs: {
    forehead: 'Often first to show dryness or stress lines. Soft cleanser and daily SPF help.',
    tZone: 'Usually the oiliest area, so pores and shine tend to show here first.',
    leftCheek: 'Tone and texture often show here first. Even light helps you compare fairly.',
    rightCheek: 'Tone and texture often show here first. Even light helps you compare fairly.',
    periorbital: 'The eye area looks thinner. Hydration and sunscreen support a softer look.',
    chin: 'Chin can feel reactive to products. Keep routines simple and note what stings.',
  },
  concernBlurbs: {
    redness: 'How even and calm skin tone looks, especially around the nose and cheeks.',
    fineLines: 'How visible fine lines look, mostly around the eyes and forehead.',
    hydration: 'How plump and smooth skin looks — a visual cue, not a moisture reading.',
    darkSpots: 'How even pigmentation looks, including marks left after blemishes.',
    texture: 'How smooth the skin surface looks in this photo.',
    pores: 'How visible pores look, usually most noticeable on the T-zone.',
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
      headline: 'Smooth the look of texture with gentle consistency.',
      body: 'Gentle exfoliation a few nights a week and daily moisturizer help. Ask a pharmacist or dermatologist before starting strong actives like retinoids.',
    },
    pores: {
      headline: 'Pore look calms with balance, not scrubbing.',
      body: 'Cleanse gently, keep oil balanced, and shoot selfies in the same soft light each time.',
    },
  },
} as const;
