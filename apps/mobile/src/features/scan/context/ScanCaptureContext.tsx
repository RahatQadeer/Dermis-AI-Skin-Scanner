import { createContext, createElement, useContext, useMemo, useState } from 'react';
import type { ReactNode } from 'react';

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
  const [pending, setPending] = useState<PendingScanCapture | null>(null);
  const [lastScan, setLastScan] = useState<ScanDto | null>(null);
  const [retakeMessage, setRetakeMessage] = useState<string | null>(null);
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
