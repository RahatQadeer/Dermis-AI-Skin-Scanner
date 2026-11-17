import { ZONE_IDS, type ConcernId, type ZoneId } from '@dermis/domain';
import { resolveEffectivePlan, type Plan } from '@dermis/domain/server';

import { useHomeSnapshot } from '@/src/features/home/hooks/useHomeSnapshot';
import type { ScanDto } from '@/src/features/scan/api/scanApi';
import { useScanCapture } from '@/src/features/scan/context/ScanCaptureContext';
import { useSession } from '@/src/features/session/SessionContext';

import { pickPreviousScan } from '../lib/resultsDisplay';
import type { ResultsReport } from '../mock/resultsMockReport';
import { useResultsMockReport } from '../mock/resultsMockReport';
import { useResultsScanHistory } from './useResultsScanHistory';

export type ResultsReportState = {
  report: ResultsReport | null;
  previous: ScanDto | null;
  currentScan: ScanDto | null;
  loading: boolean;
};

type HomeSnapshotState = ReturnType<typeof useHomeSnapshot>;

const EMPTY_REPORT_STATE: ResultsReportState = {
  report: null,
  previous: null,
  currentScan: null,
  loading: false,
};

/** No scan from capture/history: fall back to Home snapshot, then mock (offline demo only). */
function resolveWithoutScan(
  snapshot: HomeSnapshotState,
  liveSession: boolean,
  mock: ResultsReport,
): ResultsReportState {
  // Fall back to the Home snapshot so "View report" still opens when history is slow.
  if (snapshot.scan) {
    return {
      ...EMPTY_REPORT_STATE,
      report: {
        plan: resolveEffectivePlan(snapshot.quota.plan as Plan),
        scan: {
          indexScore: snapshot.scan.indexScore,
          concernScores: snapshot.scan.concernScores,
          priorities: snapshot.scan.priorities,
        },
        zoneScores: emptyZoneScores(),
      },
    };
  }
  if (liveSession) {
    return EMPTY_REPORT_STATE;
  }
  return { ...EMPTY_REPORT_STATE, report: mock };
}

function buildScanReport(
  currentScan: ScanDto,
  history: ScanDto[],
  snapshot: HomeSnapshotState,
): ResultsReportState {
  return {
    loading: false,
    currentScan,
    previous: pickPreviousScan(history, currentScan.id),
    report: {
      plan: resolveEffectivePlan(snapshot.quota.plan as Plan),
      scan: {
        indexScore: currentScan.indexScore,
        concernScores: currentScan.concerns as Record<ConcernId, number>,
        priorities: snapshot.scan?.priorities ?? [],
      },
      zoneScores: currentScan.zones as Record<ZoneId, number>,
    },
  };
}

export function useResultsReport(): ResultsReportState {
  const mock = useResultsMockReport();
  const { lastScan } = useScanCapture();
  const snapshot = useHomeSnapshot();
  const session = useSession();
  const liveSession = session.apiEnabled && Boolean(session.accessToken);
  const { history, loading: historyLoading } = useResultsScanHistory(
    liveSession,
    session.accessToken,
    lastScan?.id,
    session.userId,
  );

  const currentScan = lastScan ?? history[0] ?? null;

  // Home already shows a scan — never leave View report on an empty state while loading.
  if (!currentScan && liveSession && historyLoading) {
    return { ...EMPTY_REPORT_STATE, loading: true };
  }
  if (!currentScan) {
    return resolveWithoutScan(snapshot, liveSession, mock);
  }
  return buildScanReport(currentScan, history, snapshot);
}

function emptyZoneScores(): Record<ZoneId, number> {
  return Object.fromEntries(ZONE_IDS.map((id) => [id, 0])) as Record<ZoneId, number>;
}
