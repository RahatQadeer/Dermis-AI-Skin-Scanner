import { readProcessEnv } from './readProcessEnv';

/** Product limits — authoritative values for server enforcement. */
export const FORMULA_VERSION = 'index-v1' as const;

export const PRIORITY_WEIGHT = 1.5;
export const DEFAULT_WEIGHT = 1.0;
export const MAX_PRIORITIES = 3;

/** Product default (store). Local override: `DERMIS_FREE_LIFETIME_SCANS` via `resolveFreeLifetimeScans()`. */
export const FREE_LIFETIME_SCANS = 1;
export const PRO_DAILY_SCANS = 5;

export const SCORE_MIN = 0;
export const SCORE_MAX = 100;

export const SCORE_BAND = {
  highMin: 75,
  midMin: 60,
} as const;

/** Server/local testing: raise free scans without changing the product constant. */
export function resolveFreeLifetimeScans(): number {
  const raw = readProcessEnv('DERMIS_FREE_LIFETIME_SCANS');
  if (!raw) {
    return FREE_LIFETIME_SCANS;
  }
  const n = Number(raw);
  return Number.isFinite(n) && n >= 1 ? Math.floor(n) : FREE_LIFETIME_SCANS;
}
