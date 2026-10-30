import assert from 'node:assert/strict';
import test from 'node:test';

import { cosineSimilarity, decideFaceGate, isSameIdentity } from './faceMatch';

test('cosineSimilarity is 1 for identical vectors and 0 for orthogonal', () => {
  assert.equal(cosineSimilarity([1, 0, 0], [1, 0, 0]), 1);
  assert.equal(cosineSimilarity([1, 0], [0, 1]), 0);
});

test('cosineSimilarity guards mismatched / empty / zero vectors', () => {
  assert.equal(cosineSimilarity([1, 2, 3], [1, 2]), 0);
  assert.equal(cosineSimilarity([], []), 0);
  assert.equal(cosineSimilarity([0, 0], [1, 1]), 0);
});

test('isSameIdentity applies the threshold', () => {
  const a = [0.9, 0.1, 0];
  const b = [0.88, 0.12, 0.02];
  assert.equal(isSameIdentity(a, b, 0.6), true);
  assert.equal(isSameIdentity([1, 0, 0], [0, 1, 0], 0.6), false);
});

test('decideFaceGate allows everything when the gate is disabled', () => {
  const d = decideFaceGate({
    enabled: false,
    hasReference: true,
    currentEmbedding: null,
    referenceEmbedding: null,
    threshold: 0.6,
  });
  assert.deepEqual(d, { action: 'allow' });
});

test('decideFaceGate enrolls when there is no reference yet', () => {
  const d = decideFaceGate({
    enabled: true,
    hasReference: false,
    currentEmbedding: [0.1, 0.2],
    referenceEmbedding: null,
    threshold: 0.6,
  });
  assert.deepEqual(d, { action: 'enroll' });
});

test('decideFaceGate blocks a mismatched face', () => {
  const d = decideFaceGate({
    enabled: true,
    hasReference: true,
    currentEmbedding: [1, 0, 0],
    referenceEmbedding: [0, 1, 0],
    threshold: 0.6,
  });
  assert.deepEqual(d, { action: 'block', reason: 'mismatch' });
});

test('decideFaceGate fails closed when no embedding is available for a known user', () => {
  const d = decideFaceGate({
    enabled: true,
    hasReference: true,
    currentEmbedding: null,
    referenceEmbedding: [0, 1, 0],
    threshold: 0.6,
  });
  assert.deepEqual(d, { action: 'block', reason: 'no_embedding' });
});

test('decideFaceGate allows a matching face', () => {
  const d = decideFaceGate({
    enabled: true,
    hasReference: true,
    currentEmbedding: [0.9, 0.1, 0],
    referenceEmbedding: [0.9, 0.1, 0],
    threshold: 0.6,
  });
  assert.deepEqual(d, { action: 'allow' });
});
