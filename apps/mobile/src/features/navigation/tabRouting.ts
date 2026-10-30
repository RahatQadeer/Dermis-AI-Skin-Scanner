import type { Href } from 'expo-router';

import type { TabId } from '@/src/components/layout/tabBarTypes';
import { scanEntryHref } from '../consent/scanEntry';

const PATH_TAB_RULES: { fragment: string; tab: TabId }[] = [
  { fragment: '/routine', tab: 'routine' },
  { fragment: '/progress', tab: 'progress' },
  { fragment: '/profile', tab: 'profile' },
  { fragment: '/camera', tab: 'scan' },
  { fragment: '/analysing', tab: 'scan' },
  { fragment: '/ai-consent', tab: 'scan' },
  { fragment: '/face-enroll', tab: 'scan' },
  { fragment: '/privacy', tab: 'scan' },
  // Secondary surfaces keep a parent tab highlighted.
  { fragment: '/results', tab: 'home' },
  { fragment: '/assistant', tab: 'home' },
  { fragment: '/recommendations', tab: 'home' },
  { fragment: '/home', tab: 'home' },
];

/**
 * Maps the current path to the highlighted main tab so users always see
 * which section they are in (including secondary screens).
 */
export function tabIdFromPathname(pathname: string): TabId | null {
  const match = PATH_TAB_RULES.find((rule) => pathname.includes(rule.fragment));
  return match?.tab ?? 'home';
}

export function routeForTab(id: TabId, faceAnalysisGranted = false): Href {
  switch (id) {
    case 'routine':
      return '/(tabs)/routine';
    case 'progress':
      return '/(tabs)/progress';
    case 'profile':
      return '/(tabs)/profile';
    case 'scan':
      return scanEntryHref(faceAnalysisGranted);
    case 'home':
    default:
      return '/(tabs)/home';
  }
}
