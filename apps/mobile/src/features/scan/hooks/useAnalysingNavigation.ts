import { useRouter } from 'expo-router';
import { useCallback, useEffect, useRef } from 'react';

import { getCopy } from '@/src/copy';

import { useScanCapture } from '../context/ScanCaptureContext';

export function useAnalysingOfflineGuard(apiLive: boolean) {
  const router = useRouter();
  const { pending, setPending } = useScanCapture();
  const offlineSentRef = useRef(false);
  const camera = getCopy().screens.camera;

  useEffect(() => {
    if (apiLive || offlineSentRef.current || !pending) {
      return;
    }
    offlineSentRef.current = true;
    setPending(null);
    router.replace({
      pathname: '/(scan)/camera',
      params: { retakeMessage: camera.needServer },
    });
  }, [apiLive, camera.needServer, pending, router, setPending]);
}

export function useAnalysingResultsNavigation(completeNow: () => void) {
  const router = useRouter();
  const { pending, lastScan } = useScanCapture();
  const finishingRef = useRef(false);
  const sawPendingRef = useRef(Boolean(pending));
  const goResultsWhenScanReadyRef = useRef(false);

  const onScanAccepted = useCallback(() => {
    goResultsWhenScanReadyRef.current = true;
    completeNow();
  }, [completeNow]);

  useEffect(() => {
    if (pending) {
      sawPendingRef.current = true;
    }
  }, [pending]);

  useEffect(() => {
    if (!goResultsWhenScanReadyRef.current || !lastScan) {
      return;
    }
    goResultsWhenScanReadyRef.current = false;
    finishingRef.current = true;
    router.replace('/(tabs)/results');
  }, [lastScan, router]);

  useEffect(() => {
    if (!pending && !finishingRef.current && !sawPendingRef.current) {
      router.replace('/(tabs)/home');
    }
  }, [pending, router]);

  return { onScanAccepted };
}
