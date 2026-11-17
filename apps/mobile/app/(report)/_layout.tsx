import { Redirect, Stack } from 'expo-router';

import { FullScreenLoader } from '@/src/components/layout/FullScreenLoader';
import { resolveAuthedRoute } from '@/src/features/session/authRoute';
import { loggedOutEntryRoute } from '@/src/features/session/loggedOutEntryRoute';
import { useSession } from '@/src/features/session/SessionContext';

/** Report + recommendations — stack routes (not hidden tabs) so Home CTAs always open. */
export default function ReportLayout() {
  const session = useSession();

  if (!session.hydrated) {
    return null;
  }
  if (!session.accessToken) {
    return <Redirect href={loggedOutEntryRoute(session.onboardingComplete)} />;
  }
  const route = resolveAuthedRoute(session.skinProfileStatus);
  if (!route) {
    return <FullScreenLoader />;
  }
  if (route === '/quiz') {
    return <Redirect href="/quiz" />;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
