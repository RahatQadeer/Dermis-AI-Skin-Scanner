import { Platform } from 'react-native';
import type { RefObject } from 'react';

import { getCopy } from '@/src/copy';

import type { CameraPreviewLiveHandle } from '../components/CameraPreviewLive';
import { WEB_STUB_SCAN_IMAGE_BASE64 } from '../constants/webStubImage';
import type { PendingScanCapture } from '../context/ScanCaptureContext';
import { assessLiveScanFrame } from '../lib/assessLiveScanFrame';
import { messageForLiveIssue } from '../lib/liveGuidanceCopy';
import { prepareScanImage, ScanImageError } from '../lib/prepareScanImage';

function newIdempotencyKey(): string {
  const c = globalThis.crypto;
  if (c && typeof c.randomUUID === 'function') {
    return c.randomUUID();
  }
  return `scan-${String(Date.now())}`;
}

export async function captureScanPhoto(
  cameraRef: RefObject<CameraPreviewLiveHandle | null>,
  ensureCamera: () => Promise<boolean>,
  /** Identity gate (approach D2). Throws to block a mismatched face. */
  verifyIdentity?: (uri: string) => Promise<void>,
): Promise<PendingScanCapture> {
  const c = getCopy().screens.camera;
  const liveCamera = Platform.OS !== 'web';

  if (!liveCamera) {
    return {
      idempotencyKey: newIdempotencyKey(),
      imageBase64: WEB_STUB_SCAN_IMAGE_BASE64,
      contentType: 'image/jpeg',
    };
  }

  const ok = await ensureCamera();
  if (!ok) {
    throw new Error(c.permissionDenied);
  }
  const uri = await cameraRef.current?.takePhoto();
  if (!uri) {
    throw new Error(c.captureFailed);
  }

  // Re-validate the real capture (face + quality) before upload.
  const assessment = await assessLiveScanFrame(uri);
  if (!assessment.ok) {
    throw new Error(messageForLiveIssue(assessment.issue));
  }

  // Verify the captured face is the registered user before any analysis.
  await verifyIdentity?.(uri);

  try {
    const prepared = await prepareScanImage(uri);
    return {
      idempotencyKey: newIdempotencyKey(),
      imageBase64: prepared.base64,
      contentType: prepared.contentType,
    };
  } catch (error) {
    throw new Error(prepareErrorMessage(error, c));
  }
}

type CameraCopy = ReturnType<typeof getCopy>['screens']['camera'];

function prepareErrorMessage(error: unknown, c: CameraCopy): string {
  if (error instanceof ScanImageError) {
    if (error.code === 'too_small') {
      return c.qualityTooSmall;
    }
    if (error.code === 'too_large') {
      return c.qualityTooLarge;
    }
  }
  return c.captureFailed;
}
