import type { ConcernId, ZoneId } from '@dermis/domain';

import { getCopy } from '@/src/copy';
import { zoneCopy } from '@/src/copy/zones';
import { concernLabel } from '@/src/features/home/lib/concernLabel';

import { buildReportHtml } from './buildReportHtml';

export type ResultsPdfSource = {
  indexScore: number;
  concernScores: Record<ConcernId, number>;
  zoneScores: Record<ZoneId, number>;
};

export function createReportHtmlFromResults(source: ResultsPdfSource, now = new Date()): string {
  const r = getCopy().screens.results;
  const date = now.toISOString().slice(0, 10);
  return buildReportHtml({
    indexScore: source.indexScore,
    concernScores: source.concernScores,
    zoneScores: source.zoneScores,
    concernLabels: {
      redness: concernLabel('redness'),
      fineLines: concernLabel('fineLines'),
      hydration: concernLabel('hydration'),
      darkSpots: concernLabel('darkSpots'),
      texture: concernLabel('texture'),
      pores: concernLabel('pores'),
    },
    zoneLabels: { ...zoneCopy },
    title: r.pdfDocumentTitle,
    indexTitle: r.indexTitle,
    concernsTitle: r.concernsTitle,
    zonesTitle: r.zonesTitle,
    disclaimer: getCopy().compliance.healthDeclaration,
    generatedLabel: r.pdfGenerated(date),
  });
}
