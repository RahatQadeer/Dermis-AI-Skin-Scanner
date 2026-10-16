import type { ConcernId, ZoneId } from '@dermis/domain';
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
  );

  const currentScan = lastScan ?? history[0] ?? null;

  if (!currentScan) {
    if (liveSession) {
      return { report: null, previous: null, currentScan: null, loading: historyLoading };
    }
    return { report: mock, previous: null, currentScan: null, loading: false };
  }

  const previous = pickPreviousScan(history, currentScan.id);
  const zoneScores = currentScan.zones as Record<ZoneId, number>;
  const concernScores = currentScan.concerns as Record<ConcernId, number>;

  return {
    loading: false,
    currentScan,
    previous,
    report: {
      plan: resolveEffectivePlan(snapshot.quota.plan as Plan),
      scan: {
        indexScore: currentScan.indexScore,
        concernScores,
        priorities: snapshot.scan?.priorities ?? [],
      },
      zoneScores,
    },
  };
}
