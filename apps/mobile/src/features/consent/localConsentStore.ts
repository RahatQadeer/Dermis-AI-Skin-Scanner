import AsyncStorage from '@react-native-async-storage/async-storage';

import { LOCAL_FACE_CONSENT_KEY } from './constants';

export async function readLocalFaceConsent(): Promise<boolean> {
  const raw = await AsyncStorage.getItem(LOCAL_FACE_CONSENT_KEY);
  return raw === '1';
}

export async function writeLocalFaceConsent(granted: boolean): Promise<void> {
  if (granted) {
    await AsyncStorage.setItem(LOCAL_FACE_CONSENT_KEY, '1');
    return;
  }
  await AsyncStorage.removeItem(LOCAL_FACE_CONSENT_KEY);
}
