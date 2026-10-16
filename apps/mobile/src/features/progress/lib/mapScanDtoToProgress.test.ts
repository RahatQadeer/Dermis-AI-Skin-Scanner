import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import type { ScanDto } from '@/src/features/scan/api/scanApi';

import { mapScanDtosToProgress } from './mapScanDtoToProgress';

const concerns = {
  redness: 70,
  fineLines: 68,
  hydration: 71,
  darkSpots: 69,
  texture: 64,
  pores: 58,
} as const;

function dto(id: string, takenAt: string, indexScore: number): ScanDto {
  return {
    id,
    userId: '00000000-0000-4000-8000-000000000001',
    takenAt,
    indexScore,
    concerns,
    zones: concerns as unknown as ScanDto['zones'],
    weights: {},
    formulaVersion: 'index-v1',
    model: 'test',
    promptVersion: 'v1',
    idempotencyKey: `idem-${id}`,
    createdAt: takenAt,
  };
}

describe('mapScanDtosToProgress', () => {
  it('orders newest first and numbers oldest as 001', () => {
    const mapped = mapScanDtosToProgress([
      dto('a', '2026-09-01T08:00:00.000Z', 64),
      dto('b', '2026-09-24T08:42:00.000Z', 70),
    ]);
    assert.deepEqual(
      mapped.map((s) => ({ id: s.id, scanNumber: s.scanNumber, indexScore: s.indexScore })),
      [
        { id: 'b', scanNumber: 2, indexScore: 70 },
        { id: 'a', scanNumber: 1, indexScore: 64 },
      ],
    );
    assert.equal(mapped[0]!.capturedAt, '2026-09-24');
  });
});
