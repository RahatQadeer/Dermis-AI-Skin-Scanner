/** Must match backend consent version (`face-analysis-v1`). */
export const FACE_ANALYSIS_CONSENT_VERSION = 'face-analysis-v1' as const;

export const LOCAL_FACE_CONSENT_KEY = `dermis.consent.${FACE_ANALYSIS_CONSENT_VERSION}`;
