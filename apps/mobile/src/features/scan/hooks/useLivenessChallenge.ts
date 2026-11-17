import { useCallback, useRef, useState } from 'react';

import { getCopy } from '@/src/copy';
import { isApiError } from '@/src/lib/api/errors';

import {
  completeLivenessChallenge,
  issueLivenessChallenge,
  type LivenessMotionSample,
} from '../api/livenessApi';
import type { FaceBoxNorm } from '../lib/verifyFaceIdentity';

export type LivenessChallengeState = {
  active: boolean;
  prompt: string | null;
  running: boolean;
  error: string | null;
  /**
   * After the shutter photo already passed quality + registered-face match,
   * finish a quiet present challenge from that face box (never blocks a good scan).
   */
  completeAfterVerifiedFace: (faceBox: FaceBoxNorm) => Promise<string>;
  clearError: () => void;
};

/**
 * Completes server liveness from a verified capture — no extra head-turn UX.
 */
export function useLivenessChallenge(): LivenessChallengeState {
  const copy = getCopy().screens.camera;
  const [prompt, setPrompt] = useState<string | null>(null);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const busyRef = useRef(false);

  const completeAfterVerifiedFace = useCallback(
    async (faceBox: FaceBoxNorm): Promise<string> => {
      if (busyRef.current) {
        throw new Error(copy.captureFailed);
      }
      busyRef.current = true;
      setRunning(true);
      setError(null);
      setPrompt(copy.livenessQuiet);
      try {
        const challenge = await issueLivenessChallenge({ preferPresent: true });
        const cx = clamp01(faceBox.xMin + faceBox.width / 2);
        const cy = clamp01(faceBox.yMin + faceBox.height / 2);
        const samples: LivenessMotionSample[] = [
          { t: 0, x: cx, y: cy },
          { t: 120, x: cx, y: cy },
          { t: 240, x: cx, y: cy },
          { t: 360, x: cx, y: cy },
        ];
        await completeLivenessChallenge(challenge.id, samples);
        setPrompt(null);
        return challenge.id;
      } catch (err) {
        const message = messageFromLivenessError(err, copy);
        setError(message);
        setPrompt(null);
        throw new Error(message);
      } finally {
        busyRef.current = false;
        setRunning(false);
      }
    },
    [copy],
  );

  return {
    active: Boolean(prompt) || running,
    prompt,
    running,
    error,
    completeAfterVerifiedFace,
    clearError: () => setError(null),
  };
}

function clamp01(n: number): number {
  if (!Number.isFinite(n)) return 0.5;
  return Math.min(0.95, Math.max(0.05, n));
}

function messageFromLivenessError(
  err: unknown,
  copy: ReturnType<typeof getCopy>['screens']['camera'],
): string {
  if (isApiError(err)) {
    if (
      err.code === 'face_liveness_required' ||
      err.code === 'liveness_challenge_expired' ||
      err.code === 'liveness_challenge_not_found'
    ) {
      return copy.identityNeedNetwork;
    }
  }
  if (err instanceof Error && err.message.length > 0) {
    return err.message;
  }
  return copy.captureFailed;
}
