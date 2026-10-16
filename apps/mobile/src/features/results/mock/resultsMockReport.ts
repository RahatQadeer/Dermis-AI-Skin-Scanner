import type { ZoneId } from '@dermis/domain';
import type { Plan } from '@dermis/domain/server';

import type { HomeScanSnapshot } from '@/src/features/home/mock/homeMockScenarios';
import { useHomeMockSnapshot } from '@/src/features/home/mock/useHomeMockSnapshot';

export type ResultsReport = {
  plan: Plan;
  scan: HomeScanSnapshot;
  zoneScores: Record<ZoneId, number>;
};

/** Prototype zone scores (matches Report mock). */
const DEMO_ZONES: Record<ZoneId, number> = {
  forehead: 66,
  leftCheek: 77,
  tZone: 58,
  periorbital: 71,
  rightCheek: 74,
  chin: 63,
};

const FALLBACK_SCAN: HomeScanSnapshot = {
  indexScore: 70,
  concernScores: {
    redness: 81,
    fineLines: 77,
    hydration: 72,
    darkSpots: 69,
    texture: 64,
    pores: 58,
  },
  priorities: ['texture', 'pores'],
};

/** Uses home mock scan when present; otherwise demo scores (post-Analysing path). */
export function useResultsMockReport(): ResultsReport {
  const snapshot = useHomeMockSnapshot();
  return {
    plan: snapshot.quota.plan,
    scan: snapshot.scan ?? FALLBACK_SCAN,
    zoneScores: DEMO_ZONES,
  };
}
