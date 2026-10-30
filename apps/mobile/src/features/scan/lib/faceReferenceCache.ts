import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Local cache of the current user's reference embedding so identity checks don't
 * hit the network every scan. Stored under a single key with the owning userId
 * so it can never be read by a different account (and is cleared on logout).
 */
const KEY = 'dermis.faceRef.v1';

export async function readCachedFaceReference(userId: string): Promise<number[] | null> {
  const raw = await AsyncStorage.getItem(KEY);
  if (!raw) {
    return null;
  }
  try {
    const parsed = JSON.parse(raw) as { userId?: string; embedding?: unknown };
    if (parsed.userId === userId && Array.isArray(parsed.embedding)) {
      return parsed.embedding as number[];
    }
    return null;
  } catch {
    return null;
  }
}

export async function writeCachedFaceReference(userId: string, embedding: number[]): Promise<void> {
  await AsyncStorage.setItem(KEY, JSON.stringify({ userId, embedding }));
}

export async function clearCachedFaceReference(): Promise<void> {
  await AsyncStorage.removeItem(KEY);
}
