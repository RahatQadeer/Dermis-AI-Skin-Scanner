import { useEffect, useRef, useState, type RefObject } from 'react';

import { getCopy } from '@/src/copy';
import { useSession } from '@/src/features/session/SessionContext';

import type { CameraPreviewLiveHandle } from '../components/CameraPreviewLive';
import { isFaceIdentityEnabled } from '../lib/faceConfig';
import { identityDisabledMessage, startIdentityProbeLoop } from './liveIdentityProbe';

export type LiveIdentityGate = {
  identityOk: boolean;
  checking: boolean;
  message: string | null;
};

/**
 * Live registered-face gate.
 * - Unlocks only after consecutive matches
 * - Keeps re-checking; a different face immediately shows "not registered"
 * - Capture photo still re-verifies before upload
 */
export function useLiveIdentityGate(
  cameraRef: RefObject<CameraPreviewLiveHandle | null>,
  framingReady: boolean,
  active: boolean,
): LiveIdentityGate {
  const { userId, apiEnabled } = useSession();
  const copy = getCopy().screens.camera;
  const identityEnabled = isFaceIdentityEnabled();
  const identityOn = identityEnabled && apiEnabled && Boolean(userId);
  const [identityOk, setIdentityOk] = useState(false);
  const [checking, setChecking] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const runIdRef = useRef(0);
  const streakRef = useRef(0);
  const identityOkRef = useRef(false);

  useEffect(() => {
    identityOkRef.current = identityOk;
  }, [identityOk]);

  useEffect(() => {
    streakRef.current = 0;
    identityOkRef.current = false;
    setIdentityOk(false);

    if (!identityOn) {
      setChecking(false);
      setMessage(identityDisabledMessage(identityEnabled, userId, copy));
      return;
    }
    if (!active || !userId || !framingReady) {
      setChecking(false);
      setMessage(null);
      return;
    }
    return startIdentityProbeLoop({
      cameraRef,
      userId,
      copy,
      runIdRef,
      streakRef,
      identityOkRef,
      setIdentityOk,
      setChecking,
      setMessage,
    });
  }, [active, cameraRef, copy, framingReady, identityEnabled, identityOn, userId]);

  return { identityOk, checking, message };
}
