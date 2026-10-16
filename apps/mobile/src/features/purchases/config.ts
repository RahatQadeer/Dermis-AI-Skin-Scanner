import { Platform } from 'react-native';

function readEnv(key: string): string {
  return (process.env[key] ?? '').trim();
}

export function revenueCatApiKey(): string | null {
  if (Platform.OS === 'ios') {
    return (
      readEnv('EXPO_PUBLIC_REVENUECAT_IOS_API_KEY') ||
      readEnv('EXPO_PUBLIC_REVENUECAT_API_KEY') ||
      null
    );
  }
  if (Platform.OS === 'android') {
    return (
      readEnv('EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY') ||
      readEnv('EXPO_PUBLIC_REVENUECAT_API_KEY') ||
      null
    );
  }
  return null;
}

/** Native store billing via RevenueCat — not available on web. */
export function isNativePurchasesEnabled(): boolean {
  return Platform.OS !== 'web' && revenueCatApiKey() !== null;
}
