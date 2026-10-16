import { resolveEffectivePlan } from '@dermis/domain';

import { fetchRoutine } from '@/src/features/routine/api/routineApi';
import { listScans } from '@/src/features/scan/api/scanApi';
import type { ScanDto } from '@/src/features/scan/api/scanApi';

import { fetchQuota } from '../api/quotaApi';
import { scanDtoToHomeScan } from '../lib/scanDtoToHomeScan';
import type { HomeRoutineProgress, HomeScanSnapshot, HomeSnapshot } from '../mock/homeMockScenarios';

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
  const [quotaRes, scans, routineRes] = await Promise.all([
    fetchQuota(),
    listScans(),
    fetchRoutine().catch(() => null),
  ]);
  const quota = {
    plan: resolveEffectivePlan(quotaRes.plan),
    lifetimeScanCount: quotaRes.lifetimeScanCount,
    dailyScanCount: quotaRes.dailyScanCount,
  };
  const newest =
    lastScan && !scans.some((s) => s.id === lastScan.id) ? [lastScan, ...scans] : scans;
  const current = newest[0] ?? null;
  const previous = newest[1] ?? null;
  const scan = current ? scanDtoToHomeScan(current, previous) : null;
  if (!routineRes) {
    return { quota, scan, routine: EMPTY_ROUTINE };
  }
  const am = routineRes.state.am;
  const pm = routineRes.state.pm;
  return {
    quota,
    scan,
    routine: {
      amDone: am.filter((s) => s.done).length,
      amTotal: am.length,
      pmDone: pm.filter((s) => s.done).length,
      pmTotal: pm.length,
    },
  };
}
