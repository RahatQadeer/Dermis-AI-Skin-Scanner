import { HttpError } from '../http/HttpError';
import { json } from '../http/respond';
import { livenessCompleteSchema, livenessIssueSchema } from '../schemas/faceReferenceApi';
import type { LivenessChallengeService } from '../services/livenessChallengeService';

export async function handleIssueLivenessChallenge(
  liveness: LivenessChallengeService,
  userId: string,
  body: unknown,
): Promise<Response> {
  const parsed = livenessIssueSchema.safeParse(body ?? {});
  if (!parsed.success) {
    throw new HttpError(400, 'invalid_body');
  }
  const challenge = liveness.issue(userId, {
    preferPresent: parsed.data.preferPresent === true,
  });
  return json({
    challenge: {
      id: challenge.id,
      type: challenge.type,
      expiresAt: new Date(challenge.expiresAt).toISOString(),
    },
  });
}

export async function handleCompleteLivenessChallenge(
  liveness: LivenessChallengeService,
  userId: string,
  body: unknown,
): Promise<Response> {
  const parsed = livenessCompleteSchema.safeParse(body);
  if (!parsed.success) {
    throw new HttpError(400, 'invalid_body');
  }
  liveness.complete(userId, parsed.data.challengeId, { samples: parsed.data.samples });
  return json({ ok: true });
}
