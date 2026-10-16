import type { Href } from 'expo-router';

/** First scan entry: consent screen when not yet granted (PRODUCT.md). */
export function scanEntryHref(faceAnalysisGranted: boolean): Href {
  return faceAnalysisGranted ? '/(scan)/camera' : '/(scan)/ai-consent';
}
