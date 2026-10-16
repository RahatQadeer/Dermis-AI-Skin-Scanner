import { Stack } from 'expo-router';

import { QuizDraftProvider } from '@/src/features/onboarding/state/QuizDraftProvider';

/** Welcome / quiz / summary are available before account creation. */
export default function OnboardingLayout() {
  return (
    <QuizDraftProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </QuizDraftProvider>
  );
}
