export type AutoCaptureDecision = 'start' | 'idle' | 'reset_latch';

/**
 * Once the countdown is running, never cancel it from ready flicker.
 * Cancelling + re-sampling caused the blink/timer restart loop.
 */
export function decideAutoCapture(input: {
  ready: boolean;
  capturing: boolean;
  countdownActive: boolean;
  didAuto: boolean;
}): AutoCaptureDecision {
  if (input.capturing) {
    return 'reset_latch';
  }
  if (input.countdownActive) {
    return 'idle';
  }
  if (!input.ready || input.didAuto) {
    return 'idle';
  }
  return 'start';
}
