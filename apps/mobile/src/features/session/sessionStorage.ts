import AsyncStorage from '@react-native-async-storage/async-storage';

const SESSION_KEY = 'dermis.session.v1';
const ONBOARDING_KEY = 'dermis.onboarding.complete.v1';

export type StoredSession = {
  accessToken: string;
  refreshToken: string | null;
  email: string | null;
  userId: string | null;
  firstName: string | null;
};

export async function loadStoredSession(): Promise<StoredSession | null> {
  const raw = await AsyncStorage.getItem(SESSION_KEY);
  if (!raw) {
    return null;
  }
  try {
    const parsed = JSON.parse(raw) as StoredSession;
    if (typeof parsed.accessToken !== 'string' || parsed.accessToken.length === 0) {
      return null;
    }
    return {
      accessToken: parsed.accessToken,
      refreshToken: typeof parsed.refreshToken === 'string' ? parsed.refreshToken : null,
      email: typeof parsed.email === 'string' ? parsed.email : null,
      userId: typeof parsed.userId === 'string' ? parsed.userId : null,
      firstName: typeof parsed.firstName === 'string' ? parsed.firstName : null,
    };
  } catch {
    return null;
  }
}

export async function saveStoredSession(session: StoredSession): Promise<void> {
  await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export async function clearStoredSession(): Promise<void> {
  await AsyncStorage.removeItem(SESSION_KEY);
}

export async function loadOnboardingComplete(): Promise<boolean> {
  const value = await AsyncStorage.getItem(ONBOARDING_KEY);
  return value === '1';
}

export async function saveOnboardingComplete(complete: boolean): Promise<void> {
  if (complete) {
    await AsyncStorage.setItem(ONBOARDING_KEY, '1');
  } else {
    await AsyncStorage.removeItem(ONBOARDING_KEY);
  }
}
