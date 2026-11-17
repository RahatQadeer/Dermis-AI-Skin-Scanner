/**
 * Per-user face identity reference.
 * Stores embedding + enrolled selfie JPEG so the server can compare
 * register photo vs scan photo with the same embedder.
 * `enrollmentId` rotates when the user adds a new face (old scan history kept).
 */
export type FaceBoxNorm = {
  xMin: number;
  yMin: number;
  width: number;
  height: number;
};

export type FaceReferenceRecord = {
  userId: string;
  /** Active face series — stamped onto new scans. */
  enrollmentId: string;
  embedding: number[];
  dim: number;
  modelVersion: string;
  /** Base64 JPEG (no data: prefix) of the enrolled face. */
  referenceJpeg: string | null;
  faceBox: FaceBoxNorm | null;
  registeredAt: string;
  updatedAt: string;
};

export type FaceReferenceWriteInput = {
  embedding: number[];
  dim: number;
  modelVersion: string;
  referenceJpeg: string;
  faceBox: FaceBoxNorm;
  /** When set, becomes the active enrollment series id. */
  enrollmentId: string;
};

export type FaceReferenceRepository = {
  findByUserId: (userId: string) => Promise<FaceReferenceRecord | null>;
  upsert: (userId: string, data: FaceReferenceWriteInput) => Promise<FaceReferenceRecord>;
  deleteByUserId: (userId: string) => Promise<boolean>;
};
