import AsyncStorage from '@react-native-async-storage/async-storage';

import { faceModelVersion } from './faceEmbedder';

/**
 * Local cache of the current user's reference embedding so identity checks don't
 * hit the network every scan. Stored under a single key with the owning userId
 * so it can never be read by a different account (and is cleared on logout).
 */
const KEY = 'dermis.faceRef.v1';

type CachedFaceRef = {
  userId: string;
  embedding: number[];
  modelVersion: string;
};

export async function readCachedFaceReference(userId: string): Promise<number[] | null> {
  const raw = await AsyncStorage.getItem(KEY);
  if (!raw) {
    return null;
  }
  try {
    const parsed = JSON.parse(raw) as Partial<CachedFaceRef>;
    if (
      parsed.userId !== userId ||
      !Array.isArray(parsed.embedding) ||
      parsed.embedding.length === 0
    ) {
      return null;
    }
    // Drop cache from an older embedding pipeline so we never match with bad vectors.
    if (parsed.modelVersion !== faceModelVersion()) {
      await AsyncStorage.removeItem(KEY);
      return null;
    }
    return parsed.embedding;
  } catch {
    return null;
  }
}

export async function writeCachedFaceReference(userId: string, embedding: number[]): Promise<void> {
  const payload: CachedFaceRef = {
    userId,
    embedding,
    modelVersion: faceModelVersion(),
  };
  await AsyncStorage.setItem(KEY, JSON.stringify(payload));
}

export async function clearCachedFaceReference(): Promise<void> {
  await AsyncStorage.removeItem(KEY);
}
