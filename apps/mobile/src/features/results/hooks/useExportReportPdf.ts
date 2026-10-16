import { isElementUnlocked, type Plan } from '@dermis/domain/server';
import { useRouter } from 'expo-router';
import { useCallback, useState } from 'react';

import { getCopy } from '@/src/copy';

import {
  createReportHtmlFromResults,
  type ResultsPdfSource,
} from '../pdf/createReportHtmlFromResults';
import { shareReportPdf } from '../pdf/shareReportPdf';

export function useExportReportPdf(plan: Plan, source: ResultsPdfSource) {
  const router = useRouter();
  const r = getCopy().screens.results;
  const [busy, setBusy] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastVisible, setToastVisible] = useState(false);

  const showToast = useCallback((message: string) => {
    setToastMessage(message);
    setToastVisible(true);
  }, []);

  const dismissToast = useCallback(() => setToastVisible(false), []);

  const onExportPress = useCallback(async () => {
    if (!isElementUnlocked(plan, 'pdfExport')) {
      router.push('/paywall');
      return;
    }
    setBusy(true);
    const outcome = await shareReportPdf(createReportHtmlFromResults(source));
    setBusy(false);
    if (outcome === 'shared' || outcome === 'printed' || outcome === 'cancelled') {
      if (outcome !== 'cancelled') {
        showToast(r.pdfExportOk);
      }
      return;
    }
    if (outcome === 'unavailable') {
      showToast(r.pdfExportUnavailable);
      return;
    }
    showToast(r.pdfExportFail);
  }, [plan, r.pdfExportFail, r.pdfExportOk, r.pdfExportUnavailable, router, showToast, source]);

  return {
    busy,
    toastMessage,
    toastVisible,
    dismissToast,
    onExportPress,
    canExport: isElementUnlocked(plan, 'pdfExport'),
    exportLabel: isElementUnlocked(plan, 'pdfExport') ? r.pdfExportCta : r.pdfUnlockCta,
  };
}
