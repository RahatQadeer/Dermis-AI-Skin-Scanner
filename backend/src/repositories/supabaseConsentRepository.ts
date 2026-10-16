import type {
  ConsentGrantInput,
  ConsentRecordRow,
  ConsentRepository,
  ConsentType,
} from './consentTypes';

export type SupabaseConsentConfig = {
  supabaseUrl: string;
  anonKey: string;
  accessToken: string;
  fetchImpl?: typeof fetch;
};

type DbConsentRow = {
  id: string;
  user_id: string;
  consent_type: ConsentType;
  version: string;
  granted_at: string;
  revoked_at: string | null;
  created_at: string;
};

type Rest = {
  fetchImpl: typeof fetch;
  base: string;
  headers: HeadersInit;
};

export function createSupabaseConsentRepository(config: SupabaseConsentConfig): ConsentRepository {
  const rest = buildRest(config);
  return {
    listByUserId: (userId) => listByUserId(rest, userId),
    findActive: (userId, type) => findActive(rest, userId, type),
    insertGrant: (input) => insertGrant(rest, input),
    revokeActive: (userId, type) => revokeActive(rest, userId, type),
    deleteAllForUser: async () => {
      // Account deletion uses delete_user_data (service_role); authenticated clients cannot wipe all.
      throw new Error('consent_delete_all_use_rpc');
    },
  };
}

function buildRest(config: SupabaseConsentConfig): Rest {
  return {
    fetchImpl: config.fetchImpl ?? fetch,
    base: `${config.supabaseUrl.replace(/\/$/, '')}/rest/v1/user_consents`,
    headers: {
      apikey: config.anonKey,
      authorization: `Bearer ${config.accessToken}`,
      'content-type': 'application/json',
      prefer: 'return=representation',
    },
  };
}

async function listByUserId(rest: Rest, userId: string): Promise<ConsentRecordRow[]> {
  const url = `${rest.base}?user_id=eq.${encodeURIComponent(userId)}&select=*&order=granted_at.desc`;
  const response = await rest.fetchImpl(url, { headers: rest.headers });
  if (!response.ok) {
    return [];
  }
  const rows = (await response.json()) as DbConsentRow[];
  return rows.map(fromDb);
}

async function findActive(
  rest: Rest,
  userId: string,
  type: ConsentType,
): Promise<ConsentRecordRow | null> {
  const url =
    `${rest.base}?user_id=eq.${encodeURIComponent(userId)}` +
    `&consent_type=eq.${encodeURIComponent(type)}` +
    `&revoked_at=is.null&select=*&order=granted_at.desc&limit=1`;
  const response = await rest.fetchImpl(url, { headers: rest.headers });
  if (!response.ok) {
    return null;
  }
  const rows = (await response.json()) as DbConsentRow[];
  return rows[0] ? fromDb(rows[0]) : null;
}

async function insertGrant(rest: Rest, input: ConsentGrantInput): Promise<ConsentRecordRow> {
  const response = await rest.fetchImpl(rest.base, {
    method: 'POST',
    headers: rest.headers,
    body: JSON.stringify({
      user_id: input.userId,
      consent_type: input.type,
      version: input.version,
    }),
  });
  if (!response.ok) {
    const detail = await response.text().catch(() => '');
    console.error('[consent] insert failed', response.status, detail);
    // Race: another grant may have landed — treat active row as success.
    const active = await findActive(rest, input.userId, input.type);
    if (active?.version === input.version) {
      return active;
    }
    throw new Error('consent_insert_failed');
  }
  const rows = (await response.json()) as DbConsentRow[];
  if (rows[0]) {
    return fromDb(rows[0]);
  }
  // INSERT ok but RETURNING empty (RLS) — re-read active grant.
  const active = await findActive(rest, input.userId, input.type);
  if (active?.version === input.version) {
    return active;
  }
  throw new Error('consent_insert_failed');
}

async function revokeActive(
  rest: Rest,
  userId: string,
  type: ConsentType,
): Promise<ConsentRecordRow | null> {
  const active = await findActive(rest, userId, type);
  if (!active) {
    return null;
  }
  const url = `${rest.base}?id=eq.${encodeURIComponent(active.id)}`;
  const response = await rest.fetchImpl(url, {
    method: 'PATCH',
    headers: rest.headers,
    body: JSON.stringify({ revoked_at: new Date().toISOString() }),
  });
  if (!response.ok) {
    throw new Error('consent_revoke_failed');
  }
  const rows = (await response.json()) as DbConsentRow[];
  return rows[0] ? fromDb(rows[0]) : null;
}

function fromDb(row: DbConsentRow): ConsentRecordRow {
  return {
    id: row.id,
    userId: row.user_id,
    type: row.consent_type,
    version: row.version,
    grantedAt: row.granted_at,
    revokedAt: row.revoked_at,
    createdAt: row.created_at,
  };
}
