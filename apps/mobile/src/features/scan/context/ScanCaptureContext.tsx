import { createContext, createElement, useContext, useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';

import { useSession } from '@/src/features/session/SessionContext';

import type { ScanDto } from '../api/scanApi';

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
  const [pending, setPending] = useState<PendingScanCapture | null>(null);
  const [lastScan, setLastScan] = useState<ScanDto | null>(null);
  const [retakeMessage, setRetakeMessage] = useState<string | null>(null);

  // Scan capture is per-user, in-memory state. Clear it whenever the signed-in
  // identity changes (logout or account switch) so a pending photo or a prior
  // user's last result can never leak into the next account on this device.
  const prevUserId = useRef<string | null>(userId);
  useEffect(() => {
    if (prevUserId.current !== userId) {
      prevUserId.current = userId;
      setPending(null);
      setLastScan(null);
      setRetakeMessage(null);
    }
  }, [userId]);

  const value = useMemo(
    () => ({ pending, setPending, lastScan, setLastScan, retakeMessage, setRetakeMessage }),
    [pending, lastScan, retakeMessage],
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
