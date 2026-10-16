/** Six scored concerns — fixed code-owned list. */
export const CONCERN_IDS = [
  'redness',
  'fineLines',
  'hydration',
  'darkSpots',
  'texture',
  'pores',
] as const;

export type ConcernId = (typeof CONCERN_IDS)[number];

export function isConcernId(value: string): value is ConcernId {
  return (CONCERN_IDS as readonly string[]).includes(value);
}
