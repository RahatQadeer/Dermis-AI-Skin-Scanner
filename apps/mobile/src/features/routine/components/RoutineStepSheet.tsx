import type { ConcernId } from '@dermis/domain';
import { PartyConfetti } from '@/src/components/celebration/PartyConfetti';
import { Sheet } from '@/src/components/layout/Sheet';
import { getCopy } from '@/src/copy';

import type { RoutineSheetMode } from '../hooks/routineSheetTypes';
import { buildRoutineSuggestions } from '../lib/routineSuggestions';
import type { RoutinePeriod } from '../types/routineTypes';
import {
  RoutineStepSheetAddBody,
  RoutineStepSheetEditBody,
} from './RoutineStepSheetBodies';
import { RoutineStepSheetHeader } from './RoutineStepSheetHeader';

export type RoutineStepSheetProps = {
  sheet: RoutineSheetMode;
  period: RoutinePeriod;
  draftLabel: string;
  labelError?: string;
  concernScores?: Partial<Record<ConcernId, number>> | null;
  isSuggestionAdded: (label: string) => boolean;
  doneSparkle: boolean;
  onChangeLabel: (value: string) => void;
  onSave: () => void;
  onToggleSuggestion: (label: string) => void;
  onDone: () => void;
  onClose: () => void;
};

export function RoutineStepSheet(props: RoutineStepSheetProps) {
  const r = getCopy().screens.routine;
  const visible = props.sheet.kind !== 'closed';
  const isEdit = props.sheet.kind === 'edit';
  const title = isEdit
    ? r.sheetEditTitle
    : props.period === 'am'
      ? r.sheetAddTitleAm
      : r.sheetAddTitlePm;

  return (
    <Sheet
      visible={visible}
      onClose={props.onClose}
      dismissOnOverlay={!props.doneSparkle}
      fullscreenOverlay={
        <PartyConfetti active={props.doneSparkle} burstKey={props.doneSparkle ? 'sheet-done' : 0} />
      }
    >
      <RoutineStepSheetHeader title={title} doneSparkle={props.doneSparkle} onClose={props.onClose} />
      {isEdit ? (
        <RoutineStepSheetEditBody
          draftLabel={props.draftLabel}
          labelError={props.labelError}
          onChangeLabel={props.onChangeLabel}
          onSave={props.onSave}
        />
      ) : (
        <RoutineStepSheetAddBody
          suggestions={buildRoutineSuggestions(props.concernScores)}
          draftLabel={props.draftLabel}
          labelError={props.labelError}
          doneSparkle={props.doneSparkle}
          isSuggestionAdded={props.isSuggestionAdded}
          onChangeLabel={props.onChangeLabel}
          onSave={props.onSave}
          onToggleSuggestion={props.onToggleSuggestion}
          onDone={props.onDone}
        />
      )}
    </Sheet>
  );
}
