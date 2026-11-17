import { fetchFaceReference, type FaceReferenceDto } from '../api/faceReferenceApi';
import { faceModelVersion } from './faceEmbedder';
import {
  clearCachedFaceReference,
  readCachedFaceReference,
  writeCachedFaceReference,
} from './faceReferenceCache';

export type ResolvedReference = {
  embedding: number[];
  modelVersion: string | null;
};

function usableServerEmbedding(dto: FaceReferenceDto): number[] | null {
  if (dto.enrolled && Array.isArray(dto.embedding) && dto.embedding.length > 0) {
    return dto.embedding;
  }
  return null;
}

async function acceptServerEmbedding(
  userId: string,
  embedding: number[],
  storedVersion: string | null,
  expectedVersion: string,
): Promise<ResolvedReference> {
  // Missing / outdated model version → force re-enroll (never match mixed pipelines).
  if (storedVersion !== expectedVersion) {
    return { embedding, modelVersion: storedVersion ?? 'unknown' };
  }
  await writeCachedFaceReference(userId, embedding);
  return { embedding, modelVersion: storedVersion };
}

async function referenceFromServer(
  userId: string,
  expectedVersion: string,
): Promise<ResolvedReference | null> {
  const dto = await fetchFaceReference(true);
  const embedding = usableServerEmbedding(dto);
  if (embedding) {
    return acceptServerEmbedding(userId, embedding, dto.modelVersion ?? null, expectedVersion);
  }
  // Server is source of truth: not enrolled (or enrolled without a vector, which we
  // never treat as a match) → wipe any stale cache for this account.
  await clearCachedFaceReference();
  return null;
}

/**
 * Resolves the stored reference embedding.
 * Prefers the server (source of truth) so a poisoned local cache cannot unlock scans.
 * Requires a real embedding — enrolled-without-vector is treated as not enrolled.
 */
export async function resolveReference(userId: string): Promise<ResolvedReference | null> {
  const expectedVersion = faceModelVersion();
  try {
    return await referenceFromServer(userId, expectedVersion);
  } catch {
    // Offline / API blip — local cache is UX-only; backend still re-checks pixels.
  }
  const cached = await readCachedFaceReference(userId);
  if (!cached || cached.length === 0) {
    return null;
  }
  return { embedding: cached, modelVersion: expectedVersion };
}
