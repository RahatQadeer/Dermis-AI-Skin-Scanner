import type { Dispatch, MutableRefObject, SetStateAction } from 'react';

import type { uploadScanWithConsent } from './runScanUpload';

type Outcome = Awaited<ReturnType<typeof uploadScanWithConsent>>;
type Scan = Extract<Outcome, { kind: 'ok' }>['scan'];

export function applyUploadOutcome(
  outcome: Outcome,
  deps: {
    uploadStarted: MutableRefObject<boolean>;
    setLastScan: (scan: Scan) => void;
    setPending: (value: null) => void;
    /** Called after lastScan is set — parent navigates once context updates. */
    onScanAccepted: () => void;
    setConsentOpen: Dispatch<SetStateAction<boolean>>;
    setErrorMessage: Dispatch<SetStateAction<string | null>>;
    onRetake: (message: string) => void;
  },
): void {
  if (outcome.kind === 'ok') {
    deps.setLastScan(outcome.scan);
    deps.setPending(null);
    deps.onScanAccepted();
    return;
  }
  if (outcome.kind === 'needs_consent') {
    deps.uploadStarted.current = false;
    deps.setConsentOpen(true);
    return;
  }
  if (outcome.kind === 'retake') {
    deps.uploadStarted.current = false;
    deps.setPending(null);
    deps.onRetake(outcome.message);
    return;
  }
  // Any other scan failure → camera page (not Analysing toast).
  deps.uploadStarted.current = false;
  deps.setPending(null);
  deps.setErrorMessage(null);
  deps.onRetake(outcome.message);
}
