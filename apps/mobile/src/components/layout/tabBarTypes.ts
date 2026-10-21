export const TAB_IDS = ['home', 'progress', 'scan', 'routine', 'profile'] as const;
export type TabId = (typeof TAB_IDS)[number];

/** Prototype order: Home · Progress · centre scan · Routine · Profile. */
export const TAB_BAR_ORDER: readonly TabId[] = ['home', 'progress', 'scan', 'routine', 'profile'];

export function isCentreScanTab(id: TabId): boolean {
  return id === 'scan';
}

/**
 * Scroll content bottom pad so the last items clear the floating pill + scan FAB.
 * (Bar sits near the screen edge; this pad is only for scroll end, not bar position.)
 */
export const TAB_BAR_SCROLL_PAD = 108;
