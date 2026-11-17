import assert from 'node:assert/strict';
import test from 'node:test';

import { createMemoryFaceReferenceRepository } from '../repositories/memoryFaceReferenceRepository';
import { createMemoryScanRepository } from '../repositories/memoryScanRepository';
import { createFaceReferenceService } from './faceReferenceService';

const USER = '11111111-1111-4111-8111-111111111111';
const FACE_BOX = { xMin: 0.2, yMin: 0.2, width: 0.5, height: 0.5 };
const REF_JPEG =
  '/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIQAxAAAAF/9k=';

function embedding(seed: number): number[] {
  return Array.from({ length: 128 }, (_, i) => (seed + i) / 100);
}

test('addFace keeps prior scans under the old enrollment id', async () => {
  const faces = createFaceReferenceService(createMemoryFaceReferenceRepository());
  const scans = createMemoryScanRepository();

  const first = await faces.register(USER, {
    embedding: embedding(1),
    dim: 128,
    modelVersion: 'mfn-v1',
    referenceJpeg: REF_JPEG,
    faceBox: FACE_BOX,
  });

  await scans.insert({
    userId: USER,
    faceEnrollmentId: first.enrollmentId,
    takenAt: '2026-11-01T10:00:00.000Z',
    indexScore: 70,
    concerns: {
      redness: 70,
      fineLines: 70,
      hydration: 70,
      darkSpots: 70,
      texture: 70,
      pores: 70,
    },
    zones: {
      forehead: 70,
      tZone: 70,
      leftCheek: 70,
      rightCheek: 70,
      periorbital: 70,
      chin: 70,
    },
    weights: {
      redness: 1,
      fineLines: 1,
      hydration: 1,
      darkSpots: 1,
      texture: 1,
      pores: 1,
    },
    formulaVersion: 'index-v1',
    model: 'test',
    promptVersion: 'p',
    idempotencyKey: 'scan-old-face',
  });

  const second = await faces.register(
    USER,
    {
      embedding: embedding(9),
      dim: 128,
      modelVersion: 'mfn-v1',
      referenceJpeg: REF_JPEG,
      faceBox: FACE_BOX,
    },
    { addFace: true },
  );

  await scans.insert({
    userId: USER,
    faceEnrollmentId: second.enrollmentId,
    takenAt: '2026-11-10T10:00:00.000Z',
    indexScore: 75,
    concerns: {
      redness: 75,
      fineLines: 75,
      hydration: 75,
      darkSpots: 75,
      texture: 75,
      pores: 75,
    },
    zones: {
      forehead: 75,
      tZone: 75,
      leftCheek: 75,
      rightCheek: 75,
      periorbital: 75,
      chin: 75,
    },
    weights: {
      redness: 1,
      fineLines: 1,
      hydration: 1,
      darkSpots: 1,
      texture: 1,
      pores: 1,
    },
    formulaVersion: 'index-v1',
    model: 'test',
    promptVersion: 'p',
    idempotencyKey: 'scan-new-face',
  });

  const rows = await scans.listByUserId(USER);
  assert.equal(rows.length, 2);
  assert.notEqual(first.enrollmentId, second.enrollmentId);
  assert.equal(
    rows.find((r) => r.idempotencyKey === 'scan-old-face')?.faceEnrollmentId,
    first.enrollmentId,
  );
  assert.equal(
    rows.find((r) => r.idempotencyKey === 'scan-new-face')?.faceEnrollmentId,
    second.enrollmentId,
  );
});
