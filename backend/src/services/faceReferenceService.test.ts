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

test('status is not-enrolled until a reference is registered', async () => {
  const service = createFaceReferenceService(createMemoryFaceReferenceRepository());
  const before = await service.status(USER_A);
  assert.equal(before.enrolled, false);
  assert.equal(before.dim, null);

  await service.register(USER_A, { embedding: makeEmbedding(1), dim: 128, modelVersion: 'mfn-v1' });
  const after = await service.status(USER_A);
  assert.equal(after.enrolled, true);
  assert.equal(after.dim, 128);
  assert.equal(after.modelVersion, 'mfn-v1');
});

test('get returns the stored embedding for on-device matching', async () => {
  const service = createFaceReferenceService(createMemoryFaceReferenceRepository());
  const embedding = makeEmbedding(5);
  await service.register(USER_A, { embedding, dim: 128, modelVersion: 'mfn-v1' });
  const record = await service.get(USER_A);
  assert.deepEqual(record?.embedding, embedding);
});

test('registering twice without replace is rejected (one-time enrollment)', async () => {
  const service = createFaceReferenceService(createMemoryFaceReferenceRepository());
  await service.register(USER_A, { embedding: makeEmbedding(1), dim: 128, modelVersion: 'mfn-v1' });
  await assert.rejects(
    () => service.register(USER_A, { embedding: makeEmbedding(9), dim: 128, modelVersion: 'mfn-v1' }),
    (err) => err instanceof HttpError && err.status === 409,
  );
});

test('register with replace overwrites but keeps registeredAt', async () => {
  const service = createFaceReferenceService(createMemoryFaceReferenceRepository());
  const first = await service.register(USER_A, {
    embedding: makeEmbedding(1),
    dim: 128,
    modelVersion: 'mfn-v1',
  });
  const replaced = await service.register(
    USER_A,
    { embedding: makeEmbedding(9), dim: 128, modelVersion: 'mfn-v2' },
    { replace: true },
  );
  assert.equal(replaced.modelVersion, 'mfn-v2');
  assert.equal(replaced.registeredAt, first.registeredAt);
});

test('references are isolated per user', async () => {
  const repo = createMemoryFaceReferenceRepository();
  const service = createFaceReferenceService(repo);
  await service.register(USER_A, { embedding: makeEmbedding(1), dim: 128, modelVersion: 'mfn-v1' });
  assert.equal((await service.status(USER_B)).enrolled, false);
  assert.equal(await service.get(USER_B), null);
});
