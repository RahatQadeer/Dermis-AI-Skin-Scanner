import assert from 'node:assert/strict';
import test from 'node:test';

import { HttpError } from '../http/HttpError';
import { createMemoryFaceReferenceRepository } from '../repositories/memoryFaceReferenceRepository';
import { createFaceReferenceService } from './faceReferenceService';

const USER_A = '11111111-1111-4111-8111-111111111111';
const USER_B = '22222222-2222-4222-8222-222222222222';

function makeEmbedding(seed: number): number[] {
  return Array.from({ length: 128 }, (_, i) => (seed + i) / 100);
}

const FACE_BOX = { xMin: 0.2, yMin: 0.2, width: 0.5, height: 0.5 };
const REF_JPEG = '/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIQAxAAAAF/9k=';

function enrollInput(embedding: number[], modelVersion: string) {
  return {
    embedding,
    dim: embedding.length,
    modelVersion,
    referenceJpeg: REF_JPEG,
    faceBox: FACE_BOX,
  };
}


test('status is not-enrolled until a reference is registered', async () => {
  const service = createFaceReferenceService(createMemoryFaceReferenceRepository());
  const before = await service.status(USER_A);
  assert.equal(before.enrolled, false);
  assert.equal(before.dim, null);

  await service.register(USER_A, enrollInput(makeEmbedding(1), 'mfn-v1'));
  const after = await service.status(USER_A);
  assert.equal(after.enrolled, true);
  assert.equal(after.dim, 128);
  assert.equal(after.modelVersion, 'mfn-v1');
});

test('get returns the stored embedding for on-device matching', async () => {
  const service = createFaceReferenceService(createMemoryFaceReferenceRepository());
  const embedding = makeEmbedding(5);
  await service.register(USER_A, enrollInput(embedding, 'mfn-v1'));
  const record = await service.get(USER_A);
  assert.deepEqual(record?.embedding, embedding);
});

test('registering twice without replace is rejected (one-time enrollment)', async () => {
  const service = createFaceReferenceService(createMemoryFaceReferenceRepository());
  await service.register(USER_A, enrollInput(makeEmbedding(1), 'mfn-v1'));
  await assert.rejects(
    () =>
      service.register(USER_A, enrollInput(makeEmbedding(9), 'mfn-v1')),
    (err) => err instanceof HttpError && err.status === 409,
  );
});

test('register with replace requires proof when model version is unchanged', async () => {
  const service = createFaceReferenceService(createMemoryFaceReferenceRepository());
  const first = await service.register(USER_A, enrollInput(makeEmbedding(1), 'mfn-v1'));
  await assert.rejects(
    () =>
      service.register(
        USER_A,
        enrollInput(makeEmbedding(9), 'mfn-v1'),
        { replace: true },
      ),
    (err) => err instanceof HttpError && err.code === 'face_replace_reauth_required',
  );
  const replaced = await service.register(
    USER_A,
    enrollInput(makeEmbedding(9), 'mfn-v1'),
    { replace: true, currentFaceEmbedding: makeEmbedding(1) },
  );
  assert.deepEqual(replaced.embedding, makeEmbedding(9));
  assert.equal(replaced.registeredAt, first.registeredAt);
});

test('outdated model version can be upgraded without biometric proof of the old vector', async () => {
  const service = createFaceReferenceService(createMemoryFaceReferenceRepository());
  await service.register(USER_A, enrollInput(makeEmbedding(1), 'mfn-v1'));
  // Fresh enroll (no replace) after pipeline bump — old embeddings cannot match new preprocess.
  const upgraded = await service.register(USER_A, enrollInput(makeEmbedding(7), 'mfn-v2'));
  assert.equal(upgraded.modelVersion, 'mfn-v2');
  assert.deepEqual(upgraded.embedding, makeEmbedding(7));
});

test('references are isolated per user', async () => {
  const repo = createMemoryFaceReferenceRepository();
  const service = createFaceReferenceService(repo);
  await service.register(USER_A, enrollInput(makeEmbedding(1), 'mfn-v1'));
  assert.equal((await service.status(USER_B)).enrolled, false);
  assert.equal(await service.get(USER_B), null);
});

test('addFace rotates enrollment id without requiring old-face proof', async () => {
  const service = createFaceReferenceService(createMemoryFaceReferenceRepository());
  const first = await service.register(USER_A, enrollInput(makeEmbedding(1), 'mfn-v1'));
  const second = await service.register(
    USER_A,
    enrollInput(makeEmbedding(9), 'mfn-v1'),
    { addFace: true },
  );
  assert.notEqual(second.enrollmentId, first.enrollmentId);
  assert.deepEqual(second.embedding, makeEmbedding(9));
});
