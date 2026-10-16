import type { AccountDataPort, AccountExportPayload, AuthAdminPort } from './accountTypes';

export type SupabaseAccountConfig = {
  supabaseUrl: string;
  serviceRoleKey: string;
  fetchImpl?: typeof fetch;
};

type Rest = {
  fetchImpl: typeof fetch;
  root: string;
  headers: HeadersInit;
};

export function createSupabaseAccountDataPort(config: SupabaseAccountConfig): AccountDataPort {
  const rest = buildRest(config);
  return {
    exportForUser: (userId, email) => exportForUser(rest, userId, email),
    purgeUserData: (userId) => purgeUserData(rest, userId),
    findUserIdByEmail: (email) => findUserIdByEmail(rest, email),
  };
}

export function createSupabaseAuthAdmin(config: SupabaseAccountConfig): AuthAdminPort {
  const rest = buildRest(config);
  return {
    async deleteAuthUser(userId) {
      const response = await rest.fetchImpl(`${rest.root}/auth/v1/admin/users/${userId}`, {
        method: 'DELETE',
        headers: rest.headers,
      });
      if (!response.ok && response.status !== 404) {
        throw new Error('auth_delete_failed');
      }
    },
  };
}

function buildRest(config: SupabaseAccountConfig): Rest {
  return {
    fetchImpl: config.fetchImpl ?? fetch,
    root: config.supabaseUrl.replace(/\/$/, ''),
    headers: {
      apikey: config.serviceRoleKey,
      authorization: `Bearer ${config.serviceRoleKey}`,
      'content-type': 'application/json',
    },
  };
}

async function exportForUser(
  rest: Rest,
  userId: string,
  email: string | null,
): Promise<AccountExportPayload | null> {
  const profile = await fetchOne(rest, 'profiles', `id=eq.${userId}`);
  if (!profile) {
    return null;
  }
  const [entitlement, quota, scans, routineSteps, consents] = await Promise.all([
    fetchOne(rest, 'entitlements', `user_id=eq.${userId}`),
    fetchOne(rest, 'scan_usage', `user_id=eq.${userId}`),
    fetchMany(rest, 'scans', `user_id=eq.${userId}`),
    fetchMany(rest, 'routine_steps', `user_id=eq.${userId}`),
    fetchMany(rest, 'user_consents', `user_id=eq.${userId}`),
  ]);
  const row = profile as {
    notify_scan_reminders?: boolean;
    notify_product_updates?: boolean;
  };
  return {
    exportedAt: new Date().toISOString(),
    userId,
    email,
    profile,
    settings: {
      notifyScanReminders: row.notify_scan_reminders ?? false,
      notifyProductUpdates: row.notify_product_updates ?? false,
    },
    entitlement,
    quota,
    scans,
    routineSteps,
    consents,
  };
}

async function purgeUserData(rest: Rest, userId: string): Promise<boolean> {
  const response = await rest.fetchImpl(`${rest.root}/rest/v1/rpc/delete_user_data`, {
    method: 'POST',
    headers: rest.headers,
    body: JSON.stringify({ p_user_id: userId }),
  });
  if (!response.ok) {
    throw new Error('delete_user_data_failed');
  }
  return true;
}

async function findUserIdByEmail(rest: Rest, email: string): Promise<string | null> {
  const url = `${rest.root}/auth/v1/admin/users?email=${encodeURIComponent(email)}`;
  const response = await rest.fetchImpl(url, { headers: rest.headers });
  if (!response.ok) {
    return null;
  }
  const body = (await response.json()) as { users?: { id: string; email?: string }[] };
  const match = body.users?.find((u) => u.email?.toLowerCase() === email.toLowerCase());
  return match?.id ?? null;
}

async function fetchOne(
  rest: Rest,
  table: string,
  filter: string,
): Promise<Record<string, unknown> | null> {
  const rows = await fetchMany(rest, table, filter);
  return rows[0] ?? null;
}

async function fetchMany(
  rest: Rest,
  table: string,
  filter: string,
): Promise<Record<string, unknown>[]> {
  const url = `${rest.root}/rest/v1/${table}?${filter}&select=*`;
  const response = await rest.fetchImpl(url, { headers: rest.headers });
  if (!response.ok) {
    return [];
  }
  return (await response.json()) as Record<string, unknown>[];
}
