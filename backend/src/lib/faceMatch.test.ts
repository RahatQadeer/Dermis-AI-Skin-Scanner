import assert from 'node:assert/strict';
import test from 'node:test';

import { cosineSimilarity, isSameIdentity, resolveFaceMatchThreshold } from './faceMatch';

test('cosineSimilarity is 1 for identical vectors and 0 for orthogonal', () => {
  assert.equal(cosineSimilarity([1, 0, 0], [1, 0, 0]), 1);
  assert.equal(cosineSimilarity([1, 0], [0, 1]), 0);
});

test('isSameIdentity applies the threshold', () => {
  assert.equal(isSameIdentity([1, 0, 0], [1, 0, 0], 0.72), true);
  assert.equal(isSameIdentity([1, 0, 0], [0, 1, 0], 0.72), false);
});

test('resolveFaceMatchThreshold falls back to default', () => {
  assert.equal(resolveFaceMatchThreshold(''), 0.94);
  assert.equal(resolveFaceMatchThreshold('0.8'), 0.8);
});
