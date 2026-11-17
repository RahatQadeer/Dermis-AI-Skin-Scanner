import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { tabBarFloatingOffset, tabBarScrollPad } from './tabBarTypes';

/** Live tab-bar clearance for the current device safe area. */
export function useTabBarScrollPad(): number {
  const insets = useSafeAreaInsets();
  return tabBarScrollPad(insets.bottom);
}

/** Live offset for floating UI (toast / banner) above the tab pill. */
export function useTabBarFloatingOffset(): number {
  const insets = useSafeAreaInsets();
  return tabBarFloatingOffset(insets.bottom);
}
