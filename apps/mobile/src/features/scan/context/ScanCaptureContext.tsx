import {
  createContext,
  createElement,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import type { ReactNode } from 'react';

import { useSession } from '@/src/features/session/SessionContext';

import type { ScanDto } from '../api/scanApi';
import { EMPTY_OWNED, readOwned, readOwnedScan, type Owned } from '../lib/scanCaptureOwnership';

export type PendingScanCapture = {
  idempotencyKey: string;
  imageBase64: string;
  contentType: 'image/jpeg';
};

type ScanCaptureState = {
  pending: PendingScanCapture | null;
  setPending: (value: PendingScanCapture | null) => void;
  lastScan: ScanDto | null;
  setLastScan: (scan: ScanDto | null) => void;
  /** Face / upload failure shown on camera (avoids flaky router query params). */
  retakeMessage: string | null;
  setRetakeMessage: (message: string | null) => void;
};

const ScanCaptureContext = createContext<ScanCaptureState | null>(null);

export function ScanCaptureProvider({ children }: { children: ReactNode }) {
  const { userId } = useSession();
  const userIdRef = useRef(userId);
  userIdRef.current = userId;
  const [pending, setPendingOwned] = useState<Owned<PendingScanCapture>>(EMPTY_OWNED);
  const [lastScan, setLastScanOwned] = useState<Owned<ScanDto>>(EMPTY_OWNED);
  const [retakeMessage, setRetakeOwned] = useState<Owned<string>>(EMPTY_OWNED);

  // Scan capture is per-user, in-memory state. Every value is tagged with the
  // user that wrote it and only exposed to that user (see scanCaptureOwnership),
  // so a pending photo or a prior user's result can never leak into the next
  // account on this device — even before the cleanup below has run.
  const setPending = useCallback((value: PendingScanCapture | null) => {
    setPendingOwned({ ownerId: userIdRef.current, value });
  }, []);
  const setLastScan = useCallback((value: ScanDto | null) => {
    setLastScanOwned({ ownerId: userIdRef.current, value });
  }, []);
  const setRetakeMessage = useCallback((value: string | null) => {
    setRetakeOwned({ ownerId: userIdRef.current, value });
  }, []);

  // Drop the prior user's photo bytes from memory on logout / account switch.
  const prevUserId = useRef<string | null>(userId);
  useEffect(() => {
    if (prevUserId.current !== userId) {
      prevUserId.current = userId;
      setPendingOwned(EMPTY_OWNED);
      setLastScanOwned(EMPTY_OWNED);
      setRetakeOwned(EMPTY_OWNED);
    }
  }, [userId]);

  const value = useMemo(
    () => ({
      pending: readOwned(pending, userId),
      setPending,
      lastScan: readOwnedScan(lastScan, userId),
      setLastScan,
      retakeMessage: readOwned(retakeMessage, userId),
      setRetakeMessage,
    }),
    [pending, lastScan, retakeMessage, userId, setPending, setLastScan, setRetakeMessage],
  );
  return createElement(ScanCaptureContext.Provider, { value }, children);
}

export function useScanCapture(): ScanCaptureState {
  const ctx = useContext(ScanCaptureContext);
  if (!ctx) {
    throw new Error('useScanCapture requires ScanCaptureProvider');
  }
  return ctx;
}
