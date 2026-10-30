import { getApiClient } from '@/src/lib/api/client';

export type FaceReferenceDto = {
  enrolled: boolean;
  embedding?: number[];
  dim?: number;
  modelVersion?: string;
  registeredAt?: string | null;
};

/** Reads the signed-in user's reference embedding (for on-device matching). */
export async function fetchFaceReference(): Promise<FaceReferenceDto> {
  const res = await getApiClient().get<{ reference: FaceReferenceDto }>('/v1/face-reference');
  return res.reference;
}

/** Enrolls the reference embedding. 409 if already enrolled (without replace). */
export async function registerFaceReference(
  embedding: number[],
  modelVersion: string,
): Promise<void> {
  await getApiClient().post('/v1/face-reference', { embedding, modelVersion });
}
