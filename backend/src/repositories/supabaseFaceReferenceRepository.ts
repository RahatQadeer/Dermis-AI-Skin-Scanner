import type {
  FaceReferenceRecord,
  FaceReferenceRepository,
  FaceReferenceWriteInput,
} from './faceReferenceTypes';

export type SupabaseFaceReferenceConfig = {
  supabaseUrl: string;
  anonKey: string;
  accessToken: string;
  fetchImpl?: typeof fetch;
};

type DbFaceReferenceRow = {
  user_id: string;
  embedding: number[];
  dim: number;
  model_version: string;
  registered_at: string;
  updated_at: string;
};

type RestClient = {
  fetchImpl: typeof fetch;
  base: string;
  headers: (prefer: string) => HeadersInit;
};

/**
 * User-JWT client (anon key + access token). RLS scopes every row to
 * `auth.uid()`, so no service role is needed for the user's own reference.
 */
export function createSupabaseFaceReferenceRepository(
  config: SupabaseFaceReferenceConfig,
): FaceReferenceRepository {
  const client: RestClient = {
    fetchImpl: config.fetchImpl ?? fetch,
    base: `${config.supabaseUrl.replace(/\/$/, '')}/rest/v1/face_references`,
    headers: (prefer) => ({
      apikey: config.anonKey,
      authorization: `Bearer ${config.accessToken}`,
      'content-type': 'application/json',
      prefer,
    }),
  };

  return {
    findByUserId: (userId) => findByUserId(client, userId),
    upsert: (userId, data) => upsert(client, userId, data),
    deleteByUserId: (userId) => deleteByUserId(client, userId),
  };
}

async function findByUserId(
  client: RestClient,
  userId: string,
): Promise<FaceReferenceRecord | null> {
  const url = `${client.base}?user_id=eq.${encodeURIComponent(userId)}&select=*`;
  const response = await client.fetchImpl(url, {
    headers: client.headers('return=representation'),
  });
  if (!response.ok) {
    return null;
  }
  const rows = (await response.json()) as DbFaceReferenceRow[];
  return rows[0] ? fromDbRow(rows[0]) : null;
}

async function upsert(
  client: RestClient,
  userId: string,
  data: FaceReferenceWriteInput,
): Promise<FaceReferenceRecord> {
  const response = await client.fetchImpl(client.base, {
    method: 'POST',
    headers: client.headers('resolution=merge-duplicates,return=representation'),
    body: JSON.stringify({
      user_id: userId,
      embedding: data.embedding,
      dim: data.dim,
      model_version: data.modelVersion,
      updated_at: new Date().toISOString(),
    }),
  });
  if (!response.ok) {
    throw new Error('face_reference_save_failed');
  }
  const rows = (await response.json()) as DbFaceReferenceRow[];
  if (!rows[0]) {
    throw new Error('face_reference_save_failed');
  }
  return fromDbRow(rows[0]);
}

async function deleteByUserId(client: RestClient, userId: string): Promise<boolean> {
  const response = await client.fetchImpl(
    `${client.base}?user_id=eq.${encodeURIComponent(userId)}`,
    { method: 'DELETE', headers: client.headers('return=minimal') },
  );
  return response.ok;
}

function fromDbRow(row: DbFaceReferenceRow): FaceReferenceRecord {
  return {
    userId: row.user_id,
    embedding: row.embedding,
    dim: row.dim,
    modelVersion: row.model_version,
    registeredAt: row.registered_at,
    updatedAt: row.updated_at,
  };
}
