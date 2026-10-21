import type { ConcernId } from '@dermis/domain';

import { formatShortDate } from '@/src/features/progress/lib/formatShortDate';
import type { ScanDto } from '@/src/features/scan/api/scanApi';

type AgeConcernScores = Partial<
  Pick<Record<ConcernId, number>, 'fineLines' | 'texture' | 'darkSpots'>
>;

/**
 * Fun wellness estimate only — not a medical age (PRODUCT.md).
 * Uses index + age-linked concerns so score changes move the estimate.
 */
export function estimateSkinAge(indexScore: number, concerns?: AgeConcernScores): number {
  const lines = concerns?.fineLines ?? indexScore;
  const texture = concerns?.texture ?? indexScore;
  const spots = concerns?.darkSpots ?? indexScore;
  const youth = lines * 0.45 + texture * 0.25 + spots * 0.15 + indexScore * 0.15;
  const age = Math.round(56 - youth * 0.38);
  return Math.min(55, Math.max(18, age));
}

export function formatReportWhen(date = new Date()): string {
  const day = date.getDate();
  const month = date.toLocaleString('en-GB', { month: 'short' });
  const monthLabel = month === 'Sep' ? 'Sept' : month;
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${String(day)} ${monthLabel}, ${hours}:${minutes}`;
}

export function formatScanWhen(takenAt: string): string {
  const date = new Date(takenAt);
  if (Number.isNaN(date.getTime())) {
    return formatShortDate(takenAt.slice(0, 10));
  }
  return formatReportWhen(date);
}

export function formatPriorWhen(takenAt: string): string {
  const date = new Date(takenAt);
  if (Number.isNaN(date.getTime())) {
    return formatShortDate(takenAt.slice(0, 10));
  }
  const day = date.getDate();
  const month = date.toLocaleString('en-GB', { month: 'short' });
  const monthLabel = month === 'Sep' ? 'Sept' : month;
  return `${String(day)} ${monthLabel}`;
}

export function concernDeltaLabels(
  current: Record<ConcernId, number>,
  previous: Record<ConcernId, number> | null,
): Partial<Record<ConcernId, string>> {
  if (!previous) {
    return {};
  }
  const out: Partial<Record<ConcernId, string>> = {};
  for (const id of Object.keys(current) as ConcernId[]) {
    const delta = current[id] - previous[id];
    if (delta === 0) {
      continue;
    }
    out[id] = `${delta > 0 ? '+' : ''}${String(delta)}`;
  }
  return out;
}

export function pickPreviousScan(scans: readonly ScanDto[], currentId: string): ScanDto | null {
  const idx = scans.findIndex((s) => s.id === currentId);
  if (idx >= 0) {
    return scans[idx + 1] ?? null;
  }
  return scans.length > 1 ? scans[1]! : null;
}
