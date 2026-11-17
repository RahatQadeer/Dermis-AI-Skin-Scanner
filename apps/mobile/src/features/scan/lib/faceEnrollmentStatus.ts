import AsyncStorage from '@react-native-async-storage/async-storage';

import { fetchFaceReference, type FaceReferenceDto } from '../api/faceReferenceApi';
import { isFaceIdentityEnabled } from './faceConfig';
import { faceModelVersion } from './faceEmbedder';
import { readCachedFaceReference, writeCachedFaceReference } from './faceReferenceCache';

const ENROLLED_KEY = 'dermis.faceEnrolled.v1';

type EnrolledFlag = { userId: string; enrolled: true };

/** Sync memory so the next screen never re-prompts before AsyncStorage settles. */
const enrolledMemory = new Set<string>();

/** Local “already registered” flag so we never bounce users back to enroll after success. */
export async function markFaceEnrolledLocally(userId: string): Promise<void> {
  enrolledMemory.add(userId);
  const payload: EnrolledFlag = { userId, enrolled: true };
  await AsyncStorage.setItem(ENROLLED_KEY, JSON.stringify(payload));
}

export async function clearFaceEnrolledLocally(): Promise<void> {
  enrolledMemory.clear();
  await AsyncStorage.removeItem(ENROLLED_KEY);
}

export async function isFaceEnrolledLocally(userId: string): Promise<boolean> {
  if (enrolledMemory.has(userId)) {
    return true;
  }
  const raw = await AsyncStorage.getItem(ENROLLED_KEY);
  if (!raw) {
    return false;
  }
  try {
    const parsed = JSON.parse(raw) as Partial<EnrolledFlag>;
    const ok = parsed.userId === userId && parsed.enrolled === true;
    if (ok) {
      enrolledMemory.add(userId);
    }
    return ok;
  } catch {
    return false;
  }
}

async function acceptServerReference(userId: string, dto: FaceReferenceDto): Promise<boolean> {
  if (!dto.enrolled || !Array.isArray(dto.embedding) || dto.embedding.length === 0) {
    // Server says enrolled but sent no vector — cannot verify; force re-enroll.
    return false;
  }
  // Old preprocess embeddings must not unlock the camera — force re-enroll.
  if (dto.modelVersion && dto.modelVersion !== faceModelVersion()) {
    return false;
  }
  await writeCachedFaceReference(userId, dto.embedding);
  await markFaceEnrolledLocally(userId);
  return true;
}

async function enrolledOnServer(userId: string): Promise<boolean> {
  try {
    const dto = await fetchFaceReference(true);
    return await acceptServerReference(userId, dto);
  } catch {
    // Offline: only trust a real cached embedding, never the flag alone.
    return false;
  }
}

/**
 * True only when this account has a usable face embedding (not just a flag).
 * Prevents “enrolled” state that would skip enroll while verify has nothing to match.
 */
export async function resolveFaceEnrolled(userId: string): Promise<boolean> {
  if (!isFaceIdentityEnabled()) {
    return true;
  }

  const cached = await readCachedFaceReference(userId);
  if (cached && cached.length > 0) {
    await markFaceEnrolledLocally(userId);
    return true;
  }

  return enrolledOnServer(userId);
}
