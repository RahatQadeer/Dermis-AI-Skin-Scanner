import type { FaceReferenceRecord, FaceReferenceRepository } from './faceReferenceTypes';

/** In-memory face reference store (tests + memory backend). */
export function createMemoryFaceReferenceRepository(): FaceReferenceRepository {
  const rows = new Map<string, FaceReferenceRecord>();

  return {
    async findByUserId(userId) {
      return rows.get(userId) ?? null;
    },
    async upsert(userId, data) {
      const now = new Date().toISOString();
      const existing = rows.get(userId);
      const record: FaceReferenceRecord = {
        userId,
        embedding: data.embedding,
        dim: data.dim,
        modelVersion: data.modelVersion,
        registeredAt: existing?.registeredAt ?? now,
        updatedAt: now,
      };
      rows.set(userId, record);
      return record;
    },
    async deleteByUserId(userId) {
      return rows.delete(userId);
    },
  };
}
