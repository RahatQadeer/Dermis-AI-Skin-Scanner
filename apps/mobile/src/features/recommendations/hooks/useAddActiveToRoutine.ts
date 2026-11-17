import { useRouter } from 'expo-router';
import { useCallback, useState } from 'react';

import { getCopy } from '@/src/copy';
import { addRoutineStep, fetchRoutine } from '@/src/features/routine/api/routineApi';
import type { RoutinePeriod } from '@/src/features/routine/types/routineTypes';
import { useSession } from '@/src/features/session/SessionContext';

export type AddActiveFeedback = {
  message: string;
  ok: boolean;
};

/** Adds an ingredient name as an AM/PM routine step, then returns to Routine. */
export function useAddActiveToRoutine() {
  const router = useRouter();
  const { apiEnabled, accessToken } = useSession();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<AddActiveFeedback | null>(null);
  const live = apiEnabled && Boolean(accessToken);

  const addActive = useCallback(
    async (productId: string, label: string, period: RoutinePeriod) => {
      if (!live || busyId) {
        return;
      }
      const r = getCopy().screens.routine;
      setBusyId(`${productId}:${period}`);
      setFeedback(null);
      try {
        const { state } = await fetchRoutine();
        const exists = state[period].some(
          (step) => step.label.trim().toLowerCase() === label.trim().toLowerCase(),
        );
        if (exists) {
          setFeedback({ message: r.toastActiveAlready, ok: true });
          return;
        }
        await addRoutineStep(period, label.trim());
        setFeedback({
          message: period === 'am' ? r.toastActiveAddedAm : r.toastActiveAddedPm,
          ok: true,
        });
        router.replace('/routine');
      } catch {
        setFeedback({ message: r.toastActiveAddFail, ok: false });
      } finally {
        setBusyId(null);
      }
    },
    [busyId, live, router],
  );

  return {
    live,
    busyId,
    feedback,
    clearFeedback: () => setFeedback(null),
    addActive,
  };
}
