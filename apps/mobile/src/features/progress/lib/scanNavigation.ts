import type { ProgressScan } from '../types/progressTypes';

/** History is newest-first. Previous = older, next = newer. */
export function adjacentScanIds(
  orderedNewestFirst: readonly ProgressScan[],
  scanId: string,
): { previousId: string | null; nextId: string | null } {
  const index = orderedNewestFirst.findIndex((scan) => scan.id === scanId);
  if (index < 0) {
    return { previousId: null, nextId: null };
  }
  return {
    previousId: orderedNewestFirst[index + 1]?.id ?? null,
    nextId: orderedNewestFirst[index - 1]?.id ?? null,
  };
}

export function indexDelta(current: number, previous: number | undefined): number | null {
  if (previous === undefined) {
    return null;
  }
  return current - previous;
}
