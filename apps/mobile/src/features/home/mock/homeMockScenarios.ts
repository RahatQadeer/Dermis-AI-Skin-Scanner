import type { ConcernId } from '@dermis/domain';
import type { QuotaState } from '@dermis/domain/server';

export type HomeScanSnapshot = {
  indexScore: number;
  /** Change since the previous scan (points). Optional for report-derived snapshots. */
  indexDelta?: number;
  /** ISO timestamp of the scan (`takenAt`) for relative “Last scan …” copy. */
  takenAt?: string;
  concernScores: Record<ConcernId, number>;
  priorities: ConcernId[];
};

export type HomeRoutineProgress = {
  amDone: number;
  amTotal: number;
  pmDone: number;
  pmTotal: number;
};

export type HomeSnapshot = {
  displayName: string;
  quota: QuotaState;
  scan: HomeScanSnapshot | null;
  routine: HomeRoutineProgress;
};

const DEMO_SCORES: Record<ConcernId, number> = {
  redness: 74,
  fineLines: 68,
  hydration: 72,
  darkSpots: 65,
  texture: 70,
  pores: 67,
};

export const HOME_MOCK_SCENARIOS = {
  freeBaseline: {
    displayName: 'Maya',
    quota: { plan: 'free', lifetimeScanCount: 0, dailyScanCount: 0 },
    scan: {
      indexScore: 70,
      indexDelta: 4,
      concernScores: DEMO_SCORES,
      priorities: ['hydration', 'texture', 'darkSpots'],
    },
    routine: { amDone: 2, amTotal: 3, pmDone: 0, pmTotal: 3 },
  },
  freeReady: {
    displayName: 'Maya',
    quota: { plan: 'free', lifetimeScanCount: 0, dailyScanCount: 0 },
    scan: null,
    routine: { amDone: 0, amTotal: 3, pmDone: 0, pmTotal: 3 },
  },
  freeLimit: {
    displayName: 'Maya',
    quota: { plan: 'free', lifetimeScanCount: 1, dailyScanCount: 0 },
    scan: {
      indexScore: 70,
      indexDelta: 4,
      concernScores: DEMO_SCORES,
      priorities: ['hydration', 'texture'],
    },
    routine: { amDone: 2, amTotal: 3, pmDone: 1, pmTotal: 3 },
  },
  proActive: {
    displayName: 'Jordan',
    quota: { plan: 'pro', lifetimeScanCount: 12, dailyScanCount: 2 },
    scan: {
      indexScore: 72,
      indexDelta: 3,
      concernScores: DEMO_SCORES,
      priorities: ['redness'],
    },
    routine: { amDone: 3, amTotal: 3, pmDone: 2, pmTotal: 3 },
  },
  proLimit: {
    displayName: 'Jordan',
    quota: { plan: 'pro', lifetimeScanCount: 40, dailyScanCount: 5 },
    scan: {
      indexScore: 72,
      indexDelta: 3,
      concernScores: DEMO_SCORES,
      priorities: ['redness'],
    },
    routine: { amDone: 3, amTotal: 3, pmDone: 3, pmTotal: 3 },
  },
} as const satisfies Record<string, HomeSnapshot>;

export type HomeMockScenarioId = keyof typeof HOME_MOCK_SCENARIOS;

const SCENARIO_IDS = Object.keys(HOME_MOCK_SCENARIOS) as HomeMockScenarioId[];

export function isHomeMockScenarioId(value: string): value is HomeMockScenarioId {
  return (SCENARIO_IDS as readonly string[]).includes(value);
}

export function resolveHomeMockScenarioId(): HomeMockScenarioId {
  const raw = process.env.EXPO_PUBLIC_MOCK_HOME_SCENARIO ?? '';
  if (isHomeMockScenarioId(raw)) {
    return raw;
  }
  return 'freeBaseline';
}
