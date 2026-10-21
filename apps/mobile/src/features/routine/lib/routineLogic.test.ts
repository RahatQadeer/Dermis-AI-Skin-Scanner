import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  addStep,
  countDone,
  findStepByLabel,
  normalizeStepLabel,
  removeStep,
  toggleStep,
  updateStepLabel,
} from './routineLogic';

const sample = [
  { id: 'a', label: 'Cleanse', done: false },
  { id: 'b', label: 'Moisturize', done: true },
];

describe('routineLogic', () => {
  it('normalizes step labels', () => {
    assert.equal(normalizeStepLabel('  SPF  '), 'SPF');
    assert.equal(normalizeStepLabel('   '), null);
  });

  it('counts done steps', () => {
    assert.equal(countDone(sample), 1);
  });

  it('toggles a step', () => {
    const next = toggleStep(sample, 'a');
    assert.equal(next[0]?.done, true);
  });

  it('updates label when valid', () => {
    const next = updateStepLabel(sample, 'a', 'Double cleanse');
    assert.equal(next?.[0]?.label, 'Double cleanse');
    assert.equal(updateStepLabel(sample, 'a', ' '), null);
  });

  it('adds a step', () => {
    const result = addStep(sample, 'c', 'Serum');
    assert.equal(result?.steps.length, 3);
    assert.equal(result?.steps[2]?.label, 'Serum');
  });

  it('rejects duplicate labels when adding', () => {
    assert.equal(addStep(sample, 'c', 'cleanse'), null);
  });

  it('finds and removes by id', () => {
    assert.equal(findStepByLabel(sample, 'Cleanse')?.id, 'a');
    assert.deepEqual(
      removeStep(sample, 'a').map((s) => s.id),
      ['b'],
    );
  });
});
