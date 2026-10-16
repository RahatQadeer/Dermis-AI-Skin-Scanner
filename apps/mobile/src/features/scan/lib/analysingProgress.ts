export function stepIndexForProgress(progress: number, stepCount: number): number {
  if (stepCount <= 0) {
    return 0;
  }
  const clamped = Math.min(100, Math.max(0, progress));
  const index = Math.floor((clamped / 100) * stepCount);
  return Math.min(stepCount - 1, index);
}

export function progressAfterTick(current: number, step: number): number {
  return Math.min(100, current + step);
}

/**
 * While waiting for the server, ease toward 98% (never hard-stop at 95).
 * `completeNow` snaps to 100 when the scan is accepted.
 */
export function waitingProgressAfterTick(current: number): number {
  if (current >= 98) {
    return 98;
  }
  if (current >= 92) {
    return Math.min(98, current + 0.6);
  }
  if (current >= 80) {
    return Math.min(92, current + 2);
  }
  if (current >= 50) {
    return Math.min(80, current + 4);
  }
  return Math.min(50, current + 8);
}
