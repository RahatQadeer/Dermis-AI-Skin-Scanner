import assert from 'node:assert/strict';
import test from 'node:test';

import { CONCERN_IDS, ZONE_IDS } from '@dermis/domain/server';

import { createGeminiSkinAnalyzer } from '../geminiSkinAnalyzer';
import { parseGeminiAnalysisText } from './parseGeminiResponse';

function validPayload(score: number) {
  return {
    faceClear: true,
    faceIssue: 'none',
    concerns: Object.fromEntries(CONCERN_IDS.map((id) => [id, score])),
    zones: Object.fromEntries(ZONE_IDS.map((id) => [id, score])),
  };
}

/**
 * Consistency check (DERM-045 AC): same photo bytes + identical model JSON
 * must parse to identical scores. Live Gemini variance is documented in
 * docs/product/gemini-consistency-report.md.
 */
test('same photo + identical model output → identical Zod analysis (×5)', async () => {
  const body = JSON.stringify(validPayload(68));
  const logs: string[] = [];
  const analyzer = createGeminiSkinAnalyzer({
    apiKey: 'test',
    log: (line) => logs.push(line),
    fetchImpl: async () =>
      new Response(
        JSON.stringify({
          candidates: [{ content: { parts: [{ text: body }] } }],
          usageMetadata: { promptTokenCount: 10, candidatesTokenCount: 10, totalTokenCount: 20 },
        }),
        { status: 200 },
      ),
  });

  const imageBytes = Uint8Array.from({ length: 64 }, (_, i) => i);
  const runs = await Promise.all(
    Array.from({ length: 5 }, () =>
      analyzer.analyze({
        userId: '66666666-6666-4666-8666-666666666666',
        imageBytes,
        contentType: 'image/jpeg',
      }),
    ),
  );

  const first = JSON.stringify(runs[0]);
  for (const run of runs) {
    assert.equal(JSON.stringify(run), first);
  }
  assert.equal(runs[0]!.concerns.hydration, 68);
  assert.equal(logs.length, 5);
  assert.match(logs[0]!, /scan_cost/);
});

test('parse is stable for fenced JSON from the model', () => {
  const fenced = `\`\`\`json\n${JSON.stringify(validPayload(55))}\n\`\`\``;
  const a = parseGeminiAnalysisText(fenced);
  const b = parseGeminiAnalysisText(fenced);
  assert.deepEqual(a, b);
});
