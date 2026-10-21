import { useCallback } from 'react';

import { getCopy } from '@/src/copy';
import { useSession } from '@/src/features/session/SessionContext';

import { useAnalysingOfflineGuard, useAnalysingResultsNavigation } from './useAnalysingNavigation';
import { useAnalysingProgress } from './useAnalysingProgress';
import { useAnalysingUpload } from './useAnalysingUpload';

export function useAnalysingPipeline() {
  const session = useSession();
  const apiLive = session.apiEnabled && Boolean(session.accessToken);

  useAnalysingOfflineGuard(apiLive);

  const finishProgressOnly = useCallback(() => {
    // Live path navigates only when lastScan is set. Offline is blocked above.
  }, []);

  const { progress, activeStep, completeNow } = useAnalysingProgress(
    getCopy().screens.analysing.steps.length,
    finishProgressOnly,
    false,
  );

  const { onScanAccepted } = useAnalysingResultsNavigation(completeNow);
  const upload = useAnalysingUpload(apiLive, onScanAccepted);

  return { progress, activeStep, ...upload };
}
