import { fetchConsentStatus } from '@/src/features/consent/api/consentApi';
import { grantFaceConsent } from '@/src/features/consent/grantFaceConsent';
import { isApiError } from '@/src/lib/api/errors';

import { createScan } from '../api/scanApi';
import type { PendingScanCapture } from '../context/ScanCaptureContext';
import { isRetakeScanError, messageForScanUploadError } from '../lib/scanUploadErrors';

export type UploadOutcome =
  | { kind: 'ok'; scan: Awaited<ReturnType<typeof createScan>>['scan'] }
  | { kind: 'needs_consent' }
  | { kind: 'retake'; message: string }
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
    const result = await createScan({
      idempotencyKey: pending.idempotencyKey,
      imageBase64: pending.imageBase64,
      contentType: pending.contentType,
    });
    return { kind: 'ok', scan: result.scan };
  } catch (error) {
    if (isApiError(error) && error.code === 'consent_required') {
      return { kind: 'needs_consent' };
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
