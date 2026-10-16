import { commonCopy } from './common';

/** Navigation titles (tabs, headers, stacks). */
export const navCopy = {
  home: 'Home',
  routine: 'Routine',
  progress: 'Progress',
  profile: 'Profile',
  recommendations: 'Recommendations',
  results: 'Report',
  scan: 'Scan',
  notFound: 'Not found',
  appHeader: commonCopy.appName,
  goHome: 'Go home',
  backA11y: 'Go back',
  backGlyph: '‹',
  scanA11y: 'Start a scan',
} as const;
