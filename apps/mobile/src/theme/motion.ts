/** Durations (ms) and easing keys — honour reduce-motion at call sites. */
export const motion = {
  duration: {
    instant: 0,
    fast: 150,
    normal: 280,
    slow: 420,
    toast: 2600,
    countdown: 750,
    flash: 420,
    indexCountUp: 1100,
  },
} as const;
