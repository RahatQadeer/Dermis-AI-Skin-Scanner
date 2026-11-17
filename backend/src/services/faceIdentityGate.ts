import { HttpError } from '../http/HttpError';
import { cosineSimilarity, isSameIdentity, resolveFaceMatchThreshold } from '../lib/faceMatch';
import {
  embedScanFace,
  type NormalizedFaceBox,
} from '../lib/serverFaceEmbedder';
import type { FaceReferenceService } from './faceReferenceService';
import type { LivenessChallengeService } from './livenessChallengeService';

export type ScanFaceIdentityClaim = {
  /**
   * Client hint only. Used solely to detect tampering
   * (claim must agree with the embedding of the uploaded JPEG).
   * Never used as the enrolled reference.
   */
  embedding: number[];
  modelVersion: string;
  livenessPassed: boolean;
  livenessChallengeId: string;
  faceBox: NormalizedFaceBox;
};

type EmbedImage = (jpegBytes: Uint8Array, box: NormalizedFaceBox) => Promise<number[] | null>;

export type AssertScanFaceIdentityDeps = {
  faceReferences: FaceReferenceService;
  liveness: LivenessChallengeService;
  /**
   * Optional inject for tests. MUST derive from jpegBytes (never from client claim).
   * Production uses MobileFaceNet on the JPEG pixels.
   */
  embedImage?: EmbedImage;
  /** Optional override of the identity match threshold (defaults to env/config). */
  threshold?: number;
};

/**
 * Claim must look like the uploaded photo — blocks sending the enrolled vector
 * with someone else's JPEG. Tuned below typical same-person client↔server
 * agreement; still far above typical different-person cosine.
 */
const CLAIM_BIND_THRESHOLD = 0.7;

export type FaceIdentityDebug = {
  userIdPrefix: string;
  enrollmentModelVersion: string | null;
  hasEnrollmentJpeg: boolean;
  hasEnrollmentEmbedding: boolean;
  hasScanEmbedding: boolean;
  claimBindSimilarity: number | null;
  identitySimilarity: number | null;
  threshold: number;
  decision: 'allow' | 'reject';
  reason: string;
};

type GateCtx = { userId: string; threshold: number };
type GateState = Omit<FaceIdentityDebug, 'userIdPrefix' | 'threshold' | 'decision' | 'reason'>;
type Enrollment = {
  modelVersion: string;
  referenceJpeg: string;
  faceBox: NormalizedFaceBox;
};
type ScanEvidence = { embedding: number[]; claimBind: number };

const EMPTY_STATE: GateState = {
  enrollmentModelVersion: null,
  hasEnrollmentJpeg: false,
  hasEnrollmentEmbedding: false,
  hasScanEmbedding: false,
  claimBindSimilarity: null,
  identitySimilarity: null,
};

function logDecision(
  ctx: GateCtx,
  state: GateState,
  decision: FaceIdentityDebug['decision'],
  reason: string,
): void {
  console.info('[faceIdentityGate]', {
    userIdPrefix: ctx.userId.slice(0, 8),
    ...state,
    threshold: ctx.threshold,
    decision,
    reason,
  });
}

/** Log a reject decision and throw — every failure path is fail-closed. */
function rejectGate(
  ctx: GateCtx,
  state: Partial<GateState>,
  reason: string,
  error: HttpError,
): never {
  logDecision(ctx, { ...EMPTY_STATE, ...state }, 'reject', reason);
  throw error;
}

function enrolledState(enrollment: Enrollment): Partial<GateState> {
  return {
    enrollmentModelVersion: enrollment.modelVersion,
    hasEnrollmentJpeg: true,
    hasEnrollmentEmbedding: true,
  };
}

function round4(value: number): number {
  return Number(value.toFixed(4));
}

