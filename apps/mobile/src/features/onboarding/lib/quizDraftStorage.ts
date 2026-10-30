import AsyncStorage from '@react-native-async-storage/async-storage';

import { emptyQuizDraft, isQuizDraftComplete, type QuizDraft } from './quizLogic';

const QUIZ_DRAFT_KEY = 'dermis.onboarding.quizDraft.v1';

/**
 * Persists the pre-auth quiz answers so they survive navigation to sign-up and
 * can be flushed to the backend once the user is authenticated.
 */
export async function saveQuizDraft(draft: QuizDraft): Promise<void> {
  await AsyncStorage.setItem(QUIZ_DRAFT_KEY, JSON.stringify(draft));
}

export async function clearQuizDraft(): Promise<void> {
  await AsyncStorage.removeItem(QUIZ_DRAFT_KEY);
}

/** Returns a completed draft, or null if absent / partial / malformed. */
export async function loadCompletedQuizDraft(): Promise<QuizDraft | null> {
  const raw = await AsyncStorage.getItem(QUIZ_DRAFT_KEY);
  if (!raw) {
    return null;
  }
  try {
    const parsed = JSON.parse(raw) as Partial<QuizDraft>;
    const draft: QuizDraft = {
      ...emptyQuizDraft(),
      ...parsed,
      priorities: Array.isArray(parsed.priorities) ? parsed.priorities : [],
    };
    return isQuizDraftComplete(draft) ? draft : null;
  } catch {
    return null;
  }
}
