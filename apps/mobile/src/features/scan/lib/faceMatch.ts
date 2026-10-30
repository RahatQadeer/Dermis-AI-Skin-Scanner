/**
 * Pure face-identity matching math (no react-native import → unit-testable).
 * Embeddings are compared with cosine similarity; vectors are expected to be
 * L2-normalized but cosine is computed defensively regardless.
 */
export function cosineSimilarity(a: readonly number[], b: readonly number[]): number {
  if (a.length === 0 || a.length !== b.length) {
    return 0;
  }
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i += 1) {
    const x = a[i]!;
    const y = b[i]!;
    dot += x * y;
    normA += x * x;
    normB += y * y;
  }
  if (normA === 0 || normB === 0) {
    return 0;
  }
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

export function isSameIdentity(
  a: readonly number[],
  b: readonly number[],
  threshold: number,
): boolean {
  if (a.length === 0 || a.length !== b.length) {
    return false;
  }
  return cosineSimilarity(a, b) >= threshold;
}

export type FaceGateInput = {
  /** A recognition model is configured (gate is active). */
  enabled: boolean;
  /** The user already has a registered reference. */
  hasReference: boolean;
  /** Embedding of the just-captured face, or null if none could be produced. */
  currentEmbedding: readonly number[] | null;
  /** The registered reference embedding, or null. */
  referenceEmbedding: readonly number[] | null;
  threshold: number;
};

export type FaceGateDecision =
  | { action: 'allow' }
  | { action: 'enroll' }
  | { action: 'block'; reason: 'mismatch' | 'no_embedding' };

/**
 * Decides what the identity gate should do before a scan. Fail-closed: when a
 * reference exists but no embedding can be produced, block (never silently
 * allow a scan that bypasses verification).
 */
export function decideFaceGate(input: FaceGateInput): FaceGateDecision {
  if (!input.enabled) {
    return { action: 'allow' };
  }
  if (!input.hasReference) {
    // First enrollment needs a usable embedding; without one, don't block the
    // user's very first scan (nothing to verify against yet).
    return input.currentEmbedding ? { action: 'enroll' } : { action: 'allow' };
  }
  if (!input.currentEmbedding || !input.referenceEmbedding) {
    return { action: 'block', reason: 'no_embedding' };
  }
  return isSameIdentity(input.currentEmbedding, input.referenceEmbedding, input.threshold)
    ? { action: 'allow' }
    : { action: 'block', reason: 'mismatch' };
}
