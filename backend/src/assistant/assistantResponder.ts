import { z } from 'zod';

import { createGeminiClient } from '../adapters/gemini/geminiClient';

export type AssistantAnswer = { reply: string; seeProfessional: boolean };

export type AssistantResponder = {
  respond: (input: {
    systemInstruction: string;
    prompt: string;
    image?: { base64: string; contentType: string };
  }) => Promise<AssistantAnswer>;
};

const answerSchema = z.object({
  reply: z.string().trim().min(1).max(2000),
  seeProfessional: z.boolean(),
});

const RESPONSE_SCHEMA = {
  type: 'OBJECT',
  properties: {
    reply: { type: 'STRING' },
    seeProfessional: { type: 'BOOLEAN' },
  },
  required: ['reply', 'seeProfessional'],
};

export function createGeminiAssistantResponder(config: {
  apiKey: string;
  model: string;
  fetchImpl?: typeof fetch;
}): AssistantResponder {
  const client = createGeminiClient({
    apiKey: config.apiKey,
    model: config.model,
    timeoutMs: 30_000,
    maxRetries: 1,
    temperature: 0.4,
    fetchImpl: config.fetchImpl,
  });
  return {
    async respond(input) {
      const result = await client.generate({
        prompt: input.prompt,
        systemInstruction: input.systemInstruction,
        responseSchema: RESPONSE_SCHEMA,
        imageBase64: input.image?.base64,
        contentType: input.image?.contentType,
      });
      const parsed = answerSchema.safeParse(JSON.parse(result.text));
      if (!parsed.success) {
        throw new Error('assistant_bad_response');
      }
      return parsed.data;
    },
  };
}

/** Local/dev + tests: deterministic, clearly labelled, never presented as advice. */
export function createFakeAssistantResponder(): AssistantResponder {
  return {
    async respond(input) {
      return {
        reply: `[dev assistant] I received your message${input.image ? ' and photo' : ''}.`,
        seeProfessional: false,
      };
    },
  };
}
