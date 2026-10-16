export type RoutinePeriod = 'am' | 'pm';

export type RoutineStep = {
  id: string;
  label: string;
  done: boolean;
  /** Key ingredients (presentational). */
  detail?: string;
  /** Approximate time, e.g. "30s" / "1 min". */
  duration?: string;
  /** Concern chip, e.g. "Pores 58 · sebum". */
  concern?: string;
};

export type RoutineState = Record<RoutinePeriod, RoutineStep[]>;
