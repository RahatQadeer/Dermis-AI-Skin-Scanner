import { CONCERN_IDS, ZONE_IDS, type ConcernId, type ZoneId } from '@dermis/domain';

import { escapeHtml } from './escapeHtml';

export type ReportHtmlInput = {
  indexScore: number;
  concernScores: Record<ConcernId, number>;
  zoneScores: Record<ZoneId, number>;
  concernLabels: Record<ConcernId, string>;
  zoneLabels: Record<ZoneId, string>;
  title: string;
  indexTitle: string;
  concernsTitle: string;
  zonesTitle: string;
  disclaimer: string;
  generatedLabel: string;
};

export function buildReportHtml(input: ReportHtmlInput): string {
  const concernRows = scoreRows(CONCERN_IDS, input.concernScores, input.concernLabels);
  const zoneRows = scoreRows(ZONE_IDS, input.zoneScores, input.zoneLabels);
  return reportDocument(input, concernRows, zoneRows);
}

function scoreRows(
  ids: readonly string[],
  scores: Record<string, number>,
  labels: Record<string, string>,
): string {
  return ids
    .map((id) => {
      const label = escapeHtml(labels[id] ?? id);
      const score = Number.isFinite(scores[id]) ? String(Math.round(scores[id]!)) : '—';
      return `<tr><td>${label}</td><td class="num">${score}</td></tr>`;
    })
    .join('');
}

function reportDocument(input: ReportHtmlInput, concernRows: string, zoneRows: string): string {
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<title>${escapeHtml(input.title)}</title>
<style>
  body { font-family: -apple-system, Helvetica, Arial, sans-serif; color: #1a2e1a; margin: 32px; }
  h1 { font-size: 22px; margin: 0 0 8px; }
  h2 { font-size: 16px; margin: 24px 0 8px; }
  .muted { color: #5c6b5c; font-size: 12px; }
  .index { font-size: 40px; font-weight: 700; margin: 8px 0 4px; }
  table { width: 100%; border-collapse: collapse; margin-top: 8px; }
  td { padding: 8px 0; border-bottom: 1px solid #d8e2d8; font-size: 14px; }
  td.num { text-align: right; font-variant-numeric: tabular-nums; }
  .disclaimer { margin-top: 28px; font-size: 11px; color: #5c6b5c; line-height: 1.4; }
</style>
</head>
<body>
  <h1>${escapeHtml(input.title)}</h1>
  <p class="muted">${escapeHtml(input.generatedLabel)}</p>
  <h2>${escapeHtml(input.indexTitle)}</h2>
  <div class="index">${String(Math.round(input.indexScore))}</div>
  <h2>${escapeHtml(input.concernsTitle)}</h2>
  <table>${concernRows}</table>
  <h2>${escapeHtml(input.zonesTitle)}</h2>
  <table>${zoneRows}</table>
  <p class="disclaimer">${escapeHtml(input.disclaimer)}</p>
</body>
</html>`;
}
