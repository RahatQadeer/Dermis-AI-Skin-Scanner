/** Durations (ms) and easing keys — honour reduce-motion at call sites. */
export const motion = {
  duration: {
    instant: 0,
    fast: 150,
    normal: 280,
    slow: 420,
    toast: 2600,
    /** Face / retake errors — long enough to read on camera. */
    toastImportant: 8000,
    countdown: 750,
    flash: 160,
    indexCountUp: 1100,
  },
} as const;
