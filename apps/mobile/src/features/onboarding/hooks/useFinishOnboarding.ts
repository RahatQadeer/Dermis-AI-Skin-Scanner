import { useRouter } from 'expo-router';
import { useCallback, useState } from 'react';

import { getCopy } from '@/src/copy';
import { createProfile, patchProfile } from '@/src/features/profile/api/profileApi';
import { useSession } from '@/src/features/session/SessionContext';
import { saveLocalSkinProfileComplete } from '@/src/features/session/skinProfileLocal';
import { isApiError } from '@/src/lib/api/errors';

import { clearQuizDraft, saveQuizDraft } from '../lib/quizDraftStorage';
import { quizDraftToSkinProfile, type QuizDraft } from '../lib/quizLogic';

function isProfileConflict(err: unknown): boolean {
  return isApiError(err) && (err.status === 409 || err.code === 'profile_exists');
}

export type FinishOnboardingResult = {
  finish: () => Promise<void>;
  skip: () => Promise<void>;
  errorMessage: string | null;
  clearError: () => void;
  saving: boolean;
};

async function persistAuthedProfile(draft: QuizDraft, userId: string): Promise<'ok' | 'error'> {
  const payload = quizDraftToSkinProfile(draft, getCopy().quiz);
  if (!payload) {
    return 'error';
  }
  try {
    await createProfile(payload);
  } catch (err) {
    if (!isProfileConflict(err)) {
      try {
        await patchProfile(payload);
      } catch {
        return 'error';
      }
    }
  }
  await clearQuizDraft(userId);
  await saveLocalSkinProfileComplete(userId, true);
  return 'ok';
}

type SessionLike = ReturnType<typeof useSession>;

type FinishAuthedOpts = {
  draft: QuizDraft;
  session: SessionLike;
  router: ReturnType<typeof useRouter>;
  setErrorMessage: (v: string | null) => void;
  setSaving: (v: boolean) => void;
};

async function finishAuthed(opts: FinishAuthedOpts): Promise<void> {
  const { draft, session, router, setErrorMessage, setSaving } = opts;
  if (!session.userId) return;
  setSaving(true);
  await saveQuizDraft(draft, session.userId);
  const result = await persistAuthedProfile(draft, session.userId);
  setSaving(false);
  if (result !== 'ok') {
    setErrorMessage(getCopy().quiz.saveError);
    return;
  }
  session.markSkinProfileComplete();
  router.replace('/(tabs)/home');
}

/**
 * Quiz → real account. Never send a guest (or dead token) to Home — that looked
 * like “account created” while Supabase stayed empty.
 */
export function useFinishOnboarding(draft: QuizDraft): FinishOnboardingResult {
  const router = useRouter();
  const session = useSession();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const continueToSignUp = useCallback(async () => {
    await saveQuizDraft(draft, null);
    if (session.accessToken) {
      session.signOut();
    }
    session.markOnboardingComplete();
    router.replace('/sign-up');
  }, [draft, router, session]);

  const finish = useCallback(async () => {
    setErrorMessage(null);
    const authed = Boolean(session.accessToken && session.apiEnabled && session.userId);
    if (!authed || !session.userId) {
      await continueToSignUp();
      return;
    }
    await finishAuthed({ draft, session, router, setErrorMessage, setSaving });
  }, [continueToSignUp, draft, router, session]);

  const skip = useCallback(async () => {
    setErrorMessage(null);
    const authed = Boolean(session.accessToken && session.apiEnabled && session.userId);
    if (!authed || !session.userId) {
      await continueToSignUp();
      return;
    }
    setSaving(true);
    await saveQuizDraft(draft, session.userId);
    const result = await persistAuthedProfile(draft, session.userId);
    setSaving(false);
    if (result === 'ok') {
      session.markSkinProfileComplete();
      router.replace('/(tabs)/home');
      return;
    }
    await continueToSignUp();
  }, [continueToSignUp, draft, router, session]);

  return {
    finish,
    skip,
    errorMessage,
    clearError: () => setErrorMessage(null),
    saving,
  };
}
