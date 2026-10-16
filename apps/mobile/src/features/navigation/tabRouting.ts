import type { Href } from 'expo-router';

import type { TabId } from '@/src/components/layout/tabBarTypes';
import { scanEntryHref } from '../consent/scanEntry';

/** Maps the current path to the highlighted main tab (scan stack is outside tabs). */
export function tabIdFromPathname(pathname: string): TabId {
  if (pathname.includes('/routine')) {
    return 'routine';
  }
  if (pathname.includes('/progress')) {
    return 'progress';
  }
  if (pathname.includes('/profile')) {
    return 'profile';
  }
  if (pathname.includes('/scan') || pathname.includes('/ai-consent')) {
    return 'scan';
  }
  return 'home';
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
