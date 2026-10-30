import { isApiError } from '@/src/lib/api/errors';

import type { scanConsentCopy } from '@/src/copy/screens/scanConsent';

/**
 * Scan upload error classification. Pure (no copy catalog import) so it is
 * unit-testable; scanUploadErrors.ts turns keys into strings.
 */
type ScanMessageKey = keyof typeof scanConsentCopy;

/** Server/client codes → the message the user sees. Unknown codes use the fallback. */
const MESSAGE_KEY_BY_CODE: Record<string, ScanMessageKey> = {
  free_limit: 'freeLimit',
  daily_limit: 'dailyLimit',
  analyzer_failed: 'analyzerFailed',
  analyzer_timeout: 'analyzerTimeout',
  network_timeout: 'analyzerTimeout',
  network_unreachable: 'networkUnreachable',
  analyzer_unavailable: 'serviceUnavailable',
  quota_unavailable: 'serviceUnavailable',
  scan_pipeline_disabled: 'serviceUnavailable',
  invalid_image: 'imageInvalid',
  invalid_body: 'imageInvalid',
  invalid_json: 'imageInvalid',
  image_too_small: 'imageInvalid',
  image_too_large: 'imageInvalid',
  invalid_image_encoding: 'imageInvalid',
  invalid_content_type: 'imageInvalid',
  payload_too_large: 'imageInvalid',
};

/**
 * Transient failures where the server may still have finished (or be about to
 * finish) the scan. Retrying with the SAME idempotency key replays a saved scan
 * instead of creating a second one and spending quota twice.
 */
const SAME_KEY_RETRY_CODES = new Set([
  'network_timeout',
  'network_unreachable',
  'analyzer_timeout',
]);

export function scanMessageKey(code: string): ScanMessageKey | undefined {
  return MESSAGE_KEY_BY_CODE[code];
}

/** Errors that send the user back to the camera (not stay on Analysing). */
export function isRetakeScanCode(code: string): boolean {
  return code in MESSAGE_KEY_BY_CODE;
}

export function isSameKeyRetryable(error: unknown): boolean {
  return isApiError(error) && SAME_KEY_RETRY_CODES.has(error.code);
}

/** Free scan used up — the useful next step is the paywall, not another photo. */
export function isUpgradeScanError(error: unknown): boolean {
  return isApiError(error) && error.code === 'free_limit';
}
