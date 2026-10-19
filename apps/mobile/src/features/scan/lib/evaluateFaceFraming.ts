/**
 * Pure face-presence / framing checks from MediaPipe Face Detector output.
 * Separate from lighting/blur (see evaluateScanQuality).
 */

export type FaceKeypoint = { x: number; y: number; name?: string };

export type DetectedFaceBox = {
  xMin: number;
  yMin: number;
  xMax: number;
  yMax: number;
  width: number;
  height: number;
};

export type DetectedFace = {
  box: DetectedFaceBox;
  keypoints?: FaceKeypoint[];
};

export type FaceFramingIssue =
  | 'no_face'
  | 'multiple_faces'
  | 'too_far'
  | 'too_close'
  | 'cut_off_top'
  | 'cut_off_bottom'
  | 'cut_off_side'
  | 'not_centered'
  | 'not_front'
  | 'obstructed';

export type FaceFramingResult =
  | { ok: true; face: DetectedFace }
  | { ok: false; issue: FaceFramingIssue };

export const FACE_FRAMING_THRESHOLDS = {
  minFaceHeightRatio: 0.28,
  maxFaceHeightRatio: 0.72,
  edgeMarginRatio: 0.035,
  maxCenterXDrift: 0.16,
  maxCenterYDrift: 0.14,
  maxEyeYSkew: 0.14,
  requireMouthBelowNose: true,
} as const;

export function evaluateFaceFraming(
  faces: readonly DetectedFace[],
  imageWidth: number,
  imageHeight: number,
  t: typeof FACE_FRAMING_THRESHOLDS = FACE_FRAMING_THRESHOLDS,
): FaceFramingResult {
  if (imageWidth < 8 || imageHeight < 8 || faces.length === 0) {
    return { ok: false, issue: 'no_face' };
  }
  if (faces.length > 1) {
    return { ok: false, issue: 'multiple_faces' };
  }

  const face = faces[0]!;
  const sizeIssue = checkFaceSize(face.box, imageHeight, t);
  if (sizeIssue) {
    return { ok: false, issue: sizeIssue };
  }
  const edgeIssue = checkFaceEdges(face.box, imageWidth, imageHeight, t);
  if (edgeIssue) {
    return { ok: false, issue: edgeIssue };
  }
  if (!isFaceCentered(face.box, imageWidth, imageHeight, t)) {
    return { ok: false, issue: 'not_centered' };
  }
  const angleIssue = evaluateHeadAngle(face, Math.max(1, face.box.height), t);
  if (angleIssue) {
    return { ok: false, issue: angleIssue };
  }
  return { ok: true, face };
}

function checkFaceSize(
  box: DetectedFaceBox,
  imageHeight: number,
  t: typeof FACE_FRAMING_THRESHOLDS,
): FaceFramingIssue | null {
  const heightRatio = Math.max(1, box.height) / imageHeight;
  if (heightRatio < t.minFaceHeightRatio) return 'too_far';
  if (heightRatio > t.maxFaceHeightRatio) return 'too_close';
  return null;
}

function checkFaceEdges(
  box: DetectedFaceBox,
  imageWidth: number,
  imageHeight: number,
  t: typeof FACE_FRAMING_THRESHOLDS,
): FaceFramingIssue | null {
  const marginX = imageWidth * t.edgeMarginRatio;
  const marginY = imageHeight * t.edgeMarginRatio;
  if (box.yMin < marginY) return 'cut_off_top';
  if (box.yMax > imageHeight - marginY) return 'cut_off_bottom';
  if (box.xMin < marginX || box.xMax > imageWidth - marginX) return 'cut_off_side';
  return null;
}

function isFaceCentered(
  box: DetectedFaceBox,
  imageWidth: number,
  imageHeight: number,
  t: typeof FACE_FRAMING_THRESHOLDS,
): boolean {
  const cx = (box.xMin + box.xMax) / 2 / imageWidth;
  const cy = (box.yMin + box.yMax) / 2 / imageHeight;
  return Math.abs(cx - 0.5) <= t.maxCenterXDrift && Math.abs(cy - 0.5) <= t.maxCenterYDrift;
}

function evaluateHeadAngle(
  face: DetectedFace,
  faceH: number,
  t: typeof FACE_FRAMING_THRESHOLDS,
): FaceFramingIssue | null {
  const kp = face.keypoints ?? [];
  if (kp.length === 0) {
    return null;
  }
  const leftEye = kp.find((p) => p.name === 'leftEye');
  const rightEye = kp.find((p) => p.name === 'rightEye');
  const nose = kp.find((p) => p.name === 'noseTip');
  const mouth = kp.find((p) => p.name === 'mouthCenter');
  if (eyesSkewed(leftEye, rightEye, faceH, t.maxEyeYSkew)) {
    return 'not_front';
  }
  if (t.requireMouthBelowNose && mouthAboveNose(nose, mouth)) {
    return 'not_front';
  }
  if (eyesMissingWithFace(nose, mouth, leftEye, rightEye)) {
    return 'obstructed';
  }
  return null;
}

function eyesSkewed(
  leftEye: FaceKeypoint | undefined,
  rightEye: FaceKeypoint | undefined,
  faceH: number,
  maxSkew: number,
): boolean {
  return Boolean(leftEye && rightEye && Math.abs(leftEye.y - rightEye.y) / faceH > maxSkew);
}

function mouthAboveNose(
  nose: FaceKeypoint | undefined,
  mouth: FaceKeypoint | undefined,
): boolean {
  return Boolean(nose && mouth && mouth.y <= nose.y);
}

function eyesMissingWithFace(
  nose: FaceKeypoint | undefined,
  mouth: FaceKeypoint | undefined,
  leftEye: FaceKeypoint | undefined,
  rightEye: FaceKeypoint | undefined,
): boolean {
  return Boolean((nose || mouth) && (!leftEye || !rightEye));
}
