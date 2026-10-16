import { geminiScanAnalysisSchema, type GeminiScanAnalysis } from '@dermis/domain/server';

/**
 * Extract JSON object from model text (handles optional markdown fences).
 */
export function extractJsonObject(text: string): unknown {
  const trimmed = text.trim();
  const fence = /^```(?:json)?\s*([\s\S]*?)```$/i.exec(trimmed);
  const candidate = fence?.[1]?.trim() ?? trimmed;
  return JSON.parse(candidate) as unknown;
}

export function parseGeminiAnalysisText(text: string): GeminiScanAnalysis {
  const raw = extractJsonObject(text);
  return geminiScanAnalysisSchema.parse(raw);
}
