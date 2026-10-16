import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { calculateIndex, DomainError } from './calculateIndex';
import type { ConcernScores } from './calculateIndex';
import { FORMULA_VERSION } from './constants';

const sampleScores: ConcernScores = {
  redness: 81,
  fineLines: 77,
  hydration: 72,
  darkSpots: 69,
  texture: 64,
  pores: 58,
};

describe('calculateIndex', () => {
  it('uses plain mean when no priorities (sample → 70)', () => {
    const result = calculateIndex({ scores: sampleScores, priorities: [] });
    assert.equal(result.index, 70);
    assert.equal(result.formulaVersion, FORMULA_VERSION);
    for (const w of Object.values(result.weights)) {
      assert.equal(w, 1);
    }
  });

  it('weights up to 3 priorities at 1.5', () => {
    const result = calculateIndex({
      scores: sampleScores,
      priorities: ['pores', 'texture', 'hydration'],
    });
    // (81+77+72*1.5+69+64*1.5+58*1.5) / 7.5 = 518 / 7.5 ≈ 69.067 → 69
    assert.equal(result.index, 69);
    assert.equal(result.weights.pores, 1.5);
    assert.equal(result.weights.texture, 1.5);
    assert.equal(result.weights.hydration, 1.5);
    assert.equal(result.weights.redness, 1);
  });

  it('handles all equal scores', () => {
    const scores: ConcernScores = {
      redness: 50,
      fineLines: 50,
      hydration: 50,
      darkSpots: 50,
      texture: 50,
      pores: 50,
    };
    const plain = calculateIndex({ scores });
    const weighted = calculateIndex({ scores, priorities: ['pores', 'texture'] });
    assert.equal(plain.index, 50);
    assert.equal(weighted.index, 50);
  });

  it('rounds half up via Math.round (e.g. .5)', () => {
    const scores: ConcernScores = {
      redness: 100,
      fineLines: 100,
      hydration: 100,
      darkSpots: 100,
      texture: 100,
      pores: 0,
    };
    // mean = 500/6 = 83.333… → 83
    assert.equal(calculateIndex({ scores }).index, 83);
  });

  it('rejects more than 3 priorities', () => {
    assert.throws(
      () =>
        calculateIndex({
          scores: sampleScores,
          priorities: ['pores', 'texture', 'hydration', 'redness'],
        }),
      DomainError,
    );
  });

  it('rejects unknown concern ids', () => {
    assert.throws(
      () => calculateIndex({ scores: sampleScores, priorities: ['glow'] }),
      DomainError,
    );
  });

  it('rejects out-of-range scores', () => {
    assert.throws(
      () =>
        calculateIndex({
          scores: { ...sampleScores, pores: 101 },
        }),
      DomainError,
    );
  });

  it('dedupes priorities without changing weights twice', () => {
    const result = calculateIndex({
      scores: sampleScores,
      priorities: ['pores', 'pores'],
    });
    assert.equal(result.weights.pores, 1.5);
  });
});
