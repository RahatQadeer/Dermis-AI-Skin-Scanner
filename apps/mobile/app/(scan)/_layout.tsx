import { Redirect, Stack } from 'expo-router';

import { FullScreenLoader } from '@/src/components/layout/FullScreenLoader';
import { resolveAuthedRoute } from '@/src/features/session/authRoute';
import { useSession } from '@/src/features/session/SessionContext';

export default function ScanLayout() {
  const session = useSession();

  if (!session.hydrated) {
    return null;
  }
  if (!session.accessToken) {
    return <Redirect href={session.onboardingComplete ? '/sign-up' : '/welcome'} />;
  }
  // Authed: an incomplete backend profile must still finish the quiz first.
  const route = resolveAuthedRoute(session.skinProfileStatus);
  if (!route) {
    return <FullScreenLoader />;
  }
  if (route === '/quiz') {
    return <Redirect href="/quiz" />;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
