import { Redirect } from 'expo-router';

import { FullScreenLoader } from '@/src/components/layout/FullScreenLoader';
import { resolveAuthedRoute } from '@/src/features/session/authRoute';
import { useSession } from '@/src/features/session/SessionContext';

/**
 * Product entry (SCREENS.md):
 * Splash → Welcome → Quiz → Summary → Sign up / Log in → Paywall → Home.
 *
 * Authenticated users are routed by backend skin-profile completeness so a
 * returning user is never re-onboarded and an unonboarded one still completes
 * the quiz.
 */
export default function RootIndex() {
  const session = useSession();

  if (!session.hydrated) {
    return null;
  }

  if (!session.accessToken) {
    return <Redirect href={session.onboardingComplete ? '/sign-up' : '/welcome'} />;
  }

  const route = resolveAuthedRoute(session.skinProfileStatus);
  if (!route) {
    return <FullScreenLoader />;
  }
  return <Redirect href={route} />;
}
