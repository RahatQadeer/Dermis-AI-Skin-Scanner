import type { ConcernId } from '@dermis/domain';

import type { ScanDto } from '@/src/features/scan/api/scanApi';

import type { ProgressScan } from '../types/progressTypes';

const CONCERN_IDS: readonly ConcernId[] = [
  'redness',
  'fineLines',
  'hydration',
  'darkSpots',
  'texture',
  'pores',
];

/**
 * Maps API scan DTOs → ProgressScan[] newest-first with scan numbers.
 * Uses the stored indexScore from the API (never rewrites history with new weights).
 */
export function mapScanDtosToProgress(scans: readonly ScanDto[]): ProgressScan[] {
  const chronological = [...scans].sort((a, b) => a.takenAt.localeCompare(b.takenAt));
  const newestFirst = [...chronological].reverse();

  return newestFirst.map((dto, indexFromNewest) => {
    const scanNumber = chronological.length - indexFromNewest;
    const taken = new Date(dto.takenAt);
    return {
      id: dto.id,
      capturedAt: utcDateKey(taken),
      capturedTime: localTimeHm(taken),
      scanNumber,
      indexScore: dto.indexScore,
      concernScores: concernScoresFromDto(dto),
    };
  });
}

function concernScoresFromDto(dto: ScanDto): Record<ConcernId, number> {
  const out = {} as Record<ConcernId, number>;
  for (const id of CONCERN_IDS) {
    out[id] = dto.concerns[id] ?? 0;
  }
  return out;
}

function utcDateKey(date: Date): string {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, '0');
  const d = String(date.getUTCDate()).padStart(2, '0');
  return `${String(y)}-${m}-${d}`;
}

function localTimeHm(date: Date): string {
  const h = String(date.getHours()).padStart(2, '0');
  const m = String(date.getMinutes()).padStart(2, '0');
  return `${h}:${m}`;
}
