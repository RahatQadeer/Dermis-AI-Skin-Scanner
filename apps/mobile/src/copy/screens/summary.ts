import { commonCopy } from '../common';

/** Profile summary after quiz — copy matches prototype SUMMARY (DERM-023). */
export const summaryCopy = {
  eyebrow: 'Profile ready',
  headline: 'Dermis knows your skin now.',
  rowSkinType: 'Skin type',
  rowTone: 'Fitzpatrick',
  rowConcerns: 'Priorities',
  rowSensitivity: 'Sensitivity',
  rowAgeBand: 'Age range',
  concernsSeparator: ', ',
  ctaScan: 'Take my free scan',
  ctaArrow: '→',
  skipHome: commonCopy.skipForNow,
  sensitivityNotes: {
    rarely: 'Standard-strength actives are unlocked. We will still ramp retinol over four weeks.',
    sometimes:
      'Actives will be introduced one at a time, alternating nights, so any reaction can be traced.',
    easily:
      'Retinoids and acids will start at the lowest strength, twice weekly, with a patch-test reminder.',
  },
} as const;

export type SummarySensitivityKey = keyof typeof summaryCopy.sensitivityNotes;
