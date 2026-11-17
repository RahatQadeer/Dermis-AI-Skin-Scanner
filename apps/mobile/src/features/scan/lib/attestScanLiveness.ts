import { Platform } from 'react-native';

import type { LiveScanAssessment } from './liveScanGuidance';

/**
 * Client liveness attestation for POST /v1/scans.
 * Requires a live native camera frame that already passed framing/quality —
 * never treat face detection alone, web stubs, or gallery picks as live.
 */
export function attestScanLiveness(assessment: LiveScanAssessment): boolean {
  if (Platform.OS === 'web') {
    return false;
  }
  return assessment.ok;
}
