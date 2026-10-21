import { resolveEffectivePlan } from '@dermis/domain';

import { fetchRoutine } from '@/src/features/routine/api/routineApi';
import { listScans } from '@/src/features/scan/api/scanApi';
import type { ScanDto } from '@/src/features/scan/api/scanApi';

import { fetchQuota } from '../api/quotaApi';
import { scanDtoToHomeScan } from '../lib/scanDtoToHomeScan';
import type {
  HomeRoutineProgress,
  HomeScanSnapshot,
  HomeSnapshot,
} from '../mock/homeMockScenarios';

export const EMPTY_ROUTINE: HomeRoutineProgress = {
  amDone: 0,
  amTotal: 0,
  pmDone: 0,
  pmTotal: 0,
};

export const EMPTY_QUOTA: HomeSnapshot['quota'] = {
  plan: 'free',
  lifetimeScanCount: 0,
  dailyScanCount: 0,
};

export async function loadLiveHomeSnapshot(lastScan: ScanDto | null): Promise<{
  quota: HomeSnapshot['quota'];
  scan: HomeScanSnapshot | null;
  routine: HomeRoutineProgress;
}> {
  // Load independently — a quota blip must not hide the user's scan history.
  const [quotaSettled, scansSettled, routineSettled] = await Promise.allSettled([
    fetchQuota(),
    listScans(),
    fetchRoutine(),
  ]);

  const scans = scansSettled.status === 'fulfilled' ? scansSettled.value : [];
  const newest =
    lastScan && !scans.some((s) => s.id === lastScan.id) ? [lastScan, ...scans] : scans;
  const current = newest[0] ?? null;
  const previous = newest[1] ?? null;
  const scan = current ? scanDtoToHomeScan(current, previous) : null;

  const quota = resolveHomeQuota(quotaSettled, newest.length);
  const routine = resolveHomeRoutine(routineSettled);

  return { quota, scan, routine };
}

function resolveHomeQuota(
  settled: PromiseSettledResult<Awaited<ReturnType<typeof fetchQuota>>>,
  scanCountFallback: number,
): HomeSnapshot['quota'] {
  if (settled.status === 'fulfilled') {
    return {
      plan: resolveEffectivePlan(settled.value.plan),
      lifetimeScanCount: Math.max(settled.value.lifetimeScanCount, scanCountFallback),
      dailyScanCount: settled.value.dailyScanCount,
    };
  }
  return {
    ...EMPTY_QUOTA,
    lifetimeScanCount: scanCountFallback,
  };
}

function resolveHomeRoutine(
  settled: PromiseSettledResult<Awaited<ReturnType<typeof fetchRoutine>>>,
): HomeRoutineProgress {
  if (settled.status !== 'fulfilled' || !settled.value) {
    return EMPTY_ROUTINE;
  }
  const am = settled.value.state.am;
  const pm = settled.value.state.pm;
  return {
    amDone: am.filter((s) => s.done).length,
    amTotal: am.length,
    pmDone: pm.filter((s) => s.done).length,
    pmTotal: pm.length,
  };
}
