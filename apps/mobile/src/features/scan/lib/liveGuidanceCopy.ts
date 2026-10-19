import { getCopy } from '@/src/copy';

import type { LiveScanIssue } from './liveScanGuidance';

/** Shared coach / toast strings for live + post-capture guidance. */
export function messageForLiveIssue(issue: LiveScanIssue): string {
  const c = getCopy().screens.camera;
  const map: Record<LiveScanIssue, string> = {
    no_face: c.liveNoFace,
    multiple_faces: c.liveMultipleFaces,
    too_far: c.liveTooFar,
    too_close: c.liveTooClose,
    cut_off_top: c.liveCutOffTop,
    cut_off_bottom: c.liveCutOffBottom,
    cut_off_side: c.liveCutOffSide,
    not_centered: c.liveNotCentered,
    not_front: c.liveNotFront,
    obstructed: c.liveObstructed,
    too_dark: c.liveTooDark,
    too_bright: c.liveTooBright,
    uneven_light: c.liveUneven,
    blurry: c.liveBlurry,
    detector_loading: c.liveDetectorLoading,
    detector_unavailable: c.liveDetectorUnavailable,
  };
  return map[issue];
}
