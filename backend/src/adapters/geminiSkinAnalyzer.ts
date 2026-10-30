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
    // Worst case (timeout × attempts) must finish inside the app's 90s upload
    // timeout; otherwise the app gives up while the server still saves a scan
    // and spends quota for a result the user never sees.
    timeoutMs: config.timeoutMs ?? 40_000,
    maxRetries: config.maxRetries ?? 1,
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
