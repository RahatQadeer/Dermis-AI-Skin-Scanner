import { useCallback, useState } from 'react';

import type { RoutineStep } from '../types/routineTypes';
import type { RoutineSheetMode } from './routineSheetTypes';

export function useRoutineSheetDraft() {
  const [sheet, setSheet] = useState<RoutineSheetMode>({ kind: 'closed' });
  const [draftLabel, setDraftLabel] = useState('');
  const [labelError, setLabelError] = useState<string | undefined>();

  const openAdd = useCallback(() => {
    setDraftLabel('');
    setLabelError(undefined);
    setSheet({ kind: 'add' });
  }, []);

  const openEdit = useCallback((step: RoutineStep) => {
    setDraftLabel(step.label);
    setLabelError(undefined);
    setSheet({ kind: 'edit', stepId: step.id, initialLabel: step.label });
  }, []);

  const closeSheet = useCallback(() => {
    setSheet({ kind: 'closed' });
    setLabelError(undefined);
  }, []);

  return {
    sheet,
    draftLabel,
    setDraftLabel,
    labelError,
    setLabelError,
    openAdd,
    openEdit,
    closeSheet,
  };
}
