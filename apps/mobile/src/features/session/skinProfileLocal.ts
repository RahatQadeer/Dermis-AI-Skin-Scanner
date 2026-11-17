import AsyncStorage from '@react-native-async-storage/async-storage';

function key(userId: string): string {
  return `dermis.skinProfile.complete.v1.${userId}`;
}

/** Soft local flag so a flaky network does not trap a returning user on the quiz. */
export async function loadLocalSkinProfileComplete(userId: string): Promise<boolean> {
  return (await AsyncStorage.getItem(key(userId))) === '1';
}

export async function saveLocalSkinProfileComplete(
  userId: string,
  complete: boolean,
): Promise<void> {
  if (complete) {
    await AsyncStorage.setItem(key(userId), '1');
  } else {
    await AsyncStorage.removeItem(key(userId));
  }
}
