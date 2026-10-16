export type DeltaCopy = {
  deltaUp: (n: number) => string;
  deltaDown: (n: number) => string;
  deltaFlat: string;
};

export function formatIndexDelta(delta: number | null, copy: DeltaCopy): string | undefined {
  if (delta === null) {
    return undefined;
  }
  if (delta > 0) {
    return copy.deltaUp(delta);
  }
  if (delta < 0) {
    return copy.deltaDown(delta);
  }
  return copy.deltaFlat;
}
