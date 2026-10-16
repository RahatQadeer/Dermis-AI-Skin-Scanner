import { SCORE_BAND } from './constants';

/** Semantic score band for UI tokens (map to theme colours in the app). */
export type ScoreColorToken = 'green' | 'sky' | 'amber';

/**
 * Display helper: ≥75 green · 60–74 sky · &lt;60 amber.
 * Safe for the mobile app.
 */
export function scoreColor(score: number): ScoreColorToken {
  if (!Number.isFinite(score)) {
    return 'amber';
  }
  if (score >= SCORE_BAND.highMin) {
    return 'green';
  }
  if (score >= SCORE_BAND.midMin) {
    return 'sky';
  }
  return 'amber';
}
