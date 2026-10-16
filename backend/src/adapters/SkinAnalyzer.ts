import type { GeminiScanAnalysis } from '@dermis/domain/server';

export type AnalyzeImageInput = {
  userId: string;
  imageBytes: Uint8Array;
  contentType: string;
};

export type SkinAnalyzer = {
  analyze: (input: AnalyzeImageInput) => Promise<GeminiScanAnalysis>;
};
