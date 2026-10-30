import { isUnlockAllFeatures } from '@dermis/domain';
import { Redirect, Stack } from 'expo-router';

import { FullScreenLoader } from '@/src/components/layout/FullScreenLoader';
import { resolveAuthedRoute } from '@/src/features/session/authRoute';
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
    // Route by backend-authoritative profile state so existing users skip the
    // quiz and new users complete it. Hold while the sync resolves.
    const route = resolveAuthedRoute(session.skinProfileStatus);
    if (!route) {
      return <FullScreenLoader />;
    }
    return <Redirect href={route} />;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
