import { isFeaturesUnlocked } from './featureUnlock';
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
  | 'pdfExport'
  | 'aiAssistant';

const FREE_UNLOCKED: ReadonlySet<GatedElement> = new Set(['overallIndex', 'priorityConcern']);

/**
 * Free tier sees overall index + one priority concern; everything else locked.
 * Server/product rules — UI should mirror API flags, not invent unlocks.
 * Open billing / unlock-all treats every element as unlocked.
 */
export function isElementUnlocked(plan: Plan, element: GatedElement): boolean {
  if (isFeaturesUnlocked() || plan === 'pro') {
    return true;
  }
  return FREE_UNLOCKED.has(element);
}

/** Effective plan for UI/quota when open billing or unlock-all is on. */
export function resolveEffectivePlan(plan: Plan): Plan {
  return isFeaturesUnlocked() ? 'pro' : plan;
}
