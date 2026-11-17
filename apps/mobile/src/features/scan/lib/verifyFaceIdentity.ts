import { isApiError } from '@/src/lib/api/errors';

import { registerFaceReference } from '../api/faceReferenceApi';
import { decodeJpegPixels } from './decodeJpegPixels';
import { detectFacesFromPixels } from './detectFacesFromPixels';
import {
  getFaceMatchThreshold,
  getFaceMatchUncertainFloor,
  isFaceIdentityEnabled,
} from './faceConfig';
import { computeFaceEmbedding, faceModelVersion } from './faceEmbedder';
import { cosineSimilarity, decideFaceGate, type FaceGateDecision } from './faceMatch';
import { markFaceEnrolledLocally } from './faceEnrollmentStatus';
import { prepareScanImage } from './prepareScanImage';
import { writeCachedFaceReference } from './faceReferenceCache';
import { resolveReference, type ResolvedReference } from './resolveFaceReference';

/** Exact copy when another person attempts a scan. */
export const FACE_IDENTITY_MISMATCH_MESSAGE =
  'This face does not match your registered profile.';
/** Close match but not confident — lighting / angle / hold still (not a clear impostor). */
export const FACE_IDENTITY_UNCERTAIN_MESSAGE =
  "Couldn't confirm it's you. Face the camera in bright, even light and try again.";
/** Shown when verification cannot run (model/network) for an enrolled user. */
export const FACE_IDENTITY_RETRY_MESSAGE =
  "Couldn't verify it's you. Please try again in good, even lighting.";
/** Analysis scan attempted before dedicated enrollment. */
export const FACE_IDENTITY_NEED_ENROLL_MESSAGE = 'Please register your face before scanning.';
export const FACE_IDENTITY_UNAVAILABLE_MESSAGE =
  'Face recognition service is unavailable. Please try again.';
export const FACE_IDENTITY_VERIFIED_MESSAGE = 'Face verified successfully.';
/** Enrollment capture failed to produce an embedding. */
export const FACE_ENROLL_FAILED_MESSAGE =
  "Couldn't register your face. Center one face in good light and try again.";
/** Account already has a face and this enroll was not a replace. */
export const FACE_ALREADY_ENROLLED_MESSAGE =
  'This account already has a face registered. Update it from Profile → Update face reference.';
/** Preprocessing / model version changed — old embedding is invalid. */
export const FACE_IDENTITY_REENROLL_MESSAGE =
  'Face check was updated. Please re-register your face in Profile → Update face reference.';

/** Thrown to block a scan; the message is surfaced on the camera retake toast. */
export class FaceIdentityError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'FaceIdentityError';
  }
}

const EMBED_WIDTH_PX = 480;

function landmarkFromDetected(face: {
  box: { xMin: number; yMin: number; width: number; height: number };
  keypoints?: { x: number; y: number; name?: string }[];
}) {
  const kp = face.keypoints ?? [];
  const rightEye = kp.find((p) => p.name === 'rightEye');
  const leftEye = kp.find((p) => p.name === 'leftEye');
  return {
    box: face.box,
    rightEye: rightEye ? { x: rightEye.x, y: rightEye.y } : undefined,
    leftEye: leftEye ? { x: leftEye.x, y: leftEye.y } : undefined,
  };
}

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
  return computeFaceEmbedding(buffer, landmarkFromDetected(faces[0]!));
}

export type FaceEnrollMode = 'enroll' | 'replace' | 'addFace';

function firstSampleUri(uris: string | string[]): string {
  const samples = Array.isArray(uris) ? uris : [uris];
  const uri = samples[0];
  if (!uri) {
    throw new FaceIdentityError(FACE_ENROLL_FAILED_MESSAGE);
  }
  return uri;
}

function normalizeEnrollMode(mode: FaceEnrollMode | boolean): FaceEnrollMode {
  if (mode === true) return 'replace';
  if (mode === false) return 'enroll';
  return mode;
}

async function requireCurrentEmbedding(proofUri: string): Promise<number[]> {
  const embedding = await computeCurrentEmbedding(proofUri);
  if (!embedding) {
    throw new FaceIdentityError(FACE_IDENTITY_MISMATCH_MESSAGE);
  }
  return embedding;
}

type SubmitReferenceInput = {
  userId: string;
  embedding: number[];
  faceBox: FaceBoxNorm;
  imageBase64: string;
  enrollMode: FaceEnrollMode;
  currentFaceEmbedding?: number[];
};

async function submitReference(input: SubmitReferenceInput): Promise<void> {
  try {
    const dto = await registerFaceReference({
      embedding: input.embedding,
      modelVersion: faceModelVersion(),
      imageBase64: input.imageBase64,
      faceBox: input.faceBox,
      replace: input.enrollMode === 'replace',
      addFace: input.enrollMode === 'addFace',
      currentFaceEmbedding: input.currentFaceEmbedding,
    });
    const stored = dto.embedding ?? input.embedding;
    await writeCachedFaceReference(input.userId, stored);
  } catch (err) {
    if (!isAlreadyEnrolledConflict(err)) {
      throw err;
    }
    throw new FaceIdentityError(FACE_ALREADY_ENROLLED_MESSAGE);
  }
}

/**
 * One clear selfie → save JPEG + embedding on the account (email/user id).
 * Scans later compare that enrolled photo to the new scan photo on the server.
 * `addFace` starts a new Progress series without deleting prior history.
 */
