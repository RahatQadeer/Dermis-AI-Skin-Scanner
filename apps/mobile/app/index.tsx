import { Redirect } from 'expo-router';

import { useSession } from '@/src/features/session/SessionContext';

/**
 * Product entry (SCREENS.md):
 * Splash → Welcome → Quiz → Summary → Sign up / Log in → Paywall → Home.
 */
export default function RootIndex() {
  const session = useSession();

  if (!session.hydrated) {
    return null;
  }

  if (!session.onboardingComplete) {
    return <Redirect href="/welcome" />;
  }

  if (!session.accessToken) {
    return <Redirect href="/sign-up" />;
  }

  return <Redirect href="/(tabs)/home" />;
}
