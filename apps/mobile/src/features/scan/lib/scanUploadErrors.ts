import { getCopy } from '@/src/copy';
import { isApiError } from '@/src/lib/api/errors';

import { isFaceScanError, messageForFaceScanError } from './faceScanErrors';

/** Errors that should send the user back to the camera (not stay on Analysing). */
const RETAKE_CODES = new Set([
  'analyzer_failed',
  'analyzer_unavailable',
  'analyzer_timeout',
  'quota_unavailable',
  'invalid_image',
  'invalid_body',
  'free_limit',
  'daily_limit',
]);

export function messageForScanUploadError(error: unknown, fallback: string): string {
  const copy = getCopy().screens.scanConsent;
  if (isFaceScanError(error)) {
    return messageForFaceScanError(error);
  }
  if (!isApiError(error)) {
    return fallback;
  }
  switch (error.code) {
    case 'free_limit':
      return copy.freeLimit;
    case 'daily_limit':
      return copy.dailyLimit;
    case 'analyzer_failed':
    case 'analyzer_unavailable':
    case 'quota_unavailable':
      return copy.analyzerFailed;
    case 'analyzer_timeout':
      return copy.analyzerTimeout;
    default:
      return fallback;
  }
}

/** Face clarity + analysis failures → camera page with the message. */
export function isRetakeScanError(error: unknown): boolean {
  if (isFaceScanError(error)) {
    return true;
  }
  if (!isApiError(error)) {
    return true;
  }
  return RETAKE_CODES.has(error.code);
}
