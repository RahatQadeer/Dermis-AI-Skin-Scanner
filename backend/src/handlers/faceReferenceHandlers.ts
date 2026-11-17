import { HttpError } from '../http/HttpError';
import { json } from '../http/respond';
import { faceReferenceWriteSchema } from '../schemas/faceReferenceApi';
import type { FaceReferenceRecord } from '../repositories/faceReferenceTypes';
import { toFaceReferenceStatus, type FaceReferenceService } from '../services/faceReferenceService';

/**
 * Status-only by default so enrolled vectors/images are not routinely exfiltrated.
 * Pass ?includeEmbedding=1 for the authenticated owner to sync on-device cache.
 */
function toFaceReferenceDto(record: FaceReferenceRecord, includeEmbedding: boolean) {
  if (!includeEmbedding) {
    return toFaceReferenceStatus(record);
  }
  return {
    enrolled: true as const,
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
  url: URL,
): Promise<Response> {
  const record = await service.get(userId);
  if (!record) {
    return json({ reference: toFaceReferenceStatus(null) });
  }
  const includeEmbedding = url.searchParams.get('includeEmbedding') === '1';
  return json({ reference: toFaceReferenceDto(record, includeEmbedding) });
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
  const { embedding, modelVersion, imageBase64, faceBox, replace, addFace, currentFaceEmbedding } =
    parsed.data;
  const record = await service.register(
    userId,
    {
      embedding,
      dim: embedding.length,
      modelVersion,
      referenceJpeg: imageBase64.replace(/^data:image\/\w+;base64,/, ''),
      faceBox,
    },
    { replace, addFace, currentFaceEmbedding },
  );
  return json(
    {
      reference: {
        enrolled: true,
        enrollmentId: record.enrollmentId,
        embedding: record.embedding,
        dim: record.dim,
        modelVersion: record.modelVersion,
        registeredAt: record.registeredAt,
        updatedAt: record.updatedAt,
      },
    },
    201,
  );
}
