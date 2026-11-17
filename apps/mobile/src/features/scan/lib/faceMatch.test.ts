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

test('decideFaceGate fails closed when the gate is disabled', () => {
  const d = decideFaceGate({
    enabled: false,
    hasReference: true,
    currentEmbedding: [1, 0],
    referenceEmbedding: [1, 0],
    threshold: 0.7,
  });
  assert.deepEqual(d, { action: 'block', reason: 'no_embedding' });
});

test('decideFaceGate requires dedicated enrollment when there is no reference', () => {
  const d = decideFaceGate({
    enabled: true,
    hasReference: false,
    currentEmbedding: [0.1, 0.2],
    referenceEmbedding: null,
    threshold: 0.7,
  });
  assert.deepEqual(d, { action: 'need_enroll' });
});

test('decideFaceGate blocks a mismatched face', () => {
  const d = decideFaceGate({
    enabled: true,
    hasReference: true,
    currentEmbedding: [1, 0, 0],
    referenceEmbedding: [0, 1, 0],
    threshold: 0.7,
  });
  assert.deepEqual(d, { action: 'block', reason: 'mismatch' });
});

test('decideFaceGate asks for a clearer retake in the uncertain band', () => {
  // Cosine ≈ 0.65 — under 0.70 pass, above 0.57 soft floor.
  const d = decideFaceGate({
    enabled: true,
    hasReference: true,
    currentEmbedding: [1, 0, 0],
    referenceEmbedding: [0.65, Math.sqrt(1 - 0.65 * 0.65), 0],
    threshold: 0.7,
    uncertainFloor: 0.57,
  });
  assert.equal(d.action, 'block');
  if (d.action === 'block') {
    assert.equal(d.reason, 'uncertain');
  }
});

test('decideFaceGate fails closed when no embedding is available for a known user', () => {
  const d = decideFaceGate({
    enabled: true,
    hasReference: true,
    currentEmbedding: null,
    referenceEmbedding: [0, 1, 0],
    threshold: 0.7,
  });
  assert.deepEqual(d, { action: 'block', reason: 'no_embedding' });
});

test('decideFaceGate allows a matching face', () => {
  const d = decideFaceGate({
    enabled: true,
    hasReference: true,
    currentEmbedding: [0.9, 0.1, 0],
    referenceEmbedding: [0.9, 0.1, 0],
    threshold: 0.7,
  });
  assert.deepEqual(d, { action: 'allow' });
});
