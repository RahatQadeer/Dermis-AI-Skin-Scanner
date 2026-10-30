import AsyncStorage from '@react-native-async-storage/async-storage';

import { emptyQuizDraft, isQuizDraftComplete, type QuizDraft } from './quizLogic';

const PRE_AUTH_KEY = 'dermis.onboarding.quizDraft.v1';

function userDraftKey(userId: string): string {
  return `dermis.onboarding.quizDraft.v1.${userId}`;
}

/**
 * Persists quiz answers. Pre-auth uses a device key; after auth, prefer a
 * user-scoped key so logout does not wipe an unflushed draft for that user.
 */
export async function saveQuizDraft(draft: QuizDraft, userId?: string | null): Promise<void> {
  const key = userId ? userDraftKey(userId) : PRE_AUTH_KEY;
  await AsyncStorage.setItem(key, JSON.stringify(draft));
  if (userId) {
    // Migrate off the shared pre-auth slot once we know who the user is.
    await AsyncStorage.removeItem(PRE_AUTH_KEY);
  }
}

/** Clears drafts only after a confirmed server save (or conflict). */
export async function clearQuizDraft(userId?: string | null): Promise<void> {
  await AsyncStorage.removeItem(PRE_AUTH_KEY);
  if (userId) {
    await AsyncStorage.removeItem(userDraftKey(userId));
  }
}

function parseDraft(raw: string | null): QuizDraft | null {
  if (!raw) {
    return null;
  }
  try {
    const parsed = JSON.parse(raw) as Partial<QuizDraft>;
    const draft: QuizDraft = {
      ...emptyQuizDraft(),
      ...parsed,
      priorities: Array.isArray(parsed.priorities) ? parsed.priorities : [],
      ageBand: parsed.ageBand ?? null,
    };
    return isQuizDraftComplete(draft) ? draft : null;
  } catch {
    return null;
  }
}

/** Returns a completed draft for this user (user key first, then pre-auth). */
export async function loadCompletedQuizDraft(userId?: string | null): Promise<QuizDraft | null> {
  if (userId) {
    const owned = parseDraft(await AsyncStorage.getItem(userDraftKey(userId)));
    if (owned) {
      return owned;
    }
  }
  return parseDraft(await AsyncStorage.getItem(PRE_AUTH_KEY));
}
