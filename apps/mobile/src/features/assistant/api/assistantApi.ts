import { getApiClient } from '@/src/lib/api/client';

import type { ChatTurn } from '../lib/chatHistory';

export type AssistantReply = {
  reply: string;
  seeProfessional: boolean;
  remainingToday: number;
};

/** Gemini can take a while; still below the server's own 2 × 30s budget + margin. */
const ASSISTANT_TIMEOUT_MS = 75_000;

export async function sendAssistantMessage(input: {
  messages: ChatTurn[];
  image?: { base64: string; contentType: 'image/jpeg' };
}): Promise<AssistantReply> {
  return getApiClient().post<AssistantReply>('/v1/assistant/messages', input, {
    timeoutMs: ASSISTANT_TIMEOUT_MS,
  });
}
