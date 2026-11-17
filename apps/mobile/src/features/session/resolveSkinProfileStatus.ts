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
  patchProfile,
  profileHasSkinData,
  type ProfileDto,
} from '@/src/features/profile/api/profileApi';
import { isApiError } from '@/src/lib/api/errors';

import { loadLocalSkinProfileComplete, saveLocalSkinProfileComplete } from './skinProfileLocal';
import type { SkinProfileStatus } from './useSessionIdentityState';

export type SkinProfileResolveResult = SkinProfileStatus | 'auth_expired';

function isConflict(err: unknown): boolean {
  return isApiError(err) && (err.status === 409 || err.code === 'profile_exists');
}

function isAuthExpired(err: unknown): boolean {
  return isApiError(err) && (err.status === 401 || err.status === 403);
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchProfileResilient(): Promise<ProfileDto> {
  let lastError: unknown;
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      return await fetchProfile();
    } catch (err) {
      lastError = err;
      if (isAuthExpired(err)) {
        throw err;
      }
      await sleep(250 * (attempt + 1));
    }
  }
  throw lastError;
}

async function markComplete(userId: string): Promise<'complete'> {
  await clearQuizDraft(userId);
  await saveLocalSkinProfileComplete(userId, true);
  return 'complete';
}

/** Writes quiz answers to the backend (POST, then PATCH fallback). */
export async function persistSkinProfile(userId: string): Promise<boolean> {
  const draft = await loadCompletedQuizDraft(userId);
  const payload = draft ? quizDraftToSkinProfile(draft, getCopy().quiz) : null;
  if (!payload) {
    return false;
  }
  await saveQuizDraft(draft!, userId);
  try {
    await createProfile(payload);
  } catch (err) {
    if (isConflict(err)) {
      const profile = await fetchProfileResilient();
      if (!profileHasSkinData(profile)) {
        await patchProfile(payload);
      }
    } else {
      await patchProfile(payload);
    }
  }
  await markComplete(userId);
  return true;
}

export async function flushPendingQuizDraft(userId: string): Promise<boolean> {
  try {
    return await persistSkinProfile(userId);
  } catch {
    return false;
  }
}

async function completeFromDraftOrLocal(userId: string): Promise<SkinProfileStatus> {
  try {
    if (await persistSkinProfile(userId)) {
      return 'complete';
    }
  } catch {
    // fall through
  }
  return (await loadLocalSkinProfileComplete(userId)) ? 'complete' : 'incomplete';
}

/**
 * Backend profile is source of truth. Dead sessions → auth_expired (Log in).
 * Network blips with a prior local complete flag → stay complete (no quiz trap).
 */
export async function resolveSkinProfileStatus(userId: string): Promise<SkinProfileResolveResult> {
  try {
    const profile = await fetchProfileResilient();
    if (profileHasSkinData(profile)) {
      return markComplete(userId);
    }
    return completeFromDraftOrLocal(userId);
  } catch (err) {
    if (isAuthExpired(err)) {
      return 'auth_expired';
    }
    const fromDraft = await completeFromDraftOrLocal(userId);
    if (fromDraft === 'complete') {
      return 'complete';
    }
    return 'unknown';
  }
}
