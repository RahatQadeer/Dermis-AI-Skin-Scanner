import type { ScanDto } from '@/src/features/scan/api/scanApi';

import { scanDtoToHomeScan } from '../lib/scanDtoToHomeScan';
import type {
  HomeRoutineProgress,
  HomeScanSnapshot,
  HomeSnapshot,
} from '../mock/homeMockScenarios';
import { EMPTY_QUOTA, EMPTY_ROUTINE, loadLiveHomeSnapshot } from './loadHomeSnapshot';

export async function refreshHomeSnapshot(
  lastScan: ScanDto | null,
  knownPlan: HomeSnapshot['quota']['plan'] | null,
): Promise<{
  quota: HomeSnapshot['quota'];
  scan: HomeScanSnapshot | null;
  routine: HomeRoutineProgress;
}> {
  return loadLiveHomeSnapshot(lastScan, knownPlan);
}

export function applyGuestHomeSnapshot(
  lastScan: ScanDto | null,
  setters: {
    setQuota: (q: HomeSnapshot['quota']) => void;
    setScan: (s: HomeScanSnapshot | null) => void;
    setRoutine: (r: HomeRoutineProgress) => void;
    setLoading: (v: boolean) => void;
  },
  readyRef: { current: boolean },
): void {
  setters.setQuota(EMPTY_QUOTA);
  setters.setScan(lastScan ? scanDtoToHomeScan(lastScan, null) : null);
  setters.setRoutine(EMPTY_ROUTINE);
  setters.setLoading(false);
  readyRef.current = true;
}
