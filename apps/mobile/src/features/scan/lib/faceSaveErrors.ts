import { getCopy } from '@/src/copy';
import { isApiError } from '@/src/lib/api/errors';

type CameraCopy = ReturnType<typeof getCopy>['screens']['camera'];
type EnrollCopy = ReturnType<typeof getCopy>['screens']['faceEnroll'];

const FACE_ALREADY_REGISTERED_MESSAGE =
  'This account already has a face registered. Update it from Profile.';

/** Which copy string an API error code maps to. */
type MessageKey =
  | 'saveFailedServer'
  | 'alreadyRegistered'
  | 'identityMismatch'
  | 'livenessHoldRetry'
  | 'needClearFace'
  | 'identityNeedSignIn'
  | 'identityNeedNetwork';

const API_CODE_MESSAGE_KEYS: Readonly<Record<string, MessageKey>> = {
  // Wrong/old API, or face_references table missing in Supabase.
  not_found: 'saveFailedServer',
  face_reference_not_configured: 'saveFailedServer',
  face_reference_save_failed: 'saveFailedServer',
  http_404: 'saveFailedServer',
  http_502: 'saveFailedServer',
  http_503: 'saveFailedServer',
  face_reference_exists: 'alreadyRegistered',
  face_identity_mismatch: 'identityMismatch',
  face_replace_reauth_required: 'identityMismatch',
  face_liveness_required: 'livenessHoldRetry',
  liveness_challenge_expired: 'livenessHoldRetry',
  liveness_challenge_not_found: 'livenessHoldRetry',
  invalid_body: 'needClearFace',
  http_400: 'needClearFace',
  missing_token: 'identityNeedSignIn',
  http_401: 'identityNeedSignIn',
  http_403: 'identityNeedSignIn',
  network_unreachable: 'identityNeedNetwork',
  network_timeout: 'identityNeedNetwork',
  api_not_configured: 'identityNeedNetwork',
};

function resolveMessage(key: MessageKey, camera: CameraCopy, enroll: EnrollCopy): string {
  switch (key) {
    case 'saveFailedServer':
      return enroll.saveFailedServer;
    case 'alreadyRegistered':
      return FACE_ALREADY_REGISTERED_MESSAGE;
    case 'needClearFace':
      return enroll.needClearFace;
    case 'identityMismatch':
      return camera.identityMismatch;
    case 'livenessHoldRetry':
      return camera.livenessHoldRetry;
    case 'identityNeedSignIn':
      return camera.identityNeedSignIn;
    case 'identityNeedNetwork':
      return camera.identityNeedNetwork;
  }
}

function messageForApiCode(
  code: string,
  detail: string | undefined,
  fallback: string,
): string {
  const key = Object.hasOwn(API_CODE_MESSAGE_KEYS, code)
    ? API_CODE_MESSAGE_KEYS[code]
    : undefined;
  if (key) {
    return resolveMessage(key, getCopy().screens.camera, getCopy().screens.faceEnroll);
  }
  return detail && detail.length >= 8 ? detail : fallback;
}

function messageForPlainError(error: Error, fallback: string): string {
  // Raw snake_case codes must never show as the toast.
  if (/^[a-z][a-z0-9_]*$/.test(error.message)) {
    if (error.message === 'face_reference_save_failed') {
      return getCopy().screens.faceEnroll.saveFailedServer;
    }
    return fallback;
  }
  return error.message;
}

/**
 * Map API / enroll failures to human copy.
 * Never surface raw codes like `not_found` in the UI.
 */
export function messageForFaceSaveError(error: unknown, fallback: string): string {
  if (isApiError(error)) {
    return messageForApiCode(error.code, error.detail, fallback);
  }
  if (error instanceof Error) {
    return messageForPlainError(error, fallback);
  }
  return fallback;
}