function requireLiveness(
  deps: AssertScanFaceIdentityDeps,
  ctx: GateCtx,
  claim: ScanFaceIdentityClaim,
): void {
  if (!claim.livenessPassed) {
    rejectGate(ctx, {}, 'liveness_flag_false', new HttpError(403, 'face_liveness_required'));
  }
  deps.liveness.consumeCompleted(ctx.userId, claim.livenessChallengeId);
}

async function loadEnrollment(
  deps: AssertScanFaceIdentityDeps,
  ctx: GateCtx,
  claim: ScanFaceIdentityClaim,
): Promise<Enrollment> {
  const record = await deps.faceReferences.get(ctx.userId);
  if (!record || record.embedding.length === 0) {
    return rejectGate(
      ctx,
      {},
      'no_enrollment_record',
      new HttpError(403, 'face_reference_required'),
    );
  }
  if (!record.referenceJpeg || !record.faceBox) {
    return rejectGate(
      ctx,
      { enrollmentModelVersion: record.modelVersion, hasEnrollmentEmbedding: true },
      'missing_enrollment_jpeg',
      new HttpError(
        403,
        'face_model_mismatch',
        'Re-register your face in Profile so we can save your selfie for matching.',
      ),
    );
  }
  const enrollment: Enrollment = {
    modelVersion: record.modelVersion,
    referenceJpeg: record.referenceJpeg,
    faceBox: record.faceBox,
  };
  if (record.modelVersion !== claim.modelVersion) {
    rejectGate(
      ctx,
      enrolledState(enrollment),
      'model_version_mismatch',
      new HttpError(403, 'face_model_mismatch'),
    );
  }
  return enrollment;
}

/** Scan identity from UPLOADED PIXELS only, then bind the client claim to it. */
async function embedAndBindScan(
  embed: EmbedImage,
  ctx: GateCtx,
  enrollment: Enrollment,
  input: { claim: ScanFaceIdentityClaim; jpegBytes: Uint8Array },
): Promise<ScanEvidence> {
  const { claim, jpegBytes } = input;
  const base = enrolledState(enrollment);
  const scanEmbedding = await embed(jpegBytes, claim.faceBox);
  if (!scanEmbedding || scanEmbedding.length === 0) {
    return rejectGate(
      ctx,
      base,
      'scan_embed_unavailable',
      new HttpError(503, 'face_recognition_unavailable'),
    );
  }

  // Anti-tamper: client claim must describe THIS jpeg, not the enrolled vector.
  const scanState = { ...base, hasScanEmbedding: true };
  if (claim.embedding.length !== scanEmbedding.length) {
    rejectGate(
      ctx,
      scanState,
      'client_claim_dim_mismatch',
      new HttpError(403, 'face_identity_mismatch'),
    );
  }
  const claimBind = cosineSimilarity(scanEmbedding, claim.embedding);
  if (claimBind < CLAIM_BIND_THRESHOLD) {
    rejectGate(
      ctx,
      { ...scanState, claimBindSimilarity: round4(claimBind) },
      'client_claim_not_bound_to_scan_pixels',
      new HttpError(403, 'face_identity_mismatch'),
    );
  }
  return { embedding: scanEmbedding, claimBind };
}

/** Enrollment identity from SAVED SELFIE PIXELS (same model). */
async function embedEnrollment(
  embed: EmbedImage,
  ctx: GateCtx,
  enrollment: Enrollment,
  scan: ScanEvidence,
): Promise<number[]> {
  const claimBindSimilarity = round4(scan.claimBind);
  const refBytes = decodeBase64Jpeg(enrollment.referenceJpeg);
  if (!refBytes) {
    return rejectGate(
      ctx,
      {
        enrollmentModelVersion: enrollment.modelVersion,
        hasEnrollmentEmbedding: true,
        hasScanEmbedding: true,
        claimBindSimilarity,
      },
      'enrollment_jpeg_decode_failed',
      new HttpError(403, 'face_reference_required'),
    );
  }
  const enrolledEmbedding = await embed(refBytes, enrollment.faceBox);
  if (!enrolledEmbedding || enrolledEmbedding.length === 0) {
    return rejectGate(
      ctx,
      {
        enrollmentModelVersion: enrollment.modelVersion,
        hasEnrollmentJpeg: true,
        hasScanEmbedding: true,
        claimBindSimilarity,
      },
      'enrollment_embed_unavailable',
      new HttpError(503, 'face_recognition_unavailable'),
    );
  }
  return enrolledEmbedding;
}

