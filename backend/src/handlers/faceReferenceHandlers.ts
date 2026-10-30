import { HttpError } from '../http/HttpError';
import { json } from '../http/respond';
import { faceReferenceWriteSchema } from '../schemas/faceReferenceApi';
import type { FaceReferenceRecord } from '../repositories/faceReferenceTypes';
import { toFaceReferenceStatus, type FaceReferenceService } from '../services/faceReferenceService';

/** Full record (incl. embedding) for the authenticated owner — on-device match. */
function toFaceReferenceDto(record: FaceReferenceRecord) {
  return {
    enrolled: true,
    embedding: record.embedding,
    dim: record.dim,
    modelVersion: record.modelVersion,
    registeredAt: record.registeredAt,
    updatedAt: record.updatedAt,
  };
}

export async function handleGetFaceReference(
  service: FaceReferenceService,
  userId: string,
): Promise<Response> {
  const record = await service.get(userId);
  if (!record) {
    return json({ reference: toFaceReferenceStatus(null) });
  }
  return json({ reference: toFaceReferenceDto(record) });
}

export async function handleRegisterFaceReference(
  service: FaceReferenceService,
  userId: string,
  body: unknown,
): Promise<Response> {
  const parsed = faceReferenceWriteSchema.safeParse(body);
  if (!parsed.success) {
    throw new HttpError(400, 'invalid_body');
  }
  const { embedding, modelVersion, replace } = parsed.data;
  const record = await service.register(
    userId,
    { embedding, dim: embedding.length, modelVersion },
    { replace },
  );
  return json({ reference: toFaceReferenceStatus(record) }, 201);
}
