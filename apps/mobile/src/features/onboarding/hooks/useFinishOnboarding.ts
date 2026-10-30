import { useRouter } from 'expo-router';
import { useCallback } from 'react';

import { getCopy } from '@/src/copy';
import { createProfile } from '@/src/features/profile/api/profileApi';
import { useSession } from '@/src/features/session/SessionContext';
import { isApiError } from '@/src/lib/api/errors';

import { clearQuizDraft, saveQuizDraft } from '../lib/quizDraftStorage';
import { quizDraftToSkinProfile, type QuizDraft } from '../lib/quizLogic';

function isProfileConflict(err: unknown): boolean {
  return isApiError(err) && (err.status === 409 || err.code === 'profile_exists');
}

/** Persists the assessment for an already-authenticated user (post-auth quiz). */
async function persistAuthedProfile(draft: QuizDraft): Promise<void> {
  const payload = quizDraftToSkinProfile(draft, getCopy().quiz);
  if (!payload) {
    return;
  }
  try {
    await createProfile(payload);
    await clearQuizDraft();
  } catch (err) {
    // 409 = already saved; otherwise leave the draft for the post-login sync.
    if (isProfileConflict(err)) {
      await clearQuizDraft();
    }
  }
}

/**
 * Finishes the skin-profile quiz. The draft is always saved locally first so the
 * answers survive navigation. When authenticated, they are written to the
 * backend and the user continues into the app; otherwise the user goes to
 * sign-up and the post-login sync flushes the draft.
 */
export function useFinishOnboarding(draft: QuizDraft): () => Promise<void> {
  const router = useRouter();
  const session = useSession();

  return useCallback(async () => {
    await saveQuizDraft(draft);
    if (session.accessToken && session.apiEnabled) {
      await persistAuthedProfile(draft);
      session.markSkinProfileComplete();
      router.replace('/(tabs)/home');
      return;
    }
    session.markOnboardingComplete();
    router.replace('/sign-up');
  }, [draft, router, session]);
}
