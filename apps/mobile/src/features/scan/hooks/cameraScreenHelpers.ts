import { useEffect } from 'react';
import type { useRouter } from 'expo-router';

export function useRetakeMessageEffect(
  raw: string | string[] | undefined,
  contextMessage: string | null,
  setRetakeToast: (v: string) => void,
  setRetakeMessage: (v: string | null) => void,
): void {
  useEffect(() => {
    const fromParams = Array.isArray(raw) ? raw[0] : raw;
    const message = contextMessage ?? fromParams;
    if (message) {
      setRetakeToast(message);
      setRetakeMessage(null);
    }
  }, [contextMessage, raw, setRetakeMessage, setRetakeToast]);
}

export function useFaceAnalysisConsentRedirect(
  ready: boolean,
  faceAnalysisGranted: boolean,
  router: ReturnType<typeof useRouter>,
): void {
  useEffect(() => {
    if (ready && !faceAnalysisGranted) {
      router.replace('/(scan)/ai-consent');
    }
  }, [faceAnalysisGranted, ready, router]);
}
