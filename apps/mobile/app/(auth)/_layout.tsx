import { isUnlockAllFeatures } from '@dermis/domain';
import { Redirect, Stack } from 'expo-router';

import { useSession } from '@/src/features/session/SessionContext';

export default function AuthLayout() {
  const session = useSession();

  if (!session.hydrated) {
    return null;
  }
  if (session.accessToken) {
    // Local unlock-all testing: skip paywall gate.
    if (session.postAuthPaywall && !isUnlockAllFeatures()) {
      return <Redirect href="/paywall" />;
    }
    if (!session.onboardingComplete) {
      return <Redirect href="/quiz" />;
    }
    return <Redirect href="/(tabs)/home" />;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
