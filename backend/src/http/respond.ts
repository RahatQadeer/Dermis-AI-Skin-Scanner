import { isHttpError } from './HttpError';

export function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8' },
  });
}

export function errorResponse(error: unknown): Response {
  if (isHttpError(error)) {
    return json({ error: error.code }, error.status);
  }
  const detail = error instanceof Error ? error.message : String(error);
  console.error('[api]', detail);
  return json({ error: 'internal_error' }, 500);
}
