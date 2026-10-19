import { getCopy } from '@/src/copy';
import { isApiError } from '@/src/lib/api/errors';

import { isFaceScanError, messageForFaceScanError } from './faceScanErrors';

/** Errors that should send the user back to the camera (not stay on Analysing). */
const RETAKE_CODES = new Set([
  'analyzer_failed',
  'analyzer_unavailable',
  'analyzer_timeout',
  'network_timeout',
  'network_unreachable',
  'quota_unavailable',
  'invalid_image',
  'invalid_body',
  'free_limit',
  'daily_limit',
]);

function messageForApiScanCode(
  code: string,
  copy: ReturnType<typeof getCopy>['screens']['scanConsent'],
  fallback: string,
): string {
  if (code === 'free_limit') return copy.freeLimit;
  if (code === 'daily_limit') return copy.dailyLimit;
  if (
    code === 'analyzer_failed' ||
    code === 'analyzer_unavailable' ||
    code === 'quota_unavailable' ||
    code === 'network_unreachable'
  ) {
    return copy.analyzerFailed;
  }
  if (code === 'analyzer_timeout' || code === 'network_timeout') {
    return copy.analyzerTimeout;
  }
  return fallback;
}

export function messageForScanUploadError(error: unknown, fallback: string): string {
  if (isFaceScanError(error)) {
    return messageForFaceScanError(error);
  }
  if (!isApiError(error)) {
    return fallback;
  }
  return messageForApiScanCode(error.code, getCopy().screens.scanConsent, fallback);
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
