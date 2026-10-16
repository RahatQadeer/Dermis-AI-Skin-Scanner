# ADR-008: Client-side Pro PDF report

**Status:** Accepted (DERM-054)

## Context

PRODUCT.md gates PDF export to Pro. No server PDF endpoint exists yet.

## Decision

1. Build a simple HTML report on-device (`buildReportHtml`) and convert via `expo-print`.
2. Native: `printToFileAsync` + `expo-sharing`. Web: `printAsync` (browser print dialog).
3. UI gates with `isElementUnlocked(plan, 'pdfExport')`; Free CTA opens paywall.
4. Include wellness / not-a-medical-device disclaimer in the PDF.

## Consequences

- Layout is text/scores only (no selfie embed) for size and privacy simplicity.
- Server-generated branded PDFs can replace this later without changing the CTA.
