import { useEffect } from 'react';

import { getCopy } from '@/src/copy';
import {
  clearQuizDraft,
  loadCompletedQuizDraft,
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
  hydrated: boolean;
  onboardingComplete: boolean;
  setSkinProfileStatus: (v: SkinProfileStatus) => void;
  setOnboardingComplete: (v: boolean) => void;
};

function isConflict(err: unknown): boolean {
  return isApiError(err) && (err.status === 409 || err.code === 'profile_exists');
}

/** Flushes a stored pre-auth quiz draft to the backend. Returns true if saved. */
async function flushPendingQuizDraft(): Promise<boolean> {
  const draft = await loadCompletedQuizDraft();
  const payload = draft ? quizDraftToSkinProfile(draft, getCopy().quiz) : null;
  if (!payload) {
    return false;
  }
  try {
    await createProfile(payload);
  } catch (err) {
    if (!isConflict(err)) {
      throw err;
    }
  }
  await clearQuizDraft();
  return true;
}

async function resolveStatus(
  onboardingComplete: boolean,
  apply: (status: SkinProfileStatus) => void,
): Promise<void> {
  try {
    const profile = await fetchProfile();
    if (profileHasSkinData(profile)) {
      await clearQuizDraft();
      apply('complete');
      return;
    }
    const flushed = await flushPendingQuizDraft();
    apply(flushed ? 'complete' : 'incomplete');
  } catch {
    // Fail open: never lock a user out because the profile fetch failed.
    apply(onboardingComplete ? 'complete' : 'incomplete');
  }
}

/**
 * Resolves whether the signed-in user has completed the skin assessment, using
 * the backend profile as the source of truth (not just the local flag). This
 * prevents existing users from being re-onboarded after logout/login, keeps
 * onboarding per-user correct on shared devices, and flushes a pre-auth quiz
 * draft to `POST /v1/profile` on first login so answers are saved permanently.
 */
export function useSessionProfileSync(ctx: ProfileSyncCtx): void {
  const { accessToken, hydrated } = ctx;

  useEffect(() => {
    if (!hydrated) {
      return;
    }
    if (!accessToken) {
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
    void resolveStatus(ctx.onboardingComplete, apply);

    return () => {
      cancelled = true;
    };
    // Re-run only when the authenticated identity changes; onboardingComplete is
    // read as a fallback and must not retrigger the sync.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken, hydrated]);
}
