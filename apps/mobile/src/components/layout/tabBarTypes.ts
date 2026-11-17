import { spacing } from '@/src/theme';

export const TAB_IDS = ['home', 'progress', 'scan', 'routine', 'profile'] as const;
export type TabId = (typeof TAB_IDS)[number];

/** Prototype order: Home · Progress · centre scan · Routine · Profile. */
export const TAB_BAR_ORDER: readonly TabId[] = ['home', 'progress', 'scan', 'routine', 'profile'];

export function isCentreScanTab(id: TabId): boolean {
  return id === 'scan';
}

/** Matches `TabBar.tsx` pill + centre FAB geometry. */
export const TAB_BAR_PILL_MIN_HEIGHT = 64;
export const TAB_BAR_FAB_SIZE = 58;
/** FAB sits half above the pill (`marginTop: -(FAB/2 + 4)`). */
export const TAB_BAR_FAB_OVERHANG = TAB_BAR_FAB_SIZE / 2 + 4;

function hostBottomPad(safeBottom: number): number {
  return safeBottom + (safeBottom > 0 ? spacing.md : spacing.sm);
}

/**
 * Bottom inset for scroll/content so the last row clears the floating pill
 * and the scan FAB tip. Scales with device safe-area (home indicator / gesture bar).
 */
export function tabBarScrollPad(safeBottom: number): number {
  return (
    hostBottomPad(safeBottom) +
    TAB_BAR_PILL_MIN_HEIGHT +
    Math.round(TAB_BAR_FAB_OVERHANG * 0.45) +
    spacing.sm
  );
}

/**
 * Offset for toasts / celebration banners sitting just above the pill.
 * Slightly tighter than scroll pad (FAB tip may overlap the centre).
 */
export function tabBarFloatingOffset(safeBottom: number): number {
  return hostBottomPad(safeBottom) + TAB_BAR_PILL_MIN_HEIGHT + spacing.sm;
}

/**
 * @deprecated Prefer `tabBarScrollPad(insets.bottom)` for device-aware clearance.
 * Fallback mid-range value (~notchless Android).
 */
export const TAB_BAR_SCROLL_PAD = tabBarScrollPad(0);
