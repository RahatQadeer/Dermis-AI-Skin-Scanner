import assert from 'node:assert/strict';
import test from 'node:test';

import { estimateSkinAge } from './resultsDisplay';

test('estimateSkinAge drops when youth-linked scores improve', () => {
  const older = estimateSkinAge(55, { fineLines: 40, texture: 45, darkSpots: 50 });
  const younger = estimateSkinAge(78, { fineLines: 82, texture: 80, darkSpots: 75 });
  assert.ok(younger < older);
  assert.ok(younger >= 18 && younger <= 55);
  assert.ok(older >= 18 && older <= 55);
});

test('estimateSkinAge stays within 18–55', () => {
  assert.equal(estimateSkinAge(100, { fineLines: 100, texture: 100, darkSpots: 100 }), 18);
  assert.equal(estimateSkinAge(0, { fineLines: 0, texture: 0, darkSpots: 0 }), 55);
});
