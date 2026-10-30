import { weightedIndex, type ConcernId } from '@dermis/domain';

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
 * Maps API scan DTOs (any order) → ProgressScan[] newest-first with scan numbers.
 *
 * Each stored indexScore is weighted by the priority concerns in force when
 * that scan was taken, so a priorities change would make the series jump
 * without any change in skin. Every scan is re-scored with the newest scan's
 * weights (identical to the stored value whenever priorities never changed).
 * Rows from a different formula version, or with missing concern scores, keep
 * their stored value rather than being re-scored from incomplete data.
 */
export function mapScanDtosToProgress(scans: readonly ScanDto[]): ProgressScan[] {
  const chronological = [...scans].sort((a, b) => a.takenAt.localeCompare(b.takenAt));
  const newestFirst = [...chronological].reverse();
  const basis = newestFirst[0];

  return newestFirst.map((dto, indexFromNewest) => {
    const scanNumber = chronological.length - indexFromNewest;
    const taken = new Date(dto.takenAt);
    const concernScores = concernScoresFromDto(dto);
    return {
      id: dto.id,
      capturedAt: utcDateKey(taken),
      capturedTime: localTimeHm(taken),
      scanNumber,
      indexScore:
        basis && canRescore(dto, basis)
          ? weightedIndex(concernScores, basis.weights)
          : dto.indexScore,
      concernScores,
    };
  });
}

function canRescore(dto: ScanDto, basis: ScanDto): boolean {
  return (
    dto.formulaVersion === basis.formulaVersion &&
    CONCERN_IDS.every((id) => Number.isFinite(dto.concerns[id]))
  );
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
