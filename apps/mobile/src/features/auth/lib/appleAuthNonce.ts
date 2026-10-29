import * as Crypto from 'expo-crypto';

/**
 * Raw nonce for both AppleAuthentication and Supabase GoTrue.
 * Apple's ASAuthorizationOpenIDRequest hashes this with SHA-256 before putting
 * it in the identity token — do NOT pre-hash here (that double-hashes and fails
 * GoTrue nonce verification).
 */
export async function createAppleAuthNonce(): Promise<{ rawNonce: string }> {
  const bytes = await Crypto.getRandomBytesAsync(32);
  const rawNonce = Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
  return { rawNonce };
}
