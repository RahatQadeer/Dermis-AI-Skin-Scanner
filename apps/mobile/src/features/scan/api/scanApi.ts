import type { ConcernScores, ZoneScores } from '@dermis/domain/server';

import { getApiClient } from '@/src/lib/api/client';

export type ScanDto = {
  id: string;
  userId: string;
  takenAt: string;
  indexScore: number;
  concerns: ConcernScores;
  zones: ZoneScores;
  weights: Record<string, number>;
  formulaVersion: string;
  model: string;
  promptVersion: string;
  idempotencyKey: string;
  createdAt: string;
};

export type CreateScanInput = {
  idempotencyKey: string;
  imageBase64: string;
  contentType: 'image/jpeg' | 'image/png' | 'image/webp';
};

export async function createScan(
  input: CreateScanInput,
): Promise<{ scan: ScanDto; replayed: boolean }> {
  return getApiClient().post('/v1/scans', input);
}

/** Newest-first scan history for the signed-in user. */
export async function listScans(): Promise<ScanDto[]> {
  const res = await getApiClient().get<{ scans?: ScanDto[] }>('/v1/scans');
  return Array.isArray(res?.scans) ? res.scans : [];
}

/** Clears all stored scans for the signed-in user. */
export async function deleteAllScans(): Promise<number> {
  const res = await getApiClient().delete<{ deleted: number }>('/v1/scans');
  return typeof res.deleted === 'number' ? res.deleted : 0;
}
