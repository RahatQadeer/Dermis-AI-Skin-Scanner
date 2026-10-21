import type { FaceFramingIssue } from './evaluateFaceFraming';
import type { ScanQualityIssue } from './evaluateScanQuality';

/**
 * Unified live / post-capture guidance codes.
 * Face issues are preferred over lighting/blur when both fail.
 */
export type LiveScanIssue =
  FaceFramingIssue | ScanQualityIssue | 'detector_loading' | 'detector_unavailable';

export type LiveScanAssessment = { ok: true } | { ok: false; issue: LiveScanIssue };

/** Face framing first, then image quality. Never claim OK without a face pass. */
export function combineLiveAssessment(
  face:
    | { status: 'ok' }
    | { status: 'fail'; issue: FaceFramingIssue }
    | { status: 'loading' }
    | { status: 'unavailable' },
  quality: { ok: true } | { ok: false; issue: ScanQualityIssue },
): LiveScanAssessment {
  if (face.status === 'loading') {
    return { ok: false, issue: 'detector_loading' };
  }
  if (face.status === 'unavailable') {
    return { ok: false, issue: 'detector_unavailable' };
  }
  if (face.status === 'fail') {
    return { ok: false, issue: face.issue };
  }
  if (!quality.ok) {
    return { ok: false, issue: quality.issue };
  }
  return { ok: true };
}

const FACE_ISSUES = new Set<LiveScanIssue>([
  'no_face',
  'multiple_faces',
  'too_far',
  'too_close',
  'cut_off_top',
  'cut_off_bottom',
  'cut_off_side',
  'not_centered',
  'not_front',
  'obstructed',
]);

/** Map face chip category for UI. */
export function isFaceIssue(issue: LiveScanIssue | null | undefined): boolean {
  return issue != null && FACE_ISSUES.has(issue);
}

export function isLightingIssue(issue: LiveScanIssue | null | undefined): boolean {
  return issue === 'too_dark' || issue === 'too_bright' || issue === 'uneven_light';
}

export function isHoldIssue(issue: LiveScanIssue | null | undefined): boolean {
  return issue === 'blurry';
}
