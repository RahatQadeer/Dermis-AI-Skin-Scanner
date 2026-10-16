import assert from 'node:assert/strict';
import test from 'node:test';

import { CONCERN_IDS, ZONE_IDS } from '@dermis/domain/server';

import { createGeminiClient } from './geminiClient';
import { parseGeminiAnalysisText } from './parseGeminiResponse';

function validPayload(score = 72) {
  return {
    faceClear: true,
    faceIssue: 'none' as const,
    concerns: Object.fromEntries(CONCERN_IDS.map((id) => [id, score])),
    zones: Object.fromEntries(ZONE_IDS.map((id) => [id, score])),
    concernNotes: Object.fromEntries(CONCERN_IDS.map((id) => [id, 'ok'])),
  };
}

function geminiHttpBody(text: string) {
  return {
    candidates: [{ content: { parts: [{ text }] } }],
    usageMetadata: {
      promptTokenCount: 100,
      candidatesTokenCount: 50,
      totalTokenCount: 150,
    },
  };
}

test('parseGeminiAnalysisText accepts good JSON', () => {
  const parsed = parseGeminiAnalysisText(JSON.stringify(validPayload()));
  assert.equal(parsed.concerns.redness, 72);
  assert.equal(parsed.zones.forehead, 72);
});

test('parseGeminiAnalysisText rejects partial (missing zones)', () => {
  const partial = { concerns: validPayload().concerns };
  assert.throws(() => parseGeminiAnalysisText(JSON.stringify(partial)));
});

test('parseGeminiAnalysisText rejects bad scores', () => {
  const bad = validPayload();
  bad.concerns.redness = 140;
  assert.throws(() => parseGeminiAnalysisText(JSON.stringify(bad)));
});

test('gemini client returns text on good response', async () => {
  const client = createGeminiClient({
    apiKey: 'test-key',
    model: 'gemini-2.0-flash',
    fetchImpl: async () =>
      new Response(JSON.stringify(geminiHttpBody(JSON.stringify(validPayload()))), {
        status: 200,
      }),
  });
  const result = await client.generate({
    prompt: 'p',
    responseSchema: {},
    imageBase64: 'aaaa',
    contentType: 'image/jpeg',
  });
  assert.match(result.text, /redness/);
  assert.equal(result.usage.totalTokenCount, 150);
});

test('gemini client retries then fails on 500', async () => {
  let calls = 0;
  const client = createGeminiClient({
    apiKey: 'test-key',
    model: 'gemini-2.0-flash',
    maxRetries: 1,
    fetchImpl: async () => {
      calls += 1;
      return new Response('nope', { status: 500 });
    },
  });
  await assert.rejects(
    () =>
      client.generate({
        prompt: 'p',
        responseSchema: {},
        imageBase64: 'aaaa',
        contentType: 'image/jpeg',
      }),
    /gemini_http_500/,
  );
  assert.equal(calls, 2);
});
