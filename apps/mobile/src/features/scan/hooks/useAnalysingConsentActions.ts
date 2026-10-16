import { useRouter } from 'expo-router';
import { useCallback } from 'react';

import { getCopy } from '@/src/copy';
import { useConsent } from '@/src/features/consent/ConsentContext';

import { useScanCapture } from '../context/ScanCaptureContext';
import { grantAndUploadScan, type UploadOutcome } from './runScanUpload';

type ScanConsentCopy = ReturnType<typeof getCopy>['screens']['scanConsent'];

export function useAnalysingConsentActions(ctx: {
  pending: ReturnType<typeof useScanCapture>['pending'];
  setPending: ReturnType<typeof useScanCapture>['setPending'];
  applyOutcome: (outcome: UploadOutcome) => void;
  copy: ScanConsentCopy;
  setBusyConsent: (v: boolean) => void;
  setConsentOpen: (v: boolean) => void;
}) {
  const router = useRouter();
  const consent = useConsent();

  const onAllowConsent = useCallback(async () => {
    if (!ctx.pending) {
      return;
    }
    ctx.setBusyConsent(true);
    ctx.applyOutcome(await grantAndUploadScan(ctx.pending, ctx.copy));
    await consent.refreshConsent();
    ctx.setConsentOpen(false);
    ctx.setBusyConsent(false);
  }, [consent, ctx]);

  const onDeclineConsent = useCallback(() => {
    ctx.setConsentOpen(false);
    ctx.setPending(null);
    router.replace('/(tabs)/home');
  }, [ctx, router]);

  return { onAllowConsent, onDeclineConsent };
}
