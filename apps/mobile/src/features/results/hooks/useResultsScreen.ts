import type { ZoneId } from '@dermis/domain';
import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';

import { useScanNavigation } from '@/src/features/consent/hooks/useScanNavigation';

import { buildResultsPresentation, pickDefaultZone } from '../lib/buildResultsPresentation';
import { useExportReportPdf } from './useExportReportPdf';
import { useResultsReport } from './useResultsReport';

export function useResultsScreen() {
  const router = useRouter();
  const { report, previous, currentScan, loading } = useResultsReport();
  const { goScan } = useScanNavigation();
  const [zoneId, setZoneId] = useState<ZoneId | null>(null);

  useEffect(() => {
    if (!report || zoneId) {
      return;
    }
    setZoneId(pickDefaultZone(report.zoneScores));
  }, [report, zoneId]);

  const pdfSource = useMemo(
    () =>
      report
        ? {
            indexScore: report.scan.indexScore,
            concernScores: report.scan.concernScores,
            zoneScores: report.zoneScores,
          }
        : null,
    [report],
  );
  const pdf = useExportReportPdf(
    report?.plan ?? 'free',
    pdfSource ?? {
      indexScore: 0,
      concernScores: {} as never,
      zoneScores: {} as never,
    },
  );

  const presentation = useMemo(
    () => buildResultsPresentation(report, previous, currentScan),
    [currentScan, previous, report],
  );

  return {
    router,
    report,
    loading,
    goScan,
    zoneId,
    setZoneId,
    goPaywall: () => router.push('/(onboarding)/paywall'),
    pdf,
    ...presentation,
  };
}
