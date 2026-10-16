import { useCallback, useRef, useState } from 'react';

import { useScanCapture } from '@/src/features/scan/context/ScanCaptureContext';
import { useSession } from '@/src/features/session/SessionContext';

import type { ProgressScan } from '../types/progressTypes';
import { useProgressScansLoad } from './useProgressScansLoad';

export type ProgressLoadError = 'network' | 'session';

export type ProgressScansState = {
  scans: ProgressScan[];
  loading: boolean;
  error: ProgressLoadError | null;
  refresh: () => void;
};

/** Loads the signed-in user's real scans from GET /v1/scans. No mock fallback. */
export function useProgressScans(): ProgressScansState {
  const session = useSession();
  const { lastScan } = useScanCapture();
  const [scans, setScans] = useState<ProgressScan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ProgressLoadError | null>(null);
  const [tick, setTick] = useState(0);
  const lastScanRef = useRef(lastScan);
  lastScanRef.current = lastScan;

  const refresh = useCallback(() => {
    setTick((n) => n + 1);
  }, []);

  useProgressScansLoad({
    session,
    tick,
    lastScanRef,
    setScans,
    setError,
    setLoading,
  });

  return { scans, loading, error, refresh };
}
