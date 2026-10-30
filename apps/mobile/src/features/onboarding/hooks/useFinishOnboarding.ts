import { useRouter } from 'expo-router';
import { useCallback, useState } from 'react';

import { getCopy } from '@/src/copy';
import { createProfile } from '@/src/features/profile/api/profileApi';
import { useSession } from '@/src/features/session/SessionContext';
import { isApiError } from '@/src/lib/api/errors';

import { clearQuizDraft, saveQuizDraft } from '../lib/quizDraftStorage';
import { quizDraftToSkinProfile, type QuizDraft } from '../lib/quizLogic';

function isProfileConflict(err: unknown): boolean {
  return isApiError(err) && (err.status === 409 || err.code === 'profile_exists');
}

export type FinishOnboardingResult = {
  finish: () => Promise<void>;
  errorMessage: string | null;
  clearError: () => void;
  saving: boolean;
};

/** Persists the assessment for an already-authenticated user (post-auth quiz). */
async function persistAuthedProfile(draft: QuizDraft, userId: string): Promise<'ok' | 'error'> {
  const payload = quizDraftToSkinProfile(draft, getCopy().quiz);
  if (!payload) {
    return 'error';
  }
  try {
    await createProfile(payload);
    await clearQuizDraft(userId);
    return 'ok';
  } catch (err) {
    if (isProfileConflict(err)) {
      await clearQuizDraft(userId);
      return 'ok';
    }
    return 'error';
  }
}

/**
 * Finishes the skin-profile quiz. The draft is always saved locally first so the
 * answers survive navigation. When authenticated, they are written to the
 * backend; mark complete only after a successful save.
 */
export function useFinishOnboarding(draft: QuizDraft): FinishOnboardingResult {
  const router = useRouter();
  const session = useSession();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const finish = useCallback(async () => {
    setErrorMessage(null);
    await saveQuizDraft(draft, session.userId);
    if (session.accessToken && session.apiEnabled && session.userId) {
      setSaving(true);
      const result = await persistAuthedProfile(draft, session.userId);
      setSaving(false);
      if (result !== 'ok') {
        setErrorMessage(getCopy().quiz.saveError);
        return;
      }
      session.markSkinProfileComplete();
      router.replace('/(tabs)/home');
      return;
    }
    session.markOnboardingComplete();
    router.replace('/sign-up');
  }, [draft, router, session]);

  return {
    finish,
    errorMessage,
    clearError: () => setErrorMessage(null),
    saving,
  };
}
