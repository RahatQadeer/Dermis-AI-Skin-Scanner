import { CONCERN_IDS, type ConcernId, isConcernId } from './concerns';
import {
  DEFAULT_WEIGHT,
  FORMULA_VERSION,
  MAX_PRIORITIES,
  PRIORITY_WEIGHT,
  SCORE_MAX,
  SCORE_MIN,
} from './constants';
import type { ConcernScores, ConcernWeights } from './schemas/score';
import { weightedIndex } from './weightedIndex';

export type { ConcernScores, ConcernWeights };

export type IndexResult = {
  index: number;
  weights: ConcernWeights;
  formulaVersion: typeof FORMULA_VERSION;
};

export class DomainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DomainError';
  }
}

function assertScore(concern: ConcernId, score: number): void {
  if (!Number.isFinite(score) || score < SCORE_MIN || score > SCORE_MAX) {
    throw new DomainError(`Score for ${concern} must be between ${SCORE_MIN} and ${SCORE_MAX}`);
  }
}

function normalizePriorities(priorities: readonly string[]): ConcernId[] {
  if (priorities.length > MAX_PRIORITIES) {
    throw new DomainError(`At most ${MAX_PRIORITIES} priority concerns allowed`);
  }
  const unique: ConcernId[] = [];
  for (const raw of priorities) {
    if (!isConcernId(raw)) {
      throw new DomainError(`Unknown concern: ${raw}`);
    }
    if (!unique.includes(raw)) {
      unique.push(raw);
    }
  }
  return unique;
}

function buildWeights(priorities: readonly ConcernId[]): ConcernWeights {
  const prioritySet = new Set(priorities);
  const weights = {} as ConcernWeights;
  for (const id of CONCERN_IDS) {
    weights[id] = prioritySet.has(id) ? PRIORITY_WEIGHT : DEFAULT_WEIGHT;
  }
  return weights;
}

/**
 * Weighted Skin Health Index. Server-authoritative — do not use for enforcement in the app.
 * index = round(sum(weight × score) / sum(weight))
 */
export function calculateIndex(input: {
  scores: ConcernScores;
  priorities?: readonly string[];
}): IndexResult {
  for (const id of CONCERN_IDS) {
    assertScore(id, input.scores[id]);
  }

  const priorities = normalizePriorities(input.priorities ?? []);
  const weights = buildWeights(priorities);

  return {
    index: weightedIndex(input.scores, weights),
    weights,
    formulaVersion: FORMULA_VERSION,
  };
}
