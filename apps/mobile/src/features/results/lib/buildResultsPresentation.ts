import { ZONE_IDS, type ConcernId, type ZoneId } from '@dermis/domain';

import { getCopy } from '@/src/copy';
import type { ScanDto } from '@/src/features/scan/api/scanApi';

import {
  concernDeltaLabels,
  estimateSkinAge,
  formatPriorWhen,
  formatReportWhen,
  formatScanWhen,
} from './resultsDisplay';
import type { ResultsReport } from '../mock/resultsMockReport';

/** Prototype concern deltas when no prior scan (matches mock report visuals). */
const MOCK_CONCERN_DELTAS: Partial<Record<ConcernId, string>> = {
  redness: '+3',
  fineLines: '+1',
  hydration: '+6',
  darkSpots: '+2',
  texture: '+7',
  pores: '+3',
};

export function pickDefaultZone(zoneScores: Record<ZoneId, number>): ZoneId {
  let best: ZoneId = 'tZone';
  let bestScore = Number.POSITIVE_INFINITY;
  for (const id of ZONE_IDS) {
    const score = zoneScores[id];
    if (score < bestScore) {
      bestScore = score;
      best = id;
    }
  }
  return best;
}

export function buildResultsPresentation(
  report: ResultsReport | null,
  previous: ScanDto | null,
  currentScan: ScanDto | null,
): {
  reportWhen: string;
  deltaLabel: string | undefined;
  skinAgeLabel: string | undefined;
  insight: string;
  concernDeltas: Partial<Record<ConcernId, string>> | undefined;
} {
  const r = getCopy().screens.results;
  const reportWhen = currentScan?.takenAt
    ? formatScanWhen(currentScan.takenAt)
    : formatReportWhen();

  if (!report) {
    return {
      reportWhen,
      deltaLabel: undefined,
      skinAgeLabel: undefined,
      insight: r.indexInsight,
      concernDeltas: undefined,
    };
  }

  const usePrototypeExtras = Boolean(report && !currentScan);
  const indexDelta =
    previous && report ? report.scan.indexScore - previous.indexScore : null;
  const priorWhen = previous ? formatPriorWhen(previous.takenAt) : null;

  return {
    reportWhen,
    deltaLabel: buildDeltaLabel(indexDelta, priorWhen, usePrototypeExtras, r),
    skinAgeLabel: r.skinAgeEstimate(
      estimateSkinAge(report.scan.indexScore, report.scan.concernScores),
    ),
    insight: buildIndexInsight(indexDelta, priorWhen, usePrototypeExtras, r),
    concernDeltas: buildConcernDeltas(report, previous, usePrototypeExtras),
  };
}

function buildDeltaLabel(
  indexDelta: number | null,
  priorWhen: string | null,
  usePrototypeExtras: boolean,
  r: ReturnType<typeof getCopy>['screens']['results'],
): string | undefined {
  if (indexDelta != null && priorWhen) {
    return r.deltaVs(indexDelta, priorWhen);
  }
  if (usePrototypeExtras) {
    return r.deltaVs(4, '21 Sept');
  }
  return undefined;
}

function buildIndexInsight(
  indexDelta: number | null,
  priorWhen: string | null,
  usePrototypeExtras: boolean,
  r: ReturnType<typeof getCopy>['screens']['results'],
): string {
  if (indexDelta != null && priorWhen) {
    return r.indexInsightDelta(indexDelta, priorWhen);
  }
  if (usePrototypeExtras) {
    return r.indexInsightDelta(4, '21 Sept');
  }
  return r.indexInsight;
}

function buildConcernDeltas(
  report: ResultsReport,
  previous: ScanDto | null,
  usePrototypeExtras: boolean,
): Partial<Record<ConcernId, string>> | undefined {
  if (previous) {
    return concernDeltaLabels(report.scan.concernScores, previous.concerns);
  }
  if (usePrototypeExtras) {
    return MOCK_CONCERN_DELTAS;
  }
  return undefined;
}
