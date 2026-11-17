import { Platform } from 'react-native';
import type { RefObject } from 'react';

import { getCopy } from '@/src/copy';

import type { CameraPreviewLiveHandle } from '../components/CameraPreviewLive';
import type { PendingScanCapture } from '../context/ScanCaptureContext';
import { assessLiveScanFrame } from '../lib/assessLiveScanFrame';
import { attestScanLiveness } from '../lib/attestScanLiveness';
import { isFaceIdentityEnabled } from '../lib/faceConfig';
import { messageForLiveIssue } from '../lib/liveGuidanceCopy';
import { prepareScanImage, ScanImageError } from '../lib/prepareScanImage';
import {
  FACE_IDENTITY_UNCERTAIN_MESSAGE,
  FACE_IDENTITY_VERIFIED_MESSAGE,
  type FaceBoxNorm,
  type FaceIdentityProof,
  type FaceMatchResult,
} from '../lib/verifyFaceIdentity';

type CameraCopy = ReturnType<typeof getCopy>['screens']['camera'];

function newIdempotencyKey(): string {
  const c = globalThis.crypto;
  if (c && typeof c.randomUUID === 'function') {
    return c.randomUUID();
  }
  return `scan-${String(Date.now())}`;
}

export type CaptureScanPhotoOptions = {
  cameraRef: RefObject<CameraPreviewLiveHandle | null>;
  ensureCamera: () => Promise<boolean>;
  verifyIdentity: (uri: string) => Promise<FaceMatchResult>;
  completeLiveness: (faceBox: FaceBoxNorm) => Promise<string>;
  onStatus?: (message: string) => void;
};

function assertCaptureAvailable(c: CameraCopy): void {
  if (Platform.OS === 'web') {
    throw new Error(c.identityNeedSignIn);
  }
  if (!isFaceIdentityEnabled()) {
    throw new Error(c.identityUnavailable);
  }
}

/** Take the shutter photo and make sure lighting/face framing is acceptable. */
async function takeAssessedPhoto(
  cameraRef: RefObject<CameraPreviewLiveHandle | null>,
  c: CameraCopy,
): Promise<string> {
  const uri = await cameraRef.current?.takePhoto();
  if (!uri) {
    throw new Error(c.captureFailed);
  }

  const assessment = await assessLiveScanFrame(uri);
  if (!assessment.ok) {
    throw new Error(messageForLiveIssue(assessment.issue));
  }
  if (!attestScanLiveness(assessment)) {
    throw new Error(c.captureFailed);
  }
  return uri;
}

async function buildPendingCapture(
  uri: string,
  faceIdentity: FaceIdentityProof,
  c: CameraCopy,
): Promise<PendingScanCapture> {
  try {
    const prepared = await prepareScanImage(uri);
    return {
      idempotencyKey: newIdempotencyKey(),
      imageBase64: prepared.base64,
      contentType: prepared.contentType,
      faceIdentity,
    };
  } catch (error) {
    throw new Error(prepareErrorMessage(error, c));
  }
}

/**
 * Photo-first for registered users:
 * shutter → lighting/face tips on THAT photo → match registered face →
 * then finish quiet server liveness → upload.
 * Identity is the hard gate; liveness never blocks a clear matched selfie.
 */
export async function captureScanPhoto(
  options: CaptureScanPhotoOptions,
): Promise<PendingScanCapture> {
  const { cameraRef, ensureCamera, verifyIdentity, completeLiveness, onStatus } = options;
  const c = getCopy().screens.camera;

  assertCaptureAvailable(c);

  const ok = await ensureCamera();
  if (!ok) {
    throw new Error(c.permissionDenied);
  }

  onStatus?.(c.capturing);

  const uri = await takeAssessedPhoto(cameraRef, c);

  onStatus?.(c.identityCheckingPhoto);
  const match = await verifyIdentity(uri);

  onStatus?.(c.livenessQuiet);
  const livenessChallengeId = await completeLiveness(match.faceBox);

  const faceIdentity: FaceIdentityProof = {
    ...match,
    livenessPassed: true,
    livenessChallengeId,
  };

  onStatus?.(FACE_IDENTITY_VERIFIED_MESSAGE);

  return buildPendingCapture(uri, faceIdentity, c);
}

function prepareErrorMessage(error: unknown, c: CameraCopy): string {
  if (error instanceof ScanImageError) {
    if (error.code === 'too_small') return c.qualityTooSmall;
    if (error.code === 'too_large') return c.qualityTooLarge;
  }
  return error instanceof Error && error.message === FACE_IDENTITY_UNCERTAIN_MESSAGE
    ? error.message
    : c.captureFailed;
}
