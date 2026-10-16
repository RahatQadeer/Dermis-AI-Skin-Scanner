import type { SkinAnalyzer } from './SkinAnalyzer';
import { createFakeSkinAnalyzer } from './fakeSkinAnalyzer';
import { createGeminiSkinAnalyzer } from './geminiSkinAnalyzer';
import { GEMINI_DEFAULT_MODEL } from './gemini/prompt';

export type AnalyzerEnv = {
  geminiApiKey?: string;
  geminiModel?: string;
  preferFake?: boolean;
};

export function resolveSkinAnalyzer(
  env: AnalyzerEnv,
): SkinAnalyzer & { model: string; promptVersion: string } {
  if (env.preferFake || !env.geminiApiKey) {
    return createFakeSkinAnalyzer();
  }
  return createGeminiSkinAnalyzer({
    apiKey: env.geminiApiKey,
    model: env.geminiModel ?? GEMINI_DEFAULT_MODEL,
  });
}
