import type { ConcernId } from '@dermis/domain';

export type QuizDraft = {
  skinFeel: string | null;
  fitzpatrick: string | null;
  priorities: ConcernId[];
  productReaction: string | null;
};

export const QUIZ_STEP_COUNT = 4;

export const emptyQuizDraft = (): QuizDraft => ({
  skinFeel: null,
  fitzpatrick: null,
  priorities: [],
  productReaction: null,
});

export function isQuizStepComplete(step: number, draft: QuizDraft): boolean {
  switch (step) {
    case 1:
      return draft.skinFeel !== null;
    case 2:
      return draft.fitzpatrick !== null;
    case 3:
      return draft.priorities.length > 0;
    case 4:
      return draft.productReaction !== null;
    default:
      return false;
  }
}

export function isQuizDraftComplete(draft: QuizDraft): boolean {
  for (let step = 1; step <= QUIZ_STEP_COUNT; step += 1) {
    if (!isQuizStepComplete(step, draft)) {
      return false;
    }
  }
  return true;
}

export type QuizSensitivityKey = 'rarely' | 'sometimes' | 'easily';

/** Maps quiz step-4 option text to profile sensitivity keys (order locked in quiz copy). */
export function sensitivityKeyFromReaction(
  reaction: string | null,
  options: readonly [{ label: string }, { label: string }, { label: string }],
): QuizSensitivityKey | null {
  if (!reaction) {
    return null;
  }
  if (reaction === options[0].label) {
    return 'rarely';
  }
  if (reaction === options[1].label) {
    return 'sometimes';
  }
  if (reaction === options[2].label) {
    return 'easily';
  }
  return null;
}

export function toggleQuizPriority(
  priorities: readonly ConcernId[],
  id: ConcernId,
  max = 3,
): ConcernId[] {
  if (priorities.includes(id)) {
    return priorities.filter((entry) => entry !== id);
  }
  if (priorities.length >= max) {
    return [...priorities];
  }
  return [...priorities, id];
}
