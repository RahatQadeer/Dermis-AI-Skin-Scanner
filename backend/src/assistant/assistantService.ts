import { HttpError } from '../http/HttpError';
import type { ProfileRepository } from '../repositories/profileTypes';
import type { ScanRepository } from '../repositories/scanTypes';
import type { QuotaService } from '../services/quotaService';
import {
  ASSISTANT_SYSTEM_INSTRUCTION,
  buildAssistantPrompt,
  buildUserDataBlock,
  type ChatTurn,
} from './assistantPrompt';
import type { AssistantAnswer, AssistantResponder } from './assistantResponder';
import type { AssistantUsageRepository } from './assistantUsage';

/** Pro users: messages per UTC day (bounds Gemini cost per user). */
export const ASSISTANT_DAILY_LIMIT = 30;

export type AssistantRequest = {
  userId: string;
  messages: ChatTurn[];
  image?: { base64: string; contentType: string };
};

export type AssistantService = {
  ask: (input: AssistantRequest) => Promise<AssistantAnswer & { remainingToday: number }>;
};

export function createAssistantService(deps: {
  responder: AssistantResponder;
  usage: AssistantUsageRepository;
  quota: QuotaService;
  profiles: ProfileRepository;
  scans: ScanRepository;
}): AssistantService {
  return {
    async ask(input) {
      // Server-side Pro gate — the app's lock is cosmetic only.
      const status = await deps.quota.getStatus(input.userId);
      if (status.plan !== 'pro') {
        throw new HttpError(402, 'pro_required');
      }
      const usage = await deps.usage.consume(input.userId, ASSISTANT_DAILY_LIMIT);
      if (!usage.allowed) {
        throw new HttpError(429, 'assistant_daily_limit');
      }
      // Only this user's own records (repositories are queried by the verified id).
      const [profile, scans] = await Promise.all([
        deps.profiles.findByUserId(input.userId),
        deps.scans.listByUserId(input.userId),
      ]);
      const newestFirst = [...scans].sort((a, b) => b.takenAt.localeCompare(a.takenAt));
      const prompt = buildAssistantPrompt(buildUserDataBlock(profile, newestFirst), input.messages);
      try {
        const answer = await deps.responder.respond({
          systemInstruction: ASSISTANT_SYSTEM_INSTRUCTION,
          prompt,
          image: input.image,
        });
        return { ...answer, remainingToday: usage.remaining };
      } catch {
        throw new HttpError(502, 'assistant_unavailable');
      }
    },
  };
}
