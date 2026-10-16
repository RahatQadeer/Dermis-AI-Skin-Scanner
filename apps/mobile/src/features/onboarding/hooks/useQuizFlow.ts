import { useRouter } from 'expo-router';
import { useState } from 'react';

import { isQuizStepComplete, QUIZ_STEP_COUNT } from '../lib/quizLogic';
import { useQuizDraft } from '../state/QuizDraftProvider';

export function useQuizFlow() {
  const router = useRouter();
  const { draft, patchDraft } = useQuizDraft();
  const [step, setStep] = useState(1);
  const canContinue = isQuizStepComplete(step, draft);

  const goBack = () => {
    if (step <= 1) {
      router.replace('/welcome');
      return;
    }
    setStep((s) => s - 1);
  };

  const goNext = () => {
    if (!canContinue) {
      return;
    }
    if (step >= QUIZ_STEP_COUNT) {
      router.push('/summary');
      return;
    }
    setStep((s) => s + 1);
  };

  return { step, draft, patchDraft, canContinue, goBack, goNext };
}
