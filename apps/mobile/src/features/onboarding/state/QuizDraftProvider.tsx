import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';

import { emptyQuizDraft, type QuizDraft } from '../lib/quizLogic';

type QuizDraftContextValue = {
  draft: QuizDraft;
  setDraft: (next: QuizDraft) => void;
  patchDraft: (partial: Partial<QuizDraft>) => void;
};

const QuizDraftContext = createContext<QuizDraftContextValue | null>(null);

export function QuizDraftProvider({ children }: { children: ReactNode }) {
  const [draft, setDraft] = useState<QuizDraft>(emptyQuizDraft);

  const value = useMemo(
    () => ({
      draft,
      setDraft,
      patchDraft: (partial: Partial<QuizDraft>) => setDraft((prev) => ({ ...prev, ...partial })),
    }),
    [draft],
  );

  return <QuizDraftContext.Provider value={value}>{children}</QuizDraftContext.Provider>;
}

export function useQuizDraft(): QuizDraftContextValue {
  const ctx = useContext(QuizDraftContext);
  if (!ctx) {
    throw new Error('useQuizDraft must be used within QuizDraftProvider');
  }
  return ctx;
}
