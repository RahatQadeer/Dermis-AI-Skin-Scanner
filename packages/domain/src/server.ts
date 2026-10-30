/**
 * Server-side domain API — index, quota, gating, password rules.
 * Import from here in backend services only.
 */
export * from './index';
export { calculateIndex, DomainError } from './calculateIndex';
export { canConsumeScan, remainingScans } from './quota';
export { resolveFreePreviewConcernId } from './freePreviewConcern';
export { DEFAULT_WEIGHT, MAX_PRIORITIES, PRIORITY_WEIGHT, SCORE_MAX, SCORE_MIN } from './constants';
export { isProductionRuntime } from './readProcessEnv';
