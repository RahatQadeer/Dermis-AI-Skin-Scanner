import type { ConcernId, SkinProfile } from '@dermis/domain';

type SkinType = SkinProfile['skinType'];
type SkinTone = SkinProfile['skinTone'];

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

/** Enum order locked to quiz copy option order (q1 / q2). */
const SKIN_TYPE_BY_INDEX: readonly SkinType[] = ['oily', 'combination', 'dry', 'normal'];
const SKIN_TONE_BY_INDEX: readonly SkinTone[] = ['typeI_II', 'typeIII', 'typeIV', 'typeV_VI'];

function enumFromOptionLabel<T>(
  label: string | null,
  options: readonly { label: string }[],
  table: readonly T[],
): T | null {
  if (!label) {
    return null;
  }
  const index = options.findIndex((option) => option.label === label);
  return index >= 0 && index < table.length ? table[index]! : null;
}

export function skinTypeFromFeel(
  feel: string | null,
  options: readonly { label: string }[],
): SkinType | null {
  return enumFromOptionLabel(feel, options, SKIN_TYPE_BY_INDEX);
}

export function skinToneFromFitzpatrick(
  tone: string | null,
  options: readonly { label: string }[],
): SkinTone | null {
  return enumFromOptionLabel(tone, options, SKIN_TONE_BY_INDEX);
}

type QuizCopyShape = {
  q1: { options: readonly { label: string }[] };
  q2: { options: readonly { label: string }[] };
  q4: { options: readonly [{ label: string }, { label: string }, { label: string }] };
};

/**
 * Converts a completed quiz draft into the backend skin-profile payload.
 * Returns null if any answer is missing or cannot be mapped to an enum.
 */
export function quizDraftToSkinProfile(draft: QuizDraft, quiz: QuizCopyShape): SkinProfile | null {
  const skinType = skinTypeFromFeel(draft.skinFeel, quiz.q1.options);
  const skinTone = skinToneFromFitzpatrick(draft.fitzpatrick, quiz.q2.options);
  const sensitivity = sensitivityKeyFromReaction(draft.productReaction, quiz.q4.options);
  if (!skinType || !skinTone || !sensitivity || draft.priorities.length === 0) {
    return null;
  }
  return {
    skinType,
    skinTone,
    sensitivity,
    priorityConcerns: draft.priorities,
  };
}
