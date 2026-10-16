import type { HomeRoutineProgress } from '@/src/features/home/mock/homeMockScenarios';

import type { RoutineState, RoutineStep } from '../types/routineTypes';

type StepTemplate = { label: string; detail: string; duration: string; concern: string };

const AM_TEMPLATE: readonly StepTemplate[] = [
  {
    label: 'Gentle cleanser',
    detail: 'Glycerin, amino-acid surfactants',
    duration: '30s',
    concern: 'Baseline',
  },
  {
    label: 'Niacinamide 5% serum',
    detail: 'Niacinamide, zinc PCA',
    duration: '1 min',
    concern: 'Pores 58 · sebum',
  },
  {
    label: 'Moisturiser + SPF 50',
    detail: 'Ceramides, zinc oxide',
    duration: '1 min',
    concern: 'Dark spots 69 · UV',
  },
];

const PM_TEMPLATE: readonly StepTemplate[] = [
  {
    label: 'Gentle cleanser',
    detail: 'Glycerin, amino-acid surfactants',
    duration: '30s',
    concern: 'Baseline',
  },
  {
    label: 'Retinol 0.3% night',
    detail: 'Encapsulated retinol',
    duration: '1 min',
    concern: 'Texture 64',
  },
  {
    label: 'Repair moisturiser',
    detail: 'Ceramides, squalane',
    duration: '1 min',
    concern: 'Barrier',
  },
];

function buildSteps(
  prefix: string,
  template: readonly StepTemplate[],
  doneCount: number,
): RoutineStep[] {
  return template.map((step, index) => ({
    id: `${prefix}-${String(index + 1)}`,
    label: step.label,
    detail: step.detail,
    duration: step.duration,
    concern: step.concern,
    done: index < doneCount,
  }));
}

export function buildInitialRoutineState(progress: HomeRoutineProgress): RoutineState {
  return {
    am: buildSteps('am', AM_TEMPLATE, progress.amDone),
    pm: buildSteps('pm', PM_TEMPLATE, progress.pmDone),
  };
}
