import { Redirect, Stack } from 'expo-router';

import { QuizDraftProvider } from '@/src/features/onboarding/state/QuizDraftProvider';
import { useSession } from '@/src/features/session/SessionContext';

/** Welcome / quiz / summary are available before account creation. */
export default function OnboardingLayout() {
  const session = useSession();
  // Returning users with a complete skin profile must not re-enter the quiz.
  if (session.accessToken && session.skinProfileStatus === 'complete') {
    return <Redirect href="/(tabs)/home" />;
  }

  return (
    <QuizDraftProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </QuizDraftProvider>
  );
}
