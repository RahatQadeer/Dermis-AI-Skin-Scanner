import { getCopy } from '@/src/copy';
import { isApiError } from '@/src/lib/api/errors';

import { isFaceScanError, messageForFaceScanError } from './faceScanErrors';
import { isRetakeScanCode, scanMessageKey } from './scanErrorCodes';

export { isSameKeyRetryable, isUpgradeScanError } from './scanErrorCodes';

type ScanCopy = ReturnType<typeof getCopy>['screens']['scanConsent'];

function messageForApiScanCode(code: string, copy: ScanCopy, fallback: string): string {
  const key = scanMessageKey(code);
  return key ? copy[key] : fallback;
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
  return isRetakeScanCode(error.code);
}
