import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Bump when local session/quiz flags have caused ghost “logged in” UX without a
 * real Supabase user. Next launch wipes all `dermis.*` keys once.
 */
/** Bump to wipe ghost “still logged in” sessions after Auth users were deleted in Supabase. */
export const LOCAL_DATA_EPOCH = '6';

const EPOCH_KEY = 'dermis.localData.epoch';

/** Removes every Dermis AsyncStorage key (session, quiz drafts, face, consent). */
export async function wipeDermisLocalState(): Promise<void> {
  const keys = await AsyncStorage.getAllKeys();
  const ours = keys.filter((key) => key.startsWith('dermis.'));
  if (ours.length > 0) {
    await AsyncStorage.multiRemove(ours);
  }
}

/**
 * One-shot local reset after broken auth/onboarding builds. Safe to call on
 * every cold start — only wipes when the epoch changes.
 */
export async function ensureFreshLocalDataEpoch(): Promise<void> {
  const current = await AsyncStorage.getItem(EPOCH_KEY);
  if (current === LOCAL_DATA_EPOCH) {
    return;
  }
  await wipeDermisLocalState();
  await AsyncStorage.setItem(EPOCH_KEY, LOCAL_DATA_EPOCH);
}
