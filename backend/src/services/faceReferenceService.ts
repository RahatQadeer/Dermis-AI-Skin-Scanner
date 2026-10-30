import { HttpError } from '../http/HttpError';
import type {
  FaceReferenceRecord,
  FaceReferenceRepository,
  FaceReferenceWriteInput,
} from '../repositories/faceReferenceTypes';

export type FaceReferenceStatus = {
  enrolled: boolean;
  dim: number | null;
  modelVersion: string | null;
  registeredAt: string | null;
};

export type FaceReferenceService = {
  /** Lightweight enrollment check (no embedding). */
  status: (userId: string) => Promise<FaceReferenceStatus>;
  /** Full record incl. embedding, for on-device matching. */
  get: (userId: string) => Promise<FaceReferenceRecord | null>;
  register: (
    userId: string,
    input: FaceReferenceWriteInput,
    opts?: { replace?: boolean },
  ) => Promise<FaceReferenceRecord>;
};

export function toFaceReferenceStatus(record: FaceReferenceRecord | null): FaceReferenceStatus {
  if (!record) {
    return { enrolled: false, dim: null, modelVersion: null, registeredAt: null };
  }
  return {
    enrolled: true,
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
      const existing = await repo.findByUserId(userId);
      if (existing && !opts?.replace) {
        // Enrollment is one-time; replacing requires an explicit opt-in so a
        // second person can't silently overwrite the registered identity.
        throw new HttpError(409, 'face_reference_exists');
      }
      return repo.upsert(userId, input);
    },
  };
}
