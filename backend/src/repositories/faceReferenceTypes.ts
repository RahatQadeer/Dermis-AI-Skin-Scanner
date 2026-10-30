/**
 * Per-user face identity reference. Stores only a non-image embedding vector
 * (computed on-device); the raw face photo is never persisted. Matching happens
 * on-device (approach D2) — this is the durable, account-bound reference.
 */
export type FaceReferenceRecord = {
  userId: string;
  embedding: number[];
  dim: number;
  modelVersion: string;
  registeredAt: string;
  updatedAt: string;
};

export type FaceReferenceWriteInput = {
  embedding: number[];
  dim: number;
  modelVersion: string;
};

export type FaceReferenceRepository = {
  findByUserId: (userId: string) => Promise<FaceReferenceRecord | null>;
  upsert: (userId: string, data: FaceReferenceWriteInput) => Promise<FaceReferenceRecord>;
  deleteByUserId: (userId: string) => Promise<boolean>;
};
