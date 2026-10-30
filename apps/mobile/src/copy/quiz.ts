import { colors } from '../theme/colors';

/**
 * Quiz steps 1–4 — copy matches prototype (DERM-022 visual).
 * Structure locked in PRODUCT.md; D4-safe (no clinical / on-device claims).
 */
export const quizCopy = {
  screenTitle: 'Skin profile quiz',
  stepLabel: (current: number, total: number) => `${current}/${total}`,
  stepProgressA11y: (current: number, total: number) => `Step ${current} of ${total}`,
  backA11y: 'Go back',
  continueArrow: '→',
  saveError: 'Could not save your skin profile. Check your connection and try again.',
  q1: {
    eyebrow: 'Question 1',
    intro: "Let's start with how your skin behaves.",
    title: 'How does your skin feel by midday?',
    sub: 'Sets the sebum baseline for pore and texture scoring.',
    hint: 'Unsure? Pick what happens most days.',
    options: [
      {
        label: 'Oily',
        sub: 'Shine across the whole face',
        reaction: "Shine happens. I'll keep pores in focus.",
      },
      {
        label: 'Combination',
        sub: 'Shiny T-zone, normal or dry cheeks',
        reaction: "The most common type. I'll watch your T-zone.",
      },
      {
        label: 'Dry',
        sub: 'Tight, flaky, or dull',
        reaction: 'Noted. Hydration gets extra weight.',
      },
      {
        label: 'Normal',
        sub: 'Comfortable, little shine',
        reaction: "Lucky you! Let's keep it that way.",
      },
    ] as const,
  },
  q2: {
    eyebrow: 'Question 2',
    intro: 'This helps me read colour accurately.',
    title: 'Which best matches your skin tone?',
    sub: 'Fitzpatrick scale. Calibrates redness and pigmentation detection.',
    hint: 'Used only to tune the camera model.',
    options: [
      {
        label: 'Type I–II',
        sub: 'Very fair to fair, burns easily',
        swatch: colors.fitzpatrickFair,
        reaction: "Got it. I'll be extra careful with redness.",
      },
      {
        label: 'Type III',
        sub: 'Light to medium, sometimes burns',
        swatch: colors.fitzpatrickLight,
        reaction: 'Thanks, calibrating tone detection.',
      },
      {
        label: 'Type IV',
        sub: 'Olive to medium brown, rarely burns',
        swatch: colors.fitzpatrickOlive,
        reaction: 'Thanks, calibrating pigment detection.',
      },
      {
        label: 'Type V–VI',
        sub: 'Brown to deeply pigmented',
        swatch: colors.fitzpatrickDeep,
        reaction: 'Thanks. Dark-spot detection tuned for deeper tones.',
      },
    ] as const,
  },
  q3: {
    eyebrow: 'Question 3',
    intro: "Pick up to three. I'll focus on these.",
    title: 'What would you like to improve?',
    sub: 'These are weighted higher in your index.',
    hint: 'You can change priorities later in Profile.',
    /** Prototype display order — maps to ConcernId. */
    options: [
      { id: 'pores' as const, label: 'Pores', sub: 'Visible or enlarged pores' },
      { id: 'texture' as const, label: 'Texture', sub: 'Roughness, bumps, unevenness' },
      { id: 'darkSpots' as const, label: 'Dark spots', sub: 'Marks, melasma, sun spots' },
      { id: 'redness' as const, label: 'Redness', sub: 'Flushing, irritation' },
      { id: 'fineLines' as const, label: 'Fine lines', sub: 'Early wrinkles' },
      { id: 'hydration' as const, label: 'Hydration', sub: 'Dryness, dullness' },
    ] as const,
  },
  q4: {
    eyebrow: 'Question 4',
    intro: 'Almost done — this keeps your routine safe.',
    title: 'How does your skin react to new products?',
    sub: 'Determines which actives we can recommend and at what strength.',
    hint: 'Retinoids and acids are gated on this answer.',
    options: [
      {
        label: 'Rarely reacts',
        sub: 'Tolerates most actives',
        reaction: 'Great, all actives unlocked.',
      },
      {
        label: 'Sometimes stings',
        sub: 'Mild redness that settles',
        reaction: "We'll go one product at a time.",
      },
      {
        label: 'Reacts easily',
        sub: 'Redness, itching, or breakouts',
        reaction: 'Gentle mode on. Lowest strengths first.',
      },
    ] as const,
  },
  q5: {
    eyebrow: 'Question 5',
    intro: 'Last one! Helps personalize recommendations.',
    title: 'Which age range are you in?',
    sub: 'Used only to tune wellness suggestions. Never shared.',
    hint: 'You can update this later in Profile.',
    options: [
      {
        id: '18_24' as const,
        label: '18–24',
        sub: 'Young adult skin',
        reaction: 'Got it — tuning for your age range.',
      },
      {
        id: '25_34' as const,
        label: '25–34',
        sub: 'Early adult skin',
        reaction: 'Got it — tuning for your age range.',
      },
      {
        id: '35_44' as const,
        label: '35–44',
        sub: 'Mature adult skin',
        reaction: 'Got it — tuning for your age range.',
      },
      {
        id: '45_plus' as const,
        label: '45+',
        sub: 'Experienced skin',
        reaction: 'Got it — tuning for your age range.',
      },
    ] as const,
  },
} as const;
