import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import { useSession } from '@/src/features/session/SessionContext';

import { loadQuizDraft, saveQuizDraft } from '../lib/quizDraftStorage';
import { emptyQuizDraft, type QuizDraft } from '../lib/quizLogic';

type QuizDraftContextValue = {
  draft: QuizDraft;
  setDraft: (next: QuizDraft) => void;
  patchDraft: (partial: Partial<QuizDraft>) => void;
  hydrated: boolean;
};

const QuizDraftContext = createContext<QuizDraftContextValue | null>(null);

export function QuizDraftProvider({ children }: { children: ReactNode }) {
  const session = useSession();
  const [draft, setDraftState] = useState<QuizDraft>(emptyQuizDraft);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void loadQuizDraft(session.userId).then((stored) => {
      if (cancelled) {
        return;
      }
      if (stored) {
        setDraftState(stored);
      }
      setHydrated(true);
    });
    return () => {
      cancelled = true;
    };
  }, [session.userId]);

  const setDraft = useCallback(
    (next: QuizDraft) => {
      setDraftState(next);
      void saveQuizDraft(next, session.userId);
    },
    [session.userId],
  );

  const patchDraft = useCallback(
    (partial: Partial<QuizDraft>) => {
      setDraftState((prev) => {
        const next = { ...prev, ...partial };
        void saveQuizDraft(next, session.userId);
        return next;
      });
    },
    [session.userId],
  );

  const value = useMemo(
    () => ({ draft, setDraft, patchDraft, hydrated }),
    [draft, setDraft, patchDraft, hydrated],
  );

  return <QuizDraftContext.Provider value={value}>{children}</QuizDraftContext.Provider>;
}

export function useQuizDraft(): QuizDraftContextValue {
  const ctx = useContext(QuizDraftContext);
  if (!ctx) {
    throw new Error('useQuizDraft must be within QuizDraftProvider');
  }
  return ctx;
}
