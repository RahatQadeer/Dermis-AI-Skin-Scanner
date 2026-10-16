export type CountdownTick = {
  /** Remaining whole seconds shown to the user (3, 2, 1). Null when finished. */
  display: number | null;
  done: boolean;
};

/** Pure countdown state for tests — starts at `from` and counts down to 0. */
export function nextCountdownTick(current: number): CountdownTick {
  if (current <= 1) {
    return { display: null, done: true };
  }
  return { display: current - 1, done: false };
}

export function initialCountdownDisplay(from: number): number {
  return Math.max(1, Math.floor(from));
}
