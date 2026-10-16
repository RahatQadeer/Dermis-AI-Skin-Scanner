import { randomUUID } from 'node:crypto';

import type { AnalyzeImageInput, SkinAnalyzer } from './SkinAnalyzer';
import { estimateCostUsd, logScanCost } from './gemini/costLog';
import { createGeminiClient } from './gemini/geminiClient';
import { parseGeminiAnalysisText } from './gemini/parseGeminiResponse';
import {
  buildGeminiScanPrompt,
  GEMINI_DEFAULT_MODEL,
  GEMINI_PROMPT_VERSION,
} from './gemini/prompt';
import { buildGeminiResponseSchema } from './gemini/responseSchema';

export type GeminiSkinAnalyzerConfig = {
  apiKey: string;
  model?: string;
  apiBaseUrl?: string;
  timeoutMs?: number;
  maxRetries?: number;
  temperature?: number;
  fetchImpl?: typeof fetch;
  log?: (line: string) => void;
};

export function createGeminiSkinAnalyzer(
  config: GeminiSkinAnalyzerConfig,
): SkinAnalyzer & { model: string; promptVersion: string } {
  const model = config.model ?? GEMINI_DEFAULT_MODEL;
  const client = createGeminiClient({
    apiKey: config.apiKey,
    model,
    apiBaseUrl: config.apiBaseUrl,
    // Camera scans need headroom; face+scores in one call.
    timeoutMs: config.timeoutMs ?? 60_000,
    maxRetries: config.maxRetries ?? 2,
    temperature: config.temperature ?? 0.2,
    fetchImpl: config.fetchImpl,
  });
  const prompt = buildGeminiScanPrompt();
  const responseSchema = buildGeminiResponseSchema();

  return {
    model,
    promptVersion: GEMINI_PROMPT_VERSION,
    async analyze(input: AnalyzeImageInput) {
      const imageBase64 = Buffer.from(input.imageBytes).toString('base64');
      const result = await client.generate({
        prompt,
        responseSchema,
        imageBase64,
        contentType: input.contentType,
      });
      const analysis = parseGeminiAnalysisText(result.text);
      logScanCost(
        {
          requestId: randomUUID(),
          userId: input.userId,
          model: result.model,
          promptVersion: GEMINI_PROMPT_VERSION,
          promptTokenCount: result.usage.promptTokenCount,
          candidatesTokenCount: result.usage.candidatesTokenCount,
          totalTokenCount: result.usage.totalTokenCount,
          estimatedCostUsd: estimateCostUsd(result.usage),
        },
        config.log,
      );
      return analysis;
    },
  };
}
