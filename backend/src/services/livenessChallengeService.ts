import { randomUUID } from 'node:crypto';

import { HttpError } from '../http/HttpError';

/** `present` = photo-first live-camera hold after identity. Directional types = stronger PAD. */
export type LivenessChallengeType = 'turn_left' | 'turn_right' | 'nod_down' | 'present';

export type LivenessChallenge = {
  id: string;
  userId: string;
  type: LivenessChallengeType;
  createdAt: number;
  expiresAt: number;
  completedAt: number | null;
};

export type LivenessMotionEvidence = {
  /** Normalized face-center samples over time (x,y in 0–1). */
  samples: { t: number; x: number; y: number }[];
};

const TTL_MS = 90_000;

export type LivenessIssueOpts = {
  /** Quiet photo-first hold (default for scans). */
  preferPresent?: boolean;
};

export type LivenessChallengeService = {
  issue: (userId: string, opts?: LivenessIssueOpts) => LivenessChallenge;
  complete: (userId: string, challengeId: string, evidence: LivenessMotionEvidence) => void;
  consumeCompleted: (userId: string, challengeId: string) => void;
};

/**
 * `present` is intentionally lenient: face stayed framed across a short window.
 * Real protection for scans is native camera + registered-face match + server re-embed.
 * Directional challenges remain strict for stronger PAD flows.
 */
export function createLivenessChallengeService(): LivenessChallengeService {
  const store: ChallengeStore = new Map<string, LivenessChallenge>();

  return {
    issue: (userId, opts) => issueChallenge(store, userId, opts),
    complete: (userId, challengeId, evidence) =>
      completeChallenge(store, userId, challengeId, evidence),
    consumeCompleted: (userId, challengeId) => consumeChallenge(store, userId, challengeId),
  };
}

type ChallengeStore = Map<string, LivenessChallenge>;

function pruneExpired(store: ChallengeStore): void {
  const now = Date.now();
  for (const [id, c] of store) {
    if (c.expiresAt < now) store.delete(id);
  }
}

function issueChallenge(
  store: ChallengeStore,
  userId: string,
  opts?: LivenessIssueOpts,
): LivenessChallenge {
  pruneExpired(store);
  const type: LivenessChallengeType = opts?.preferPresent
    ? 'present'
    : (['turn_left', 'turn_right', 'nod_down'] as const)[Math.floor(Math.random() * 3)]!;
  const now = Date.now();
  const challenge: LivenessChallenge = {
    id: randomUUID(),
    userId,
    type,
    createdAt: now,
    expiresAt: now + TTL_MS,
    completedAt: null,
  };
  store.set(challenge.id, challenge);
  return challenge;
}

function completeChallenge(
  store: ChallengeStore,
  userId: string,
  challengeId: string,
  evidence: LivenessMotionEvidence,
): void {
  pruneExpired(store);
  const challenge = store.get(challengeId);
  if (!challenge || challenge.userId !== userId) {
    throw new HttpError(404, 'liveness_challenge_not_found');
  }
  if (challenge.expiresAt < Date.now()) {
    store.delete(challengeId);
    throw new HttpError(410, 'liveness_challenge_expired');
  }
  if (challenge.completedAt) {
    return;
  }
  if (!motionPasses(challenge.type, evidence)) {
    throw new HttpError(403, 'face_liveness_required');
  }
  challenge.completedAt = Date.now();
}

function consumeChallenge(store: ChallengeStore, userId: string, challengeId: string): void {
  pruneExpired(store);
  const challenge = store.get(challengeId);
  if (!challenge || challenge.userId !== userId) {
    throw new HttpError(403, 'face_liveness_required');
  }
  if (!challenge.completedAt || challenge.expiresAt < Date.now()) {
    store.delete(challengeId);
    throw new HttpError(403, 'face_liveness_required');
  }
  store.delete(challengeId);
}

function motionPasses(type: LivenessChallengeType, evidence: LivenessMotionEvidence): boolean {
  const samples = evidence.samples
    .filter((s) => Number.isFinite(s.t) && Number.isFinite(s.x) && Number.isFinite(s.y))
    .sort((a, b) => a.t - b.t);
  if (samples.length < 4) {
    return false;
  }
  const first = samples[0]!;
  const last = samples[samples.length - 1]!;
  const duration = last.t - first.t;
  if (duration < 200 || duration > 12_000) {
    return false;
  }

  if (type === 'present') {
    // Lenient: face stayed in a reasonable region. No jitter gate — that blocked
    // real users holding still after a clear registered-face match.
    return samples.every((s) => s.x >= 0 && s.x <= 1 && s.y >= 0 && s.y <= 1);
  }

  const dx = last.x - first.x;
  const dy = last.y - first.y;
  const absX = Math.abs(dx);
  const absY = Math.abs(dy);
  const MIN = 0.08;
  if (type === 'turn_left') {
    return dx <= -MIN && absX > absY * 0.7;
  }
  if (type === 'turn_right') {
    return dx >= MIN && absX > absY * 0.7;
  }
  return dy >= MIN && absY > absX * 0.7;
}
