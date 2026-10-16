import { fetchConsentStatus } from './api/consentApi';
import { readLocalFaceConsent } from './localConsentStore';

/**
 * When API is live, server consent is source of truth — fail closed on fetch errors
 * (do not trust local AsyncStorage to unlock scan UI). DERM-068.
 */
export async function loadFaceConsent(apiLive: boolean): Promise<boolean> {
  if (!apiLive) {
    return readLocalFaceConsent();
  }
  try {
    const status = await fetchConsentStatus();
    return status.faceAnalysis.granted;
  } catch {
    return false;
  }
}
