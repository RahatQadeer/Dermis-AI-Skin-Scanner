import { CONCERN_IDS, type ConcernId } from '@dermis/domain';

import type { ScanDto } from '@/src/features/scan/api/scanApi';
import { indexDeltaSincePrevious } from '@/src/features/scan/lib/indexDelta';

import type { HomeScanSnapshot } from '../mock/homeMockScenarios';

/** Map a real scan DTO into the Home hero snapshot (no mock scores). */
export function scanDtoToHomeScan(
  scan: ScanDto,
  previous: ScanDto | null | undefined,
): HomeScanSnapshot {
  const concernScores = CONCERN_IDS.reduce(
    (acc, id) => {
      acc[id] = scan.concerns[id];
      return acc;
    },
    {} as Record<ConcernId, number>,
  );
  const priorities = [...CONCERN_IDS]
    .sort((a, b) => concernScores[a] - concernScores[b])
    .slice(0, 3);
  const indexDelta = previous != null ? indexDeltaSincePrevious(scan, previous) : undefined;
  return {
    indexScore: scan.indexScore,
    indexDelta,
    takenAt: scan.takenAt,
    concernScores,
    priorities,
  };
}
