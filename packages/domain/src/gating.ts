import { isUnlockAllFeatures } from './featureUnlock';
import type { Plan } from './quota';

/** Report / feature elements gated for free users. */
export type GatedElement =
  | 'overallIndex'
  | 'priorityConcern'
  | 'otherConcerns'
  | 'zoneMap'
  | 'skinAge'
  | 'routine'
  | 'progressAnalytics'
  | 'pdfExport';

const FREE_UNLOCKED: ReadonlySet<GatedElement> = new Set(['overallIndex', 'priorityConcern']);

/**
 * Free tier sees overall index + one priority concern; everything else locked.
 * Server/product rules — UI should mirror API flags, not invent unlocks.
 * Local testing: `DERMIS_FORCE_PRO` / `EXPO_PUBLIC_UNLOCK_ALL_FEATURES` unlocks all.
 */
export function isElementUnlocked(plan: Plan, element: GatedElement): boolean {
  if (isUnlockAllFeatures() || plan === 'pro') {
    return true;
  }
  return FREE_UNLOCKED.has(element);
}

/** Effective plan for UI/quota when local unlock-all is on. */
export function resolveEffectivePlan(plan: Plan): Plan {
  return isUnlockAllFeatures() ? 'pro' : plan;
}
