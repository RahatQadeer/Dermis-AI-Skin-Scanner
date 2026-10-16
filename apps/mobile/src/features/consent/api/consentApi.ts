import { getApiClient } from '@/src/lib/api/client';

export type ConsentStatusDto = {
  faceAnalysis: {
    requiredVersion: string;
    granted: boolean;
    activeVersion: string | null;
  };
};

export async function fetchConsentStatus(): Promise<ConsentStatusDto> {
  const res = await getApiClient().get<{ status: ConsentStatusDto }>('/v1/consents/status');
  return res.status;
}

export async function grantFaceAnalysisConsent(version: string): Promise<void> {
  await getApiClient().post('/v1/consents', {
    type: 'face_analysis',
    version,
    granted: true,
  });
}