function assertComparable(
  ctx: GateCtx,
  enrollment: Enrollment,
  vectors: { scan: ScanEvidence; enrolled: number[] },
): void {
  const state = {
    ...enrolledState(enrollment),
    hasScanEmbedding: true,
    claimBindSimilarity: round4(vectors.scan.claimBind),
  };
  if (vectors.enrolled.length !== vectors.scan.embedding.length) {
    rejectGate(ctx, state, 'embedding_dim_mismatch', new HttpError(403, 'face_identity_mismatch'));
  }
  // Never compare an embedding to itself by reference alias.
  if (vectors.scan.embedding === vectors.enrolled) {
    rejectGate(
      ctx,
      state,
      'scan_embedding_aliased_to_enrollment',
      new HttpError(403, 'face_identity_mismatch'),
    );
  }
}

function decideIdentity(
  ctx: GateCtx,
  enrollment: Enrollment,
  vectors: { scan: ScanEvidence; enrolled: number[] },
): void {
  const allow = isSameIdentity(vectors.scan.embedding, vectors.enrolled, ctx.threshold);
  const identitySimilarity = cosineSimilarity(vectors.scan.embedding, vectors.enrolled);
  logDecision(
    ctx,
    {
      ...EMPTY_STATE,
      ...enrolledState(enrollment),
      hasScanEmbedding: true,
      claimBindSimilarity: round4(vectors.scan.claimBind),
      identitySimilarity: round4(identitySimilarity),
    },
    allow ? 'allow' : 'reject',
    allow ? 'identity_match' : 'identity_mismatch',
  );
  if (!allow) {
    throw new HttpError(403, 'face_identity_mismatch');
  }
}

/**
 * ONLY the enrolled face for this authenticated userId may scan.
 *
 * Flow:
 * 1) Consume liveness for this user
 * 2) Load enrollment JPEG + box for this userId (RLS/owner scoped by caller)
 * 3) Embed scan JPEG pixels
 * 4) Embed enrollment JPEG pixels (same model)
 * 5) Bind client claim to scan pixels (anti-tamper)
 * 6) Compare scan vs enrollment — never scan vs scan, never claim as enrollment
 */
export async function assertScanFaceIdentity(
  deps: AssertScanFaceIdentityDeps,
  userId: string,
  claim: ScanFaceIdentityClaim,
  jpegBytes: Uint8Array,
): Promise<void> {
  const ctx: GateCtx = { userId, threshold: deps.threshold ?? resolveFaceMatchThreshold() };
  requireLiveness(deps, ctx, claim);
  const enrollment = await loadEnrollment(deps, ctx, claim);
  const embed: EmbedImage =
    deps.embedImage ??
    ((bytes, box) => embedScanFace({ jpegBytes: bytes, box }));

  const scan = await embedAndBindScan(embed, ctx, enrollment, { claim, jpegBytes });
  const enrolled = await embedEnrollment(embed, ctx, enrollment, scan);
  const vectors = { scan, enrolled };
  assertComparable(ctx, enrollment, vectors);
  decideIdentity(ctx, enrollment, vectors);
}

function decodeBase64Jpeg(raw: string): Uint8Array | null {
  const trimmed = raw.replace(/^data:image\/\w+;base64,/, '').trim();
  if (trimmed.length < 32) return null;
  try {
    return Uint8Array.from(Buffer.from(trimmed, 'base64'));
  } catch {
    return null;
  }
}
