/**
 * App-safe exports: types, schemas, display helpers.
 * Do not import `@dermis/domain/server` for enforcement in the mobile app.
 */
export { CONCERN_IDS, type ConcernId, isConcernId } from './concerns';
export { ZONE_IDS, type ZoneId, isZoneId } from './zones';
export {
  FORMULA_VERSION,
  FREE_LIFETIME_SCANS,
  PRO_DAILY_SCANS,
  SCORE_BAND,
  resolveFreeLifetimeScans,
} from './constants';
export { isUnlockAllFeatures } from './featureUnlock';
export { isElementUnlocked, resolveEffectivePlan, type GatedElement } from './gating';
export { scoreColor, type ScoreColorToken } from './scoreColor';
export { deltaColor, type DeltaColorToken } from './deltaColor';
export type { Plan, QuotaState, QuotaDecision } from './quota';
export type { IndexResult } from './calculateIndex';
export { weightedIndex } from './weightedIndex';
export type { PasswordCheck, PasswordStrength, PasswordStrengthLabel } from './passwordStrength';
export { PASSWORD_MIN_LENGTH, passwordStrength, isPasswordAcceptable } from './passwordStrength';
export * from './schemas/index';
