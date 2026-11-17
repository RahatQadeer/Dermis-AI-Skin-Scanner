import { getApiClient } from '@/src/lib/api/client';

export type LivenessChallengeType = 'turn_left' | 'turn_right' | 'nod_down' | 'present';

export type LivenessChallengeDto = {
  id: string;
  type: LivenessChallengeType;
  expiresAt: string;
};

export type LivenessMotionSample = { t: number; x: number; y: number };

export async function issueLivenessChallenge(
  opts: { preferPresent?: boolean } = {},
): Promise<LivenessChallengeDto> {
  const res = await getApiClient().post<{ challenge: LivenessChallengeDto }>(
    '/v1/face-liveness/challenge',
    { preferPresent: opts.preferPresent === true },
  );
  return res.challenge;
}

export async function completeLivenessChallenge(
  challengeId: string,
  samples: LivenessMotionSample[],
): Promise<void> {
  await getApiClient().post('/v1/face-liveness/complete', { challengeId, samples });
}
