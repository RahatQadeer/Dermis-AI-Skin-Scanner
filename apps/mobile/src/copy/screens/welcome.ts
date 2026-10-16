import { commonCopy } from '../common';
import { complianceCopy } from '../compliance';

/**
 * Welcome screen — layout matches prototype v0.2; stat titles stay D4-compliant
 * (no on-device / clinical scoring claims).
 */
export const welcomeCopy = {
  headlineKnow: 'Know',
  headlineMid: ' your skin, ',
  /** Line 1 ends after “one”; line 2 is the rest (pink). */
  headlineAccentLead: 'one',
  headlineAccentRest: 'scan at a time.',
  subcopy:
    'Take a selfie and Dermis scores six concerns from 0 to 100, then tracks how they change.',
  cta: 'Get my skin profile',
  ctaArrow: '→',
  /** Short titles so cards match prototype one-line rhythm; D4-safe (no on-device / clinical). */
  stats: [
    { title: '60s', subtitle: 'per scan' },
    { title: 'Private', subtitle: 'secure upload' },
    { title: 'Derm-built', subtitle: 'wellness insights' },
  ],
  chipHydrationScore: '72',
  chipHydrationLabel: 'Hydration',
  chipPoresScore: '58',
  chipPoresLabel: 'Pores',
  portraitA11y: 'Example selfie with sample skin scores',
  footnote: complianceCopy.notMedicalDeviceFootnote,
  logInPill: commonCopy.logIn,
} as const;
