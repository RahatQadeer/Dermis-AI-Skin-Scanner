import { isApiError } from '@/src/lib/api/errors';

import { fetchConsentStatus, grantFaceAnalysisConsent } from './api/consentApi';
import { FACE_ANALYSIS_CONSENT_VERSION } from './constants';
import { writeLocalFaceConsent } from './localConsentStore';

export async function grantFaceConsent(apiLive: boolean): Promise<'ok' | 'error'> {
  try {
    if (apiLive) {
      await grantOnServerWithRetry();
    }
    try {
      await writeLocalFaceConsent(true);
    } catch {
      // Server grant is source of truth when API is live.
      if (!apiLive) {
        return 'error';
      }
    }
    return 'ok';
  } catch (error) {
    if (__DEV__) {
      const code = isApiError(error) ? error.code : 'unknown';
      console.warn('[consent] grantFaceConsent failed:', code, error);
    }
    return 'error';
  }
}

async function grantOnServerWithRetry(): Promise<void> {
  try {
    await grantFaceAnalysisConsent(FACE_ANALYSIS_CONSENT_VERSION);
    return;
  } catch (first) {
    // Already granted (or grant landed despite error response).
    if (await serverFaceConsentGranted()) {
      return;
    }
    // One retry for flaky LAN / Expo Go.
    try {
      await grantFaceAnalysisConsent(FACE_ANALYSIS_CONSENT_VERSION);
      return;
    } catch (second) {
      if (await serverFaceConsentGranted()) {
        return;
      }
      throw second ?? first;
    }
  }
}

async function serverFaceConsentGranted(): Promise<boolean> {
  try {
    const status = await fetchConsentStatus();
    return status.faceAnalysis.granted;
  } catch {
    return false;
  }
}
