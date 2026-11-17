import type { RefObject } from 'react';

import type { getCopy } from '@/src/copy';

import type { CameraPreviewLiveHandle } from '../components/CameraPreviewLive';
import {
  FACE_IDENTITY_MISMATCH_MESSAGE,
  FaceIdentityError,
  verifyFaceIdentity,
} from '../lib/verifyFaceIdentity';

/** Delay between failed attempts. */
const FAIL_RETRY_MS = 800;
/** Keep watching after unlock so a different face cannot stay unlocked. */
const RECHECK_MS = 1600;
/** Need two matches in a row before unlock (blocks lucky false accepts). */
const REQUIRED_STREAK = 2;

type CameraCopy = ReturnType<typeof getCopy>['screens']['camera'];

export type IdentityProbeDeps = {
  cameraRef: RefObject<CameraPreviewLiveHandle | null>;
  userId: string;
  copy: CameraCopy;
  runIdRef: { current: number };
  streakRef: { current: number };
  identityOkRef: { current: boolean };
  setIdentityOk: (ok: boolean) => void;
  setChecking: (checking: boolean) => void;
  setMessage: (message: string | null) => void;
};

function resetGate(deps: IdentityProbeDeps): void {
  deps.streakRef.current = 0;
  deps.identityOkRef.current = false;
  deps.setIdentityOk(false);
}

function applyMatch(deps: IdentityProbeDeps): void {
  deps.streakRef.current += 1;
  const unlocked = deps.streakRef.current >= REQUIRED_STREAK;
  deps.identityOkRef.current = unlocked;
  deps.setIdentityOk(unlocked);
  deps.setMessage(unlocked ? deps.copy.identityVerified : deps.copy.identityConfirming);
}

function isMismatchMessage(raw: string, copy: CameraCopy): boolean {
  return (
    raw === FACE_IDENTITY_MISMATCH_MESSAGE ||
    raw === copy.identityMismatch ||
    /registered face|doesn't match|does not match/i.test(raw)
  );
}

function failureMessage(error: unknown, copy: CameraCopy): string {
  const raw =
    error instanceof FaceIdentityError || error instanceof Error
      ? error.message
      : copy.identityRetry;
  // Always surface a clear “not registered” signal for mismatch cases.
  return isMismatchMessage(raw, copy) ? copy.identityMismatch : raw;
}

/** Message shown when live identity checking is switched off. */
export function identityDisabledMessage(
  identityEnabled: boolean,
  userId: string | null | undefined,
  copy: CameraCopy,
): string {
  if (!identityEnabled) return copy.framingOnlyHint;
  if (!userId) return copy.identityNeedSignIn;
  return copy.identityNeedNetwork;
}

function announceChecking(deps: IdentityProbeDeps): void {
  if (!deps.identityOkRef.current) {
    deps.setChecking(true);
    deps.setMessage(deps.copy.identityChecking);
  }
}

function sampleFrame(
  cameraRef: RefObject<CameraPreviewLiveHandle | null>,
): Promise<string | null | undefined> {
  return Promise.resolve(cameraRef.current?.sampleFrameUri());
}

/** Starts the repeating registered-face probe; returns a cleanup function. */
export function startIdentityProbeLoop(deps: IdentityProbeDeps): () => void {
  let cancelled = false;
  let retryTimer: ReturnType<typeof setTimeout> | null = null;
  const runId = ++deps.runIdRef.current;
  const isStale = () => cancelled || runId !== deps.runIdRef.current;

  const schedule = (ms: number) => {
    if (isStale()) return;
    retryTimer = setTimeout(() => void probe(), ms);
  };

  const probe = async (): Promise<void> => {
    if (isStale()) return;
    announceChecking(deps);
    try {
      const uri = await sampleFrame(deps.cameraRef);
      if (isStale()) return;
      if (!uri) {
        resetGate(deps);
        deps.setMessage(deps.copy.identityHoldStill);
        schedule(FAIL_RETRY_MS);
        return;
      }
      await verifyFaceIdentity(uri, deps.userId);
      if (isStale()) return;
      applyMatch(deps);
      // Keep watching — another person must not stay unlocked.
      schedule(RECHECK_MS);
    } catch (error) {
      if (isStale()) return;
      resetGate(deps);
      deps.setMessage(failureMessage(error, deps.copy));
      schedule(FAIL_RETRY_MS);
    } finally {
      if (!isStale()) deps.setChecking(false);
    }
  };

  void probe();

  return () => {
    cancelled = true;
    if (retryTimer) clearTimeout(retryTimer);
  };
}
