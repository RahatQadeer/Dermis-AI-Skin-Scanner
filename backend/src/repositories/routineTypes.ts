export type RoutinePeriod = 'am' | 'pm';

export type RoutineStepRecord = {
  id: string;
  userId: string;
  period: RoutinePeriod;
  sortOrder: number;
  label: string;
  createdAt: string;
  updatedAt: string;
};

export type RoutineStepView = RoutineStepRecord & {
  done: boolean;
};

export type RoutineRepository = {
  listSteps: (userId: string) => Promise<RoutineStepRecord[]>;
  addStep: (input: {
    userId: string;
    period: RoutinePeriod;
    label: string;
  }) => Promise<RoutineStepRecord>;
  updateLabel: (userId: string, stepId: string, label: string) => Promise<RoutineStepRecord | null>;
  deleteStep: (userId: string, stepId: string) => Promise<boolean>;
  replacePeriod: (
    userId: string,
    period: RoutinePeriod,
    labels: string[],
  ) => Promise<RoutineStepRecord[]>;
  setCompletion: (input: {
    userId: string;
    stepId: string;
    completedOn: string;
    done: boolean;
  }) => Promise<void>;
  listCompletions: (userId: string, completedOn: string) => Promise<ReadonlySet<string>>;
  deleteAllForUser: (userId: string) => Promise<void>;
};
