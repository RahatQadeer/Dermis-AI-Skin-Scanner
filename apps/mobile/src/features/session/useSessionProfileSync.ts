import { useEffect } from 'react';

import { getCopy } from '@/src/copy';
import {
  clearQuizDraft,
  loadCompletedQuizDraft,
  saveQuizDraft,
} from '@/src/features/onboarding/lib/quizDraftStorage';
import { quizDraftToSkinProfile } from '@/src/features/onboarding/lib/quizLogic';
import {
  createProfile,
  fetchProfile,
  profileHasSkinData,
} from '@/src/features/profile/api/profileApi';
import { isApiEnabled } from '@/src/lib/api/config';
import { isApiError } from '@/src/lib/api/errors';

import { saveOnboardingComplete } from './sessionStorage';
import type { SkinProfileStatus } from './useSessionIdentityState';

type ProfileSyncCtx = {
  accessToken: string | null;
  userId: string | null;
  hydrated: boolean;
  onboardingComplete: boolean;
  setSkinProfileStatus: (v: SkinProfileStatus) => void;
  setOnboardingComplete: (v: boolean) => void;
};

function isConflict(err: unknown): boolean {
  return isApiError(err) && (err.status === 409 || err.code === 'profile_exists');
}

/** Flushes a stored quiz draft to the backend. Returns true if saved. */
async function flushPendingQuizDraft(userId: string): Promise<boolean> {
  const draft = await loadCompletedQuizDraft(userId);
  const payload = draft ? quizDraftToSkinProfile(draft, getCopy().quiz) : null;
  if (!payload) {
    return false;
  }
  // Bind draft to this user before the network call so logout cannot orphan it.
  await saveQuizDraft(draft!, userId);
  try {
    await createProfile(payload);
  } catch (err) {
    if (!isConflict(err)) {
      throw err;
    }
  }
  await clearQuizDraft(userId);
  return true;
}

async function resolveStatus(
  userId: string,
  apply: (status: SkinProfileStatus) => void,
): Promise<void> {
  try {
    const profile = await fetchProfile();
    if (profileHasSkinData(profile)) {
      await clearQuizDraft(userId);
      apply('complete');
      return;
    }
    const flushed = await flushPendingQuizDraft(userId);
    apply(flushed ? 'complete' : 'incomplete');
  } catch {
    // Fail closed on profile completeness: never skip the quiz without a row.
    // A local draft can still flush on the next successful sync.
    apply('incomplete');
  }
}

/**
 * Resolves whether the signed-in user has completed the skin assessment, using
 * the backend profile as the source of truth (not just the local flag).
 */
export function useSessionProfileSync(ctx: ProfileSyncCtx): void {
  const { accessToken, userId, hydrated } = ctx;

  useEffect(() => {
    if (!hydrated) {
      return;
    }
    if (!accessToken || !userId) {
      ctx.setSkinProfileStatus('unknown');
      return;
    }
    if (!isApiEnabled()) {
      ctx.setSkinProfileStatus(ctx.onboardingComplete ? 'complete' : 'incomplete');
      return;
    }

    let cancelled = false;
    ctx.setSkinProfileStatus('unknown');
    const apply = (status: SkinProfileStatus) => {
      if (cancelled) {
        return;
      }
      ctx.setSkinProfileStatus(status);
      if (status === 'complete') {
        ctx.setOnboardingComplete(true);
        void saveOnboardingComplete(true);
      }
    };
    void resolveStatus(userId, apply);

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken, userId, hydrated]);
}
