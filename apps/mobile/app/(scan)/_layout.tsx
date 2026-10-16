import { Redirect, Stack } from 'expo-router';

import { useSession } from '@/src/features/session/SessionContext';

export default function ScanLayout() {
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

  return <Stack screenOptions={{ headerShown: false }} />;
}
