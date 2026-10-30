import type { ProfileRecord, ProfileRepository } from './profileTypes';
import { fromDbProfile, toDbPatch, toDbWrite, type DbProfileRow } from './supabaseProfileMap';

export type SupabaseProfileConfig = {
  supabaseUrl: string;
  anonKey: string;
  accessToken: string;
  fetchImpl?: typeof fetch;
};

type RestClient = {
  fetchImpl: typeof fetch;
  base: string;
  headers: () => HeadersInit;
};

export function createSupabaseProfileRepository(config: SupabaseProfileConfig): ProfileRepository {
  const client: RestClient = {
    fetchImpl: config.fetchImpl ?? fetch,
    base: `${config.supabaseUrl.replace(/\/$/, '')}/rest/v1/profiles`,
    headers: () => buildHeaders(config),
  };

  return {
    findByUserId: (userId) => findByUserId(client, userId),
    insertEmpty: (userId) => insertEmpty(client, userId),
    save: async (userId, data) => patchRow(client, userId, toDbWrite(data)),
    patch: async (userId, data) => {
      try {
        return await patchRow(client, userId, toDbPatch(data));
      } catch {
        return null;
      }
    },
    clearSkinData: async (userId) => {
      try {
        return await patchRow(client, userId, {
          skin_type: null,
          skin_tone: null,
          sensitivity: null,
          age_band: null,
          priority_concerns: [],
        });
      } catch {
        return null;
      }
    },
    deleteByUserId: async (userId) => deleteByUserId(client, userId),
  };
}

async function deleteByUserId(client: RestClient, userId: string): Promise<boolean> {
  const response = await client.fetchImpl(`${client.base}?id=eq.${encodeURIComponent(userId)}`, {
    method: 'DELETE',
    headers: client.headers(),
  });
  return response.ok;
}

function buildHeaders(config: SupabaseProfileConfig): HeadersInit {
  return {
    apikey: config.anonKey,
    authorization: `Bearer ${config.accessToken}`,
    'content-type': 'application/json',
    prefer: 'return=representation',
  };
}

async function findByUserId(client: RestClient, userId: string): Promise<ProfileRecord | null> {
  const url = `${client.base}?id=eq.${encodeURIComponent(userId)}&select=*`;
  const response = await client.fetchImpl(url, { headers: client.headers() });
  if (!response.ok) {
    return null;
  }
  const rows = (await response.json()) as DbProfileRow[];
  return rows[0] ? fromDbProfile(rows[0]) : null;
}

async function insertEmpty(client: RestClient, userId: string): Promise<ProfileRecord> {
  const response = await client.fetchImpl(client.base, {
    method: 'POST',
    headers: client.headers(),
    body: JSON.stringify({ id: userId }),
  });
  if (!response.ok) {
    const existing = await findByUserId(client, userId);
    if (existing) {
      return existing;
    }
    throw new Error('profile_insert_failed');
  }
  const rows = (await response.json()) as DbProfileRow[];
  return fromDbProfile(rows[0]!);
}

async function patchRow(
  client: RestClient,
  userId: string,
  body: Record<string, unknown>,
): Promise<ProfileRecord> {
  const response = await client.fetchImpl(`${client.base}?id=eq.${encodeURIComponent(userId)}`, {
    method: 'PATCH',
    headers: client.headers(),
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    throw new Error('profile_save_failed');
  }
  const rows = (await response.json()) as DbProfileRow[];
  if (!rows[0]) {
    throw new Error('profile_save_failed');
  }
  return fromDbProfile(rows[0]);
}
