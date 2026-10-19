import { getApiBaseUrl } from './config';
import { ApiError } from './errors';

/** Default for quick API calls. Scan create overrides — Gemini often needs >12s. */
export const DEFAULT_REQUEST_TIMEOUT_MS = 12_000;
/** Gemini analyze + retries can exceed 30s; keep client waiting. */
export const SCAN_UPLOAD_TIMEOUT_MS = 90_000;

export type RequestOptions = {
  timeoutMs?: number;
};

export type ApiClient = {
  get: <T>(path: string, opts?: RequestOptions) => Promise<T>;
  post: <T>(path: string, body?: unknown, opts?: RequestOptions) => Promise<T>;
  /** POST without Authorization (sign-up / sign-in / refresh). */
  postPublic: <T>(path: string, body?: unknown, opts?: RequestOptions) => Promise<T>;
  patch: <T>(path: string, body?: unknown, opts?: RequestOptions) => Promise<T>;
  put: <T>(path: string, body?: unknown, opts?: RequestOptions) => Promise<T>;
  delete: <T>(path: string, opts?: RequestOptions) => Promise<T>;
};

export type ApiClientOptions = {
  getAccessToken: () => string | null;
  /** On 401, refresh once and retry. Return new access token or null. */
  refreshAccessToken?: () => Promise<string | null>;
  fetchImpl?: typeof fetch;
};

type RequestArgs = {
  fetchImpl: typeof fetch;
  options: ApiClientOptions;
  method: string;
  path: string;
  body?: unknown;
  requireAuth: boolean;
  timeoutMs: number;
  didRetry?: boolean;
};

export function createApiClient(options: ApiClientOptions): ApiClient {
  const fetchImpl = options.fetchImpl ?? fetch;
  const send = <T>(method: string, path: string, body?: unknown, opts?: RequestOptions) =>
    request<T>({
      fetchImpl,
      options,
      method,
      path,
      body,
      requireAuth: true,
      timeoutMs: opts?.timeoutMs ?? DEFAULT_REQUEST_TIMEOUT_MS,
    });
  const sendPublic = <T>(method: string, path: string, body?: unknown, opts?: RequestOptions) =>
    request<T>({
      fetchImpl,
      options,
      method,
      path,
      body,
      requireAuth: false,
      timeoutMs: opts?.timeoutMs ?? DEFAULT_REQUEST_TIMEOUT_MS,
    });
  return {
    get: (path, opts) => send('GET', path, undefined, opts),
    post: (path, body, opts) => send('POST', path, body, opts),
    postPublic: (path, body, opts) => sendPublic('POST', path, body, opts),
    patch: (path, body, opts) => send('PATCH', path, body, opts),
    put: (path, body, opts) => send('PUT', path, body, opts),
    delete: (path, opts) => send('DELETE', path, undefined, opts),
  };
}

async function request<T>(args: RequestArgs): Promise<T> {
  const base = getApiBaseUrl();
  if (!base) {
    throw new ApiError(503, 'api_not_configured');
  }
  const response = await fetchWithTimeout(args, base);
  if (await shouldRetryAuth(args, response)) {
    return request<T>({ ...args, didRetry: true });
  }
  return parseResponse<T>(response);
}

async function fetchWithTimeout(args: RequestArgs, base: string): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), args.timeoutMs);
  try {
    return await args.fetchImpl(`${base}${args.path}`, {
      method: args.method,
      headers: buildRequestHeaders(args),
      body: args.body !== undefined ? JSON.stringify(args.body) : undefined,
      signal: controller.signal,
    });
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new ApiError(504, 'network_timeout');
    }
    throw new ApiError(503, 'network_unreachable');
  } finally {
    clearTimeout(timer);
  }
}

async function shouldRetryAuth(args: RequestArgs, response: Response): Promise<boolean> {
  if (
    response.status !== 401 ||
    !args.requireAuth ||
    args.didRetry ||
    !args.options.refreshAccessToken
  ) {
    return false;
  }
  const next = await args.options.refreshAccessToken();
  return Boolean(next);
}

function buildRequestHeaders(args: RequestArgs): Record<string, string> {
  const headers: Record<string, string> = {
    accept: 'application/json',
    ...(args.body !== undefined ? { 'content-type': 'application/json' } : {}),
  };
  if (!args.requireAuth) {
    return headers;
  }
  const token = args.options.getAccessToken();
  if (!token) {
    throw new ApiError(401, 'missing_token');
  }
  headers.authorization = `Bearer ${token}`;
  return headers;
}

async function parseResponse<T>(response: Response): Promise<T> {
  const data = await readJsonBody(response);
  if (!response.ok) {
    throw apiErrorFromBody(response.status, data);
  }
  return data as T;
}

async function readJsonBody(response: Response): Promise<unknown> {
  const text = await response.text();
  if (text.length === 0) {
    return null;
  }
  try {
    return JSON.parse(text) as unknown;
  } catch {
    throw new ApiError(
      response.status,
      response.ok ? 'invalid_json' : `http_${String(response.status)}`,
    );
  }
}

function apiErrorFromBody(status: number, data: unknown): ApiError {
  const code =
    data && typeof data === 'object' && 'error' in data && typeof data.error === 'string'
      ? data.error
      : `http_${String(status)}`;
  const detail =
    data && typeof data === 'object' && 'message' in data && typeof data.message === 'string'
      ? data.message.trim()
      : undefined;
  return new ApiError(status, code, detail || undefined);
}
