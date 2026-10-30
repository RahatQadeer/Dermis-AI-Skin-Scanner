export type AssistantUsageResult = { allowed: boolean; remaining: number };

/** Atomic per-user daily message counter (UTC day). */
export type AssistantUsageRepository = {
  consume: (userId: string, dailyLimit: number) => Promise<AssistantUsageResult>;
};

export function createMemoryAssistantUsageRepository(): AssistantUsageRepository {
  const counts = new Map<string, number>();
  return {
    async consume(userId, dailyLimit) {
      const key = `${userId}:${new Date().toISOString().slice(0, 10)}`;
      const used = counts.get(key) ?? 0;
      if (used >= dailyLimit) {
        return { allowed: false, remaining: 0 };
      }
      counts.set(key, used + 1);
      return { allowed: true, remaining: dailyLimit - used - 1 };
    },
  };
}

export function createSupabaseAssistantUsageRepository(config: {
  supabaseUrl: string;
  serviceRoleKey: string;
  fetchImpl?: typeof fetch;
}): AssistantUsageRepository {
  const fetchImpl = config.fetchImpl ?? fetch;
  const url = `${config.supabaseUrl.replace(/\/$/, '')}/rest/v1/rpc/consume_assistant_message`;
  return {
    async consume(userId, dailyLimit) {
      const response = await fetchImpl(url, {
        method: 'POST',
        headers: {
          apikey: config.serviceRoleKey,
          authorization: `Bearer ${config.serviceRoleKey}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify({ p_user_id: userId, p_limit: dailyLimit }),
      });
      if (!response.ok) {
        throw new Error('assistant_usage_failed');
      }
      const body = (await response.json()) as AssistantUsageResult;
      return { allowed: body.allowed === true, remaining: Number(body.remaining) || 0 };
    },
  };
}
