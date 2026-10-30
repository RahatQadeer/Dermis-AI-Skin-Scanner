import { fetchConsentStatus } from '@/src/features/consent/api/consentApi';
import { grantFaceConsent } from '@/src/features/consent/grantFaceConsent';
import { isApiError } from '@/src/lib/api/errors';

import { createScan } from '../api/scanApi';
import type { PendingScanCapture } from '../context/ScanCaptureContext';
import {
  isRetakeScanError,
  isSameKeyRetryable,
  isUpgradeScanError,
  messageForScanUploadError,
} from '../lib/scanUploadErrors';

/** Short pause so a request the server is still finishing can land first. */
const SAME_KEY_RETRY_DELAY_MS = 3000;

/**
 * One retry on timeout / dropped connection, with the SAME idempotency key:
 * if the first request actually completed server-side, the retry returns that
 * saved scan instead of creating a duplicate and spending quota again.
 */
async function createScanWithSameKeyRetry(pending: PendingScanCapture) {
  const input = {
    idempotencyKey: pending.idempotencyKey,
    imageBase64: pending.imageBase64,
    contentType: pending.contentType,
  };
  try {
    return await createScan(input);
  } catch (error) {
    if (!isSameKeyRetryable(error)) {
      throw error;
    }
    await new Promise((resolve) => setTimeout(resolve, SAME_KEY_RETRY_DELAY_MS));
    return createScan(input);
  }
}

export type UploadOutcome =
  | { kind: 'ok'; scan: Awaited<ReturnType<typeof createScan>>['scan'] }
  | { kind: 'needs_consent' }
  | { kind: 'retake'; message: string }
  | { kind: 'upgrade' }
  | { kind: 'error'; message: string };

export async function uploadScanWithConsent(
  pending: PendingScanCapture,
  messages: { uploadError: string; consentError: string },
): Promise<UploadOutcome> {
  try {
    const status = await fetchConsentStatus();
    if (!status.faceAnalysis.granted) {
      return { kind: 'needs_consent' };
    }
    const result = await createScanWithSameKeyRetry(pending);
    return { kind: 'ok', scan: result.scan };
  } catch (error) {
    if (isApiError(error) && error.code === 'consent_required') {
      return { kind: 'needs_consent' };
    }
    if (isUpgradeScanError(error)) {
      return { kind: 'upgrade' };
    }
    if (isRetakeScanError(error)) {
      return { kind: 'retake', message: messageForScanUploadError(error, messages.uploadError) };
    }
    return {
      kind: 'error',
      message: messageForScanUploadError(error, messages.uploadError),
    };
  }
}

export async function grantAndUploadScan(
  pending: PendingScanCapture,
  messages: { uploadError: string; consentError: string },
): Promise<UploadOutcome> {
  const granted = await grantFaceConsent(true);
  if (granted !== 'ok') {
    return { kind: 'error', message: messages.consentError };
  }
  return uploadScanWithConsent(pending, messages);
}
