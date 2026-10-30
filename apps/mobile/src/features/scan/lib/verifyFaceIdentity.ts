import { fetchFaceReference, registerFaceReference } from '../api/faceReferenceApi';
import { decodeJpegPixels } from './decodeJpegPixels';
import { detectFacesFromPixels } from './detectFacesFromPixels';
import { getFaceMatchThreshold, isFaceIdentityEnabled } from './faceConfig';
import { computeFaceEmbedding, faceModelVersion } from './faceEmbedder';
import { decideFaceGate } from './faceMatch';
import { readCachedFaceReference, writeCachedFaceReference } from './faceReferenceCache';

/** Exact copy when another person attempts a scan. */
export const FACE_IDENTITY_MISMATCH_MESSAGE =
  'Use your own selfie — this face does not match your registered profile.';
/** Shown when verification cannot run (model/network) for an enrolled user. */
export const FACE_IDENTITY_RETRY_MESSAGE =
  "Couldn't verify it's you. Please try again in good, even lighting.";
/** Analysis scan attempted before dedicated enrollment. */
export const FACE_IDENTITY_NEED_ENROLL_MESSAGE =
  'Register your face once before scanning. Open Face setup from Scan.';
/** Enrollment capture failed to produce an embedding. */
export const FACE_ENROLL_FAILED_MESSAGE =
  "Couldn't register your face. Center one face in good light and try again.";

/** Thrown to block a scan; the message is surfaced on the camera retake toast. */
export class FaceIdentityError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'FaceIdentityError';
  }
}

const EMBED_WIDTH_PX = 360;

export async function computeCurrentEmbedding(uri: string): Promise<number[] | null> {
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

/** Dedicated enrollment — fails closed (does not swallow API errors). */
export async function enrollFaceReference(
  userId: string,
  uri: string,
  replace = false,
): Promise<void> {
  if (!isFaceIdentityEnabled()) {
    return;
  }
  const embedding = await computeCurrentEmbedding(uri);
  if (!embedding) {
    throw new FaceIdentityError(FACE_ENROLL_FAILED_MESSAGE);
  }
  await registerFaceReference(embedding, faceModelVersion(), replace);
  await writeCachedFaceReference(userId, embedding);
}

/**
 * Identity gate run before a scan is uploaded. No-op when disabled.
 * Never auto-enrolls — enrollment is a dedicated screen.
 */
export async function verifyFaceIdentity(uri: string, userId: string): Promise<void> {
  if (!isFaceIdentityEnabled()) {
    return;
  }
  let currentEmbedding: number[] | null;
  try {
    currentEmbedding = await computeCurrentEmbedding(uri);
  } catch {
    throw new FaceIdentityError(FACE_IDENTITY_RETRY_MESSAGE);
  }

  let referenceEmbedding: number[] | null;
  try {
    referenceEmbedding = await resolveReference(userId);
  } catch {
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
  if (decision.action === 'need_enroll') {
    throw new FaceIdentityError(FACE_IDENTITY_NEED_ENROLL_MESSAGE);
  }
  throw new FaceIdentityError(
    decision.reason === 'mismatch' ? FACE_IDENTITY_MISMATCH_MESSAGE : FACE_IDENTITY_RETRY_MESSAGE,
  );
}
