import { useMemo, useRef, useState } from 'react';

import { useQuotaRefresh } from '@/src/features/quota/QuotaRefreshContext';
import { useScanCapture } from '@/src/features/scan/context/ScanCaptureContext';
import { resolveAccountDisplayName } from '@/src/features/session/accountDisplayName';
import { useSession } from '@/src/features/session/SessionContext';

import type {
  HomeRoutineProgress,
  HomeScanSnapshot,
  HomeSnapshot,
} from '../mock/homeMockScenarios';
import { EMPTY_QUOTA, EMPTY_ROUTINE } from './loadHomeSnapshot';
import { useHomeSnapshotFocus } from './useHomeSnapshotFocus';

/**
 * Home uses live quota + latest real scan + routine counts when signed in.
 * Never overlays DEMO mock scan scores on a live session.
 */
export function useHomeSnapshot(): HomeSnapshot & { loading: boolean } {
  const session = useSession();
  const { version: quotaRefreshVersion } = useQuotaRefresh();
  const { lastScan } = useScanCapture();
  const live = session.apiEnabled && Boolean(session.accessToken);
  const readyRef = useRef(false);

  const [quota, setQuota] = useState<HomeSnapshot['quota']>(EMPTY_QUOTA);
  const [scan, setScan] = useState<HomeScanSnapshot | null>(null);
  const [routine, setRoutine] = useState<HomeRoutineProgress>(EMPTY_ROUTINE);
  const [loading, setLoading] = useState(live);

  const displayName = useMemo(
    () =>
      resolveAccountDisplayName({
        firstName: session.firstName,
      }) ?? '',
    [session.firstName],
  );

  useHomeSnapshotFocus({
    live,
    accessToken: session.accessToken,
    quotaRefreshVersion,
    lastScan,
    readyRef,
    setQuota,
    setScan,
    setRoutine,
    setLoading,
  });

  return { displayName, quota, scan, routine, loading };
}
