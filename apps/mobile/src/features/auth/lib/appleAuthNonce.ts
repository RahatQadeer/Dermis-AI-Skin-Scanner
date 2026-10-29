import * as Crypto from 'expo-crypto';

/** Raw nonce for GoTrue + SHA-256 hex digest for AppleAuthentication.signInAsync. */
export async function createAppleAuthNonce(): Promise<{ rawNonce: string; hashedNonce: string }> {
  const bytes = await Crypto.getRandomBytesAsync(32);
  const rawNonce = Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
  const hashedNonce = await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, rawNonce);
  return { rawNonce, hashedNonce };
}
