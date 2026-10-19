import { decodeJpegPixels } from './decodeJpegPixels';
import { detectFacesFromPixels } from './detectFacesFromPixels';
import { evaluateFaceFraming } from './evaluateFaceFraming';
import { evaluateScanQuality } from './evaluateScanQuality';
import { getFaceDetector } from './faceDetectorSingleton';
import { combineLiveAssessment, type LiveScanAssessment } from './liveScanGuidance';

const ANALYSIS_WIDTH_PX = 224;

/**
 * Full on-device assessment: MediaPipe face framing + lighting/blur.
 * Fail-closed for face: if the detector is missing/errors, never report ok.
 * When the detector is down, still surface lighting/blur tips (not a stuck
 * “unavailable” if light is the real problem).
 */
export async function assessLiveScanFrame(uri: string): Promise<LiveScanAssessment> {
  const pixels = await decodeJpegPixels(uri, ANALYSIS_WIDTH_PX);
  if (!pixels) {
    return { ok: false, issue: 'detector_unavailable' };
  }

  const quality = evaluateScanQuality({
    data: pixels.data,
    width: pixels.width,
    height: pixels.height,
    channels: 4,
  });

  const detector = await getFaceDetector();
  if (!detector) {
    // Prefer actionable lighting tips while the model is unavailable/retrying.
    if (!quality.ok) {
      return { ok: false, issue: quality.issue };
    }
    return { ok: false, issue: 'detector_loading' };
  }

  let faces;
  try {
    faces = await detectFacesFromPixels({
      data: pixels.data,
      width: pixels.width,
      height: pixels.height,
      channels: 4,
    });
  } catch {
    if (!quality.ok) {
      return { ok: false, issue: quality.issue };
    }
    return { ok: false, issue: 'detector_loading' };
  }

  if (faces === null) {
    if (!quality.ok) {
      return { ok: false, issue: quality.issue };
    }
    return { ok: false, issue: 'detector_loading' };
  }

  const framing = evaluateFaceFraming(faces, pixels.width, pixels.height);
  return combineLiveAssessment(
    framing.ok ? { status: 'ok' } : { status: 'fail', issue: framing.issue },
    quality.ok ? { ok: true } : { ok: false, issue: quality.issue },
  );
}
