import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import type { ScanDto } from '@/src/features/scan/api/scanApi';

import { mapScanDtosToProgress } from './mapScanDtoToProgress';

const PRIORITY_REDNESS = {
  redness: 1.5,
  fineLines: 1,
  hydration: 1,
  darkSpots: 1,
  texture: 1,
  pores: 1,
};

function uniform(score: number): ScanDto['concerns'] {
  return {
    redness: score,
    fineLines: score,
    hydration: score,
    darkSpots: score,
    texture: score,
    pores: score,
  };
}

function dto(
  id: string,
  takenAt: string,
  indexScore: number,
  concerns: ScanDto['concerns'] = uniform(indexScore),
  weights: ScanDto['weights'] = {},
): ScanDto {
  return {
    id,
    userId: '00000000-0000-4000-8000-000000000001',
    takenAt,
    indexScore,
    concerns,
    zones: concerns as unknown as ScanDto['zones'],
    weights,
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

  it('preserves stored index scores when priorities change (no history rewrite)', () => {
    const skin = { ...uniform(80), redness: 40 };
    const mapped = mapScanDtosToProgress([
      dto('before', '2026-09-01T08:00:00.000Z', 73, skin, {}),
      dto('after', '2026-09-24T08:00:00.000Z', 71, skin, PRIORITY_REDNESS),
    ]);
    assert.equal(mapped[0]!.indexScore, 71);
    assert.equal(mapped[1]!.indexScore, 73);
  });

  it('keeps the stored index for every row regardless of formula version', () => {
    const legacy = dto('legacy', '2026-08-01T08:00:00.000Z', 66, uniform(80), {});
    legacy.formulaVersion = 'index-v0';
    const partial = dto('partial', '2026-08-15T08:00:00.000Z', 64, uniform(80), {});
    delete (partial.concerns as Partial<ScanDto['concerns']>).pores;
    const mapped = mapScanDtosToProgress([
      legacy,
      partial,
      dto('now', '2026-09-24T08:00:00.000Z', 71, uniform(71), PRIORITY_REDNESS),
    ]);
    assert.equal(mapped.find((s) => s.id === 'legacy')!.indexScore, 66);
    assert.equal(mapped.find((s) => s.id === 'partial')!.indexScore, 64);
    assert.equal(mapped.find((s) => s.id === 'now')!.indexScore, 71);
  });
});
