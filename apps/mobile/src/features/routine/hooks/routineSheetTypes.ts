export type RoutineSheetMode =
  { kind: 'closed' } | { kind: 'add' } | { kind: 'edit'; stepId: string; initialLabel: string };
