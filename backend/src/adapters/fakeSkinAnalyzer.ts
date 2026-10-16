import {
  CONCERN_IDS,
  ZONE_IDS,
  geminiScanAnalysisSchema,
  type GeminiScanAnalysis,
} from '@dermis/domain/server';

import type { AnalyzeImageInput, SkinAnalyzer } from './SkinAnalyzer';

const FAKE_MODEL = 'fake-analyzer-v1';
const FAKE_PROMPT_VERSION = 'fake-prompt-v1';

export type FakeSkinAnalyzerOptions = {
  fail?: boolean;
  baseScore?: number;
};

/** Deterministic fake analyzer for DERM-044. Real Gemini = DERM-045. */
export function createFakeSkinAnalyzer(
  options: FakeSkinAnalyzerOptions = {},
): SkinAnalyzer & { model: string; promptVersion: string } {
  const base = options.baseScore ?? 70;

  return {
    model: FAKE_MODEL,
    promptVersion: FAKE_PROMPT_VERSION,
    async analyze(input: AnalyzeImageInput) {
      if (options.fail) {
        throw new Error('analyzer_failed');
      }
      if (input.imageBytes.byteLength === 0) {
        throw new Error('empty_image');
      }
      return buildFakeAnalysis(base, input.imageBytes[0]! % 5);
    },
  };
}

function buildFakeAnalysis(base: number, nudge: number): GeminiScanAnalysis {
  const score = Math.max(0, Math.min(100, Math.round(base + nudge)));
  const concerns = Object.fromEntries(CONCERN_IDS.map((id) => [id, score]));
  const zones = Object.fromEntries(ZONE_IDS.map((id) => [id, score]));
  const concernNotes = Object.fromEntries(
    CONCERN_IDS.map((id) => [id, `Estimate for ${id} — not medical advice.`]),
  );
  return geminiScanAnalysisSchema.parse({
    faceClear: true,
    faceIssue: 'none',
    concerns,
    zones,
    concernNotes,
  });
}
