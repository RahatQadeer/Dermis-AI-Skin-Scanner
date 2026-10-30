import { isApiError } from '@/src/lib/api/errors';
import { listScans, type ScanDto } from '@/src/features/scan/api/scanApi';

import { mapScanDtosToProgress } from '../lib/mapScanDtoToProgress';
import type { ProgressLoadError } from './useProgressScans';
import type { ProgressScan } from '../types/progressTypes';

export function mergeWithLastScan(rows: ScanDto[], lastScan: ScanDto | null): ScanDto[] {
  if (!lastScan) {
    return rows;
  }
  if (rows.some((row) => row.id === lastScan.id)) {
    return rows;
  }
  return [lastScan, ...rows];
}

export function resolveProgressLoadError(err: unknown): ProgressLoadError {
  const sessionExpired =
    isApiError(err) &&
    (err.code === 'invalid_token' || err.code === 'missing_token' || err.status === 401);
  return sessionExpired ? 'session' : 'network';
}

export async function fetchProgressScansForFocus(lastScan: ScanDto | null): Promise<{
  scans: ProgressScan[];
  error: ProgressLoadError | null;
}> {
  try {
    const rows = await listScans();
    return { scans: mapScanDtosToProgress(mergeWithLastScan(rows, lastScan)), error: null };
  } catch (err: unknown) {
    if (__DEV__) {
      const code = isApiError(err) ? err.code : 'network';
      console.warn('[progress] listScans failed:', code, err);
    }
    // No single-scan fallback: one cached scan rendered as "history" shows a
    // false baseline (delta 0) and hides the failure. Surface the error instead.
    return { scans: [], error: resolveProgressLoadError(err) };
  }
}
