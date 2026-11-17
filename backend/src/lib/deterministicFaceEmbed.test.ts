import assert from 'node:assert/strict';
import test from 'node:test';

import { cosineSimilarity, isSameIdentity, DEFAULT_FACE_MATCH_THRESHOLD } from './faceMatch';
import { deterministicEmbedFromBytes } from './deterministicFaceEmbed';

const BOX = { xMin: 0.2, yMin: 0.2, width: 0.5, height: 0.5 };

function jpeg(tag: number): Uint8Array {
  return Uint8Array.from([
    0xff,
    0xd8,
    0xff,
    0xd9,
    ...Array.from({ length: 96 }, (_, i) => (i * 19 + tag * 47) & 0xff),
  ]);
}

test('same JPEG bytes produce identical embeddings', () => {
  const a = deterministicEmbedFromBytes(jpeg(1), BOX);
  const b = deterministicEmbedFromBytes(jpeg(1), BOX);
  assert.equal(a.length, 128);
  assert.equal(cosineSimilarity(a, b), 1);
  assert.equal(isSameIdentity(a, b, DEFAULT_FACE_MATCH_THRESHOLD), true);
});

test('different person JPEGs fall well below the match threshold', () => {
  const a = deterministicEmbedFromBytes(jpeg(1), BOX);
  const b = deterministicEmbedFromBytes(jpeg(2), BOX);
  const sim = cosineSimilarity(a, b);
  assert.ok(sim < 0.5, `expected low similarity, got ${sim}`);
  assert.equal(isSameIdentity(a, b, DEFAULT_FACE_MATCH_THRESHOLD), false);
});

test('never derives embedding from a client claim — only from bytes', () => {
  const claim = Array.from({ length: 128 }, () => 1);
  const fromBytes = deterministicEmbedFromBytes(jpeg(5), BOX);
  assert.notEqual(cosineSimilarity(fromBytes, claim), 1);
});
