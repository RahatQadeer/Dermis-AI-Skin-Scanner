import { randomUUID } from 'node:crypto';

import { HttpError } from '../http/HttpError';
import { isSameIdentity, resolveFaceMatchThreshold } from '../lib/faceMatch';
import type {
  FaceReferenceRecord,
  FaceReferenceRepository,
  FaceReferenceWriteInput,
} from '../repositories/faceReferenceTypes';

export type FaceReferenceStatus = {
  enrolled: boolean;
  enrollmentId: string | null;
  dim: number | null;
  modelVersion: string | null;
  registeredAt: string | null;
};

export type FaceReferenceRegisterOpts = {
  /** Same-person photo update — requires proof of the current face. */
  replace?: boolean;
  /**
   * Add a different face for this account. Rotates enrollment id so Progress
   * keeps prior history under the old series (shows a "New face" divider).
   * Does not require matching the previous face.
   */
  addFace?: boolean;
  /** Live embedding of the currently enrolled face — required for replace. */
  currentFaceEmbedding?: number[];
};

export type FaceReferenceService = {
  /** Lightweight enrollment check (no embedding). */
  status: (userId: string) => Promise<FaceReferenceStatus>;
  /** Full record incl. embedding (owner-only; prefer not to expose on GET). */
  get: (userId: string) => Promise<FaceReferenceRecord | null>;
  register: (
    userId: string,
    input: Omit<FaceReferenceWriteInput, 'enrollmentId'>,
    opts?: FaceReferenceRegisterOpts,
  ) => Promise<FaceReferenceRecord>;
};

export function toFaceReferenceStatus(record: FaceReferenceRecord | null): FaceReferenceStatus {
  if (!record) {
    return {
      enrolled: false,
      enrollmentId: null,
      dim: null,
      modelVersion: null,
      registeredAt: null,
    };
  }
  return {
    enrolled: true,
    enrollmentId: record.enrollmentId,
    dim: record.dim,
    modelVersion: record.modelVersion,
    registeredAt: record.registeredAt,
  };
}

export function createFaceReferenceService(repo: FaceReferenceRepository): FaceReferenceService {
  return {
    async status(userId) {
      return toFaceReferenceStatus(await repo.findByUserId(userId));
    },
    get(userId) {
      return repo.findByUserId(userId);
    },
    async register(userId, input, opts) {
      assertEnrollmentPayload(input);
      const existing = await repo.findByUserId(userId);
      const enrollmentId = resolveEnrollmentId(existing, opts);
      assertRegisterAllowed(existing, input, opts);
      return repo.upsert(userId, { ...input, enrollmentId });
    },
  };
}

function assertRegisterAllowed(
  existing: FaceReferenceRecord | null,
  input: Omit<FaceReferenceWriteInput, 'enrollmentId'>,
  opts?: FaceReferenceRegisterOpts,
): void {
  if (!existing || opts?.addFace) {
    return;
  }
  if (opts?.replace) {
    assertReplaceProof(existing, input, opts.currentFaceEmbedding);
    return;
  }
  if (existing.modelVersion === input.modelVersion) {
    throw new HttpError(409, 'face_reference_exists');
  }
  // Pipeline bump — rotate series (old vectors cannot prove identity).
}

function assertEnrollmentPayload(input: Omit<FaceReferenceWriteInput, 'enrollmentId'>): void {
  if (!input.referenceJpeg || input.referenceJpeg.length < 32 || !input.faceBox) {
    throw new HttpError(400, 'invalid_body', 'Enrollment selfie JPEG and face box are required.');
  }
  if (!input.embedding.length || input.dim !== input.embedding.length) {
    throw new HttpError(400, 'invalid_body', 'Enrollment embedding is required.');
  }
}

function resolveEnrollmentId(
  existing: FaceReferenceRecord | null,
  opts?: FaceReferenceRegisterOpts,
): string {
  if (!existing || opts?.addFace) {
    return randomUUID();
  }
  // Same-person replace keeps the series; model-upgrade enroll rotates.
  if (opts?.replace) {
    return existing.enrollmentId;
  }
  return randomUUID();
}

function assertReplaceProof(
  existing: FaceReferenceRecord,
  input: Omit<FaceReferenceWriteInput, 'enrollmentId'>,
  proof: number[] | undefined,
): void {
  const samePipeline = existing.modelVersion === input.modelVersion;
  if (!samePipeline) {
    return;
  }
  if (!proof || proof.length !== existing.embedding.length) {
    throw new HttpError(403, 'face_replace_reauth_required');
  }
  if (!isSameIdentity(proof, existing.embedding, resolveFaceMatchThreshold())) {
    throw new HttpError(403, 'face_identity_mismatch');
  }
}
