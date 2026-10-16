import { useCallback, useEffect, type MutableRefObject } from 'react';

import type { PendingScanCapture } from '../context/ScanCaptureContext';
import { uploadScanWithConsent, type UploadOutcome } from './runScanUpload';

type AutoScanUploadOpts = {
  apiLive: boolean;
  pending: PendingScanCapture | null;
  messages: { uploadError: string; consentError: string };
  uploadStarted: MutableRefObject<boolean>;
  onOutcome: (outcome: UploadOutcome) => void;
};

export function useAutoScanUpload(opts: AutoScanUploadOpts): void {
  const { apiLive, pending, messages, uploadStarted, onOutcome } = opts;
  const runUpload = useCallback(async () => {
    if (!pending || uploadStarted.current) {
      return;
    }
    uploadStarted.current = true;
    onOutcome(await uploadScanWithConsent(pending, messages));
  }, [messages, onOutcome, pending, uploadStarted]);

  useEffect(() => {
    if (!pending || !apiLive) {
      return;
    }
    void runUpload();
  }, [apiLive, pending, runUpload]);
}
