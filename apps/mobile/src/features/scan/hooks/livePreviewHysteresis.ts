import type { LiveScanIssue } from '../lib/liveScanGuidance';

export const READY_STREAK = 2;
export const FAIL_STREAK = 2;

export type HysteresisState = {
  okStreak: number;
  failStreak: number;
  /** Capture gate — needs consecutive OK samples. */
  ready: boolean;
  /** Always the latest assessment tip (updates every sample). */
  issue: LiveScanIssue | null;
  loading: boolean;
};

export function initialHysteresisState(): HysteresisState {
  return {
    okStreak: 0,
    failStreak: 0,
    ready: false,
    issue: 'detector_loading',
    loading: true,
  };
}

/**
 * Ready uses hysteresis so capture does not flicker.
 * Issue always follows the latest sample so the tip/tag clears when fixed.
 */
export function nextHysteresis(
  prev: HysteresisState,
  ok: boolean,
  nextIssue: LiveScanIssue | null,
): HysteresisState {
  if (ok) {
    const okStreak = prev.okStreak + 1;
    return {
      okStreak,
      failStreak: 0,
      ready: okStreak >= READY_STREAK || prev.ready,
      issue: null,
      loading: false,
    };
  }
  const failStreak = prev.failStreak + 1;
  return {
    okStreak: 0,
    failStreak,
    ready: failStreak >= FAIL_STREAK ? false : prev.ready,
    issue: nextIssue,
    loading: nextIssue === 'detector_loading',
  };
}
