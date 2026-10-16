/**
 * Banned marketing / processing phrases (PRODUCT.md D4 / DERM-061).
 * Keep patterns lowercase; matcher lowercases the haystack.
 */
export const BANNED_CLAIM_PATTERNS: readonly RegExp[] = [
  /photos?\s+never\s+leave/,
  /never\s+leave\s+your\s+(phone|device)/,
  /photos?\s+stay\s+(on\s+your\s+(phone|device)|private)/,
  /stay\s+on\s+your\s+(phone|device)/,
  /\bon[- ]device\b/,
  /clinical\s+scoring/,
  /derm[- ]built\s+clinical/,
  /clinical\s+notes/,
  /41k/,
  /68\s+landmarks?/,
  /uv\s+index/,
  /skin\s+age(?!\s+estimate)/,
  /full\s+zone\s+map\s+on\s+every\s+scan/,
  /photos?\s+stay\s+on\s+your/,
];

export function findBannedClaim(text: string): string | null {
  const hay = text.toLowerCase();
  for (const pattern of BANNED_CLAIM_PATTERNS) {
    if (pattern.test(hay)) {
      return pattern.source;
    }
  }
  return null;
}

/** Flatten nested copy objects into string leaves (skips functions). */
export function collectCopyStrings(node: unknown, path = 'copy'): string[] {
  if (typeof node === 'string') {
    return [`${path}: ${node}`];
  }
  if (Array.isArray(node)) {
    return node.flatMap((item, index) => collectCopyStrings(item, `${path}[${String(index)}]`));
  }
  if (node !== null && typeof node === 'object') {
    return Object.entries(node as Record<string, unknown>).flatMap(([key, value]) =>
      collectCopyStrings(value, `${path}.${key}`),
    );
  }
  return [];
}
