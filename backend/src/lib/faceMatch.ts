/**
 * Pure face-identity matching (cosine similarity). Kept free of HTTP/DB imports
 * so unit tests can run under the node test runner.
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

/** Default cosine pass threshold (MobileFaceNet). Strict — other faces must fail. */
export const DEFAULT_FACE_MATCH_THRESHOLD = 0.94;

export function resolveFaceMatchThreshold(
  raw: string | undefined = process.env.DERMIS_FACE_MATCH_THRESHOLD,
): number {
  const n = Number(raw);
  return Number.isFinite(n) && n > 0 && n < 1 ? n : DEFAULT_FACE_MATCH_THRESHOLD;
}
