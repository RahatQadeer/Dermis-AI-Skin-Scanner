import { useRouter } from 'expo-router';
import { useCallback, useRef, useState } from 'react';

import { getCopy } from '@/src/copy';

import { useScanCapture } from '../context/ScanCaptureContext';
import { useAnalysingConsentActions } from './useAnalysingConsentActions';
import { applyUploadOutcome } from './analysingUploadOutcome';
import type { UploadOutcome } from './runScanUpload';
import { useAutoScanUpload } from './useAutoScanUpload';

export function useAnalysingUpload(apiLive: boolean, onScanAccepted: () => void) {
  const router = useRouter();
  const { pending, setPending, setLastScan, setRetakeMessage } = useScanCapture();
  const uploadStarted = useRef(false);
  const [consentOpen, setConsentOpen] = useState(false);
  const [busyConsent, setBusyConsent] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const copy = getCopy().screens.scanConsent;

  const onRetake = useCallback(
    (message: string) => {
      setRetakeMessage(message);
      router.replace('/(scan)/camera');
    },
    [router, setRetakeMessage],
  );

  // Free scan used up: the paywall explains the options (upgrade or restore).
  const onUpgrade = useCallback(() => {
    router.replace('/paywall');
  }, [router]);

  const applyOutcome = useCallback(
    (outcome: UploadOutcome) => {
      applyUploadOutcome(outcome, {
        uploadStarted,
        setLastScan,
        setPending,
        onScanAccepted,
        setConsentOpen,
        setErrorMessage,
        onRetake,
        onUpgrade,
      });
    },
    [onRetake, onScanAccepted, onUpgrade, setLastScan, setPending],
  );

  useAutoScanUpload({ apiLive, pending, messages: copy, uploadStarted, onOutcome: applyOutcome });

  const consent = useAnalysingConsentActions({
    pending,
    setPending,
    applyOutcome,
    copy,
    setBusyConsent,
    setConsentOpen,
  });

  return {
    consentOpen,
    busyConsent,
    errorMessage,
    dismissError: useCallback(() => setErrorMessage(null), []),
    ...consent,
  };
}
