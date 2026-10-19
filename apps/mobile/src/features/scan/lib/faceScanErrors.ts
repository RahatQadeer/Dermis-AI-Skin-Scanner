import { getCopy } from '@/src/copy';
import { isApiError } from '@/src/lib/api/errors';

const FACE_CODES = new Set([
  'no_face',
  'multiple_faces',
  'face_too_far',
  'face_too_close',
  'face_blurry',
  'face_poor_lighting',
  'face_obstructed',
  'face_glasses',
  'face_not_front',
  'face_not_clear',
]);

export function isFaceScanError(error: unknown): boolean {
  return isApiError(error) && FACE_CODES.has(error.code);
}

export function messageForFaceScanError(error: unknown): string {
  const camera = getCopy().screens.camera;
  if (!isApiError(error)) {
    return camera.faceNotClear;
  }
  // Prefer model tip naming which area is unclear / cut off.
  if (error.detail && error.detail.length >= 8) {
    return error.detail;
  }
  return faceCopyByCode(error.code) ?? camera.faceNotClear;
}

function faceCopyByCode(code: string): string | undefined {
  const camera = getCopy().screens.camera;
  const map: Record<string, string> = {
    no_face: camera.noFace,
    multiple_faces: camera.multipleFaces,
    face_too_far: camera.faceTooFar,
    face_too_close: camera.faceTooClose,
    face_blurry: camera.faceBlurry,
    face_poor_lighting: camera.facePoorLighting,
    face_obstructed: camera.faceObstructed,
    face_glasses: camera.faceGlasses,
    face_not_front: camera.faceNotFront,
  };
  return map[code];
}
