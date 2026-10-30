import { fetchFaceReference, registerFaceReference } from '../api/faceReferenceApi';
import { decodeJpegPixels } from './decodeJpegPixels';
import { detectFacesFromPixels } from './detectFacesFromPixels';
import { getFaceMatchThreshold, isFaceIdentityEnabled } from './faceConfig';
import { computeFaceEmbedding, faceModelVersion } from './faceEmbedder';
import { decideFaceGate } from './faceMatch';
import { readCachedFaceReference, writeCachedFaceReference } from './faceReferenceCache';

/** Exact copy required when a different person attempts a scan. */
export const FACE_IDENTITY_MISMATCH_MESSAGE =
  "Face identity doesn't match your registered profile.";
/** Shown when verification cannot run (model/network) for an enrolled user. */
export const FACE_IDENTITY_RETRY_MESSAGE =
  "Couldn't verify it's you. Please try again in good, even lighting.";

/** Thrown to block a scan; the message is surfaced on the camera retake toast. */
export class FaceIdentityError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'FaceIdentityError';
  }
}

const EMBED_WIDTH_PX = 360;

async function computeCurrentEmbedding(uri: string): Promise<number[] | null> {
  const pixels = await decodeJpegPixels(uri, EMBED_WIDTH_PX);
  if (!pixels) {
    return null;
  }
  const buffer = {
    data: pixels.data,
    width: pixels.width,
    height: pixels.height,
    channels: 4 as const,
  };
  const faces = await detectFacesFromPixels(buffer);
  if (!faces || faces.length !== 1) {
    return null;
  }
  return computeFaceEmbedding(buffer, faces[0]!.box);
}

/** Resolves the stored reference embedding; throws if state can't be determined. */
async function resolveReference(userId: string): Promise<number[] | null> {
  const cached = await readCachedFaceReference(userId);
  if (cached) {
    return cached;
  }
  const dto = await fetchFaceReference();
  if (dto.enrolled && Array.isArray(dto.embedding)) {
    await writeCachedFaceReference(userId, dto.embedding);
    return dto.embedding;
  }
  return null;
}

async function enroll(userId: string, embedding: number[]): Promise<void> {
  try {
    await registerFaceReference(embedding, faceModelVersion());
    await writeCachedFaceReference(userId, embedding);
  } catch {
    // Non-fatal: a later scan re-attempts enrollment. Allow this first scan.
  }
}

/**
 * Identity gate run before a scan is uploaded. No-op when disabled. Enrolls on
 * first scan, verifies on subsequent scans, and throws FaceIdentityError to
 * block a mismatched face or when an enrolled user can't be verified
 * (fail-closed).
 */
export async function verifyFaceIdentity(uri: string, userId: string): Promise<void> {
  if (!isFaceIdentityEnabled()) {
    return;
  }
  let currentEmbedding: number[] | null;
  try {
    currentEmbedding = await computeCurrentEmbedding(uri);
  } catch {
    // Model load / decode failure: block (fail closed) with a friendly message
    // rather than surfacing a raw library error on the camera toast.
    throw new FaceIdentityError(FACE_IDENTITY_RETRY_MESSAGE);
  }

  let referenceEmbedding: number[] | null;
  try {
    referenceEmbedding = await resolveReference(userId);
  } catch {
    // Can't determine enrollment state → fail closed rather than skip the check.
    throw new FaceIdentityError(FACE_IDENTITY_RETRY_MESSAGE);
  }

  const decision = decideFaceGate({
    enabled: true,
    hasReference: referenceEmbedding !== null,
    currentEmbedding,
    referenceEmbedding,
    threshold: getFaceMatchThreshold(),
  });

  if (decision.action === 'allow') {
    return;
  }
  if (decision.action === 'enroll') {
    await enroll(userId, currentEmbedding!);
    return;
  }
  throw new FaceIdentityError(
    decision.reason === 'mismatch' ? FACE_IDENTITY_MISMATCH_MESSAGE : FACE_IDENTITY_RETRY_MESSAGE,
  );
}
