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
  switch (error.code) {
    case 'no_face':
      return camera.noFace;
    case 'multiple_faces':
      return camera.multipleFaces;
    case 'face_too_far':
      return camera.faceTooFar;
    case 'face_too_close':
      return camera.faceTooClose;
    case 'face_blurry':
      return camera.faceBlurry;
    case 'face_poor_lighting':
      return camera.facePoorLighting;
    case 'face_obstructed':
      return camera.faceObstructed;
    case 'face_not_front':
      return camera.faceNotFront;
    default:
      return camera.faceNotClear;
  }
}
