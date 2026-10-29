/** Public Google OAuth client IDs (not secrets). Both required for id_token flow. */
export type GoogleAuthClientIds = {
  iosClientId: string;
  webClientId: string;
};

export function getGoogleAuthClientIds(): GoogleAuthClientIds | null {
  const iosClientId = (process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID ?? '').trim();
  const webClientId = (process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID ?? '').trim();
  if (!iosClientId || !webClientId) {
    return null;
  }
  return { iosClientId, webClientId };
}

export function isGoogleAuthConfigured(): boolean {
  return getGoogleAuthClientIds() !== null;
}