export async function enrollFaceReference(
  userId: string,
  uris: string | string[],
  mode: FaceEnrollMode | boolean = 'enroll',
  currentFaceProofUri?: string,
): Promise<void> {
  if (!isFaceIdentityEnabled()) {
    throw new FaceIdentityError(FACE_ENROLL_FAILED_MESSAGE);
  }
  const uri = firstSampleUri(uris);
  const matched = await computeEmbeddingWithBox(uri);
  if (!matched) {
    throw new FaceIdentityError(FACE_ENROLL_FAILED_MESSAGE);
  }
  const prepared = await prepareScanImage(uri);
  const enrollMode = normalizeEnrollMode(mode);
  const currentFaceEmbedding =
    enrollMode === 'replace'
      ? await requireCurrentEmbedding(currentFaceProofUri ?? uri)
      : undefined;

  await submitReference({
    userId,
    embedding: matched.embedding,
    faceBox: matched.faceBox,
    imageBase64: prepared.base64,
    enrollMode,
    currentFaceEmbedding,
  });
  await markFaceEnrolledLocally(userId);
}

function isAlreadyEnrolledConflict(err: unknown): boolean {
  return isApiError(err) && err.status === 409;
}

export type FaceBoxNorm = {
  xMin: number;
  yMin: number;
  width: number;
  height: number;
};

export type FaceMatchResult = {
  embedding: number[];
  modelVersion: string;
  faceBox: FaceBoxNorm;
};

export type FaceIdentityProof = FaceMatchResult & {
  livenessPassed: true;
  livenessChallengeId: string;
};

async function loadReferenceOrThrow(userId: string): Promise<ResolvedReference> {
  let reference: ResolvedReference | null;
  try {
    reference = await resolveReference(userId);
  } catch {
    throw new FaceIdentityError(FACE_IDENTITY_UNAVAILABLE_MESSAGE);
  }
  if (!reference) {
    throw new FaceIdentityError(FACE_IDENTITY_NEED_ENROLL_MESSAGE);
  }
  return reference;
}

function assertReferenceCompatible(
  current: number[],
  reference: ResolvedReference,
  expectedVersion: string,
): void {
  if (!reference.modelVersion || reference.modelVersion !== expectedVersion) {
    throw new FaceIdentityError(FACE_IDENTITY_REENROLL_MESSAGE);
  }
  if (current.length !== reference.embedding.length) {
    throw new FaceIdentityError(FACE_IDENTITY_REENROLL_MESSAGE);
  }
}

function logDevDecision(current: number[], reference: number[], threshold: number): void {
  if (!__DEV__) return;
  const similarity = cosineSimilarity(current, reference);
  let decision = 'mismatch';
  if (similarity >= threshold) decision = 'allow';
  else if (similarity >= getFaceMatchUncertainFloor(threshold)) decision = 'uncertain';
  console.log('[faceIdentity]', {
    similarity: Number(similarity.toFixed(4)),
    threshold,
    decision,
  });
}

function matchFromDecision(
  decision: FaceGateDecision,
  matched: { embedding: number[]; faceBox: FaceBoxNorm },
  reference: ResolvedReference,
  expectedVersion: string,
): FaceMatchResult {
  if (decision.action === 'allow') {
    // Hard reject near-perfect self-match bugs only if arrays are the same reference
    // (poisoned cache). Distinct copies with high similarity are fine (same person).
    if (matched.embedding === reference.embedding) {
      throw new FaceIdentityError(FACE_IDENTITY_MISMATCH_MESSAGE);
    }
    return {
      embedding: matched.embedding,
      modelVersion: expectedVersion,
      faceBox: matched.faceBox,
    };
  }
  if (decision.action === 'need_enroll') {
    throw new FaceIdentityError(FACE_IDENTITY_NEED_ENROLL_MESSAGE);
  }
  if (decision.reason === 'uncertain') {
    throw new FaceIdentityError(FACE_IDENTITY_UNCERTAIN_MESSAGE);
  }
  throw new FaceIdentityError(FACE_IDENTITY_MISMATCH_MESSAGE);
}

/**
 * Identity match against the enrolled reference.
 * Fail-closed: never treat face detection alone as identity.
 */
export async function verifyFaceIdentity(uri: string, userId: string): Promise<FaceMatchResult> {
  if (!isFaceIdentityEnabled()) {
    throw new FaceIdentityError(FACE_IDENTITY_UNAVAILABLE_MESSAGE);
  }

  const matched = await computeEmbeddingWithBox(uri);
  if (!matched) {
    throw new FaceIdentityError(FACE_IDENTITY_RETRY_MESSAGE);
  }

  const reference = await loadReferenceOrThrow(userId);
  const expectedVersion = faceModelVersion();
  assertReferenceCompatible(matched.embedding, reference, expectedVersion);

  const threshold = getFaceMatchThreshold();
  logDevDecision(matched.embedding, reference.embedding, threshold);

  const decision = decideFaceGate({
    enabled: true,
    hasReference: true,
    currentEmbedding: matched.embedding,
    referenceEmbedding: reference.embedding,
    threshold,
    uncertainFloor: getFaceMatchUncertainFloor(threshold),
  });
  return matchFromDecision(decision, matched, reference, expectedVersion);
}

async function computeEmbeddingWithBox(
  uri: string,
): Promise<{ embedding: number[]; faceBox: FaceBoxNorm } | null> {
  const pixels = await decodeJpegPixels(uri, EMBED_WIDTH_PX);
  if (!pixels) return null;
  const buffer = {
    data: pixels.data,
    width: pixels.width,
    height: pixels.height,
    channels: 4 as const,
  };
  const faces = await detectFacesFromPixels(buffer);
  if (!faces || faces.length !== 1) return null;
  const face = faces[0]!;
  const embedding = await computeFaceEmbedding(buffer, landmarkFromDetected(face));
  if (!embedding) return null;
  return {
    embedding,
    faceBox: {
      xMin: face.box.xMin / pixels.width,
      yMin: face.box.yMin / pixels.height,
      width: face.box.width / pixels.width,
      height: face.box.height / pixels.height,
    },
  };
}
