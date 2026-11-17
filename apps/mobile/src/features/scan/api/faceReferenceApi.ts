import { getApiClient } from '@/src/lib/api/client';

export type FaceReferenceDto = {
  enrolled: boolean;
  enrollmentId?: string | null;
  embedding?: number[];
  dim?: number;
  modelVersion?: string;
  registeredAt?: string | null;
};

export type FaceBoxNorm = {
  xMin: number;
  yMin: number;
  width: number;
  height: number;
};

/** Status-only by default. Pass includeEmbedding to sync the on-device cache. */
export async function fetchFaceReference(includeEmbedding = false): Promise<FaceReferenceDto> {
  const q = includeEmbedding ? '?includeEmbedding=1' : '';
  const res = await getApiClient().get<{ reference: FaceReferenceDto }>(`/v1/face-reference${q}`);
  return res.reference;
}

/** Enrolls the reference selfie + embedding. 409 if already enrolled (without replace/addFace). */
export async function registerFaceReference(input: {
  embedding: number[];
  modelVersion: string;
  imageBase64: string;
  faceBox: FaceBoxNorm;
  replace?: boolean;
  addFace?: boolean;
  currentFaceEmbedding?: number[];
}): Promise<FaceReferenceDto> {
  const res = await getApiClient().post<{ reference: FaceReferenceDto }>('/v1/face-reference', {
    embedding: input.embedding,
    modelVersion: input.modelVersion,
    imageBase64: input.imageBase64,
    faceBox: input.faceBox,
    ...(input.replace ? { replace: true } : {}),
    ...(input.addFace ? { addFace: true } : {}),
    ...(input.currentFaceEmbedding ? { currentFaceEmbedding: input.currentFaceEmbedding } : {}),
  });
  return res.reference;
}
