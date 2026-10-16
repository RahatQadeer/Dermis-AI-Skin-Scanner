import { getApiBaseUrl } from './config';
import { ApiError } from './errors';

export type ApiClient = {
  get: <T>(path: string) => Promise<T>;
  post: <T>(path: string, body?: unknown) => Promise<T>;
  /** POST without Authorization (sign-up / sign-in / refresh). */
  postPublic: <T>(path: string, body?: unknown) => Promise<T>;
  patch: <T>(path: string, body?: unknown) => Promise<T>;
  put: <T>(path: string, body?: unknown) => Promise<T>;
  delete: <T>(path: string, body?: unknown) => Promise<T>;
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
  didRetry?: boolean;
};

export function createApiClient(options: ApiClientOptions): ApiClient {
  const fetchImpl = options.fetchImpl ?? fetch;
  const send = <T>(method: string, path: string, body?: unknown) =>
    request<T>({ fetchImpl, options, method, path, body, requireAuth: true });
  const sendPublic = <T>(method: string, path: string, body?: unknown) =>
    request<T>({ fetchImpl, options, method, path, body, requireAuth: false });
  return {
    get: (path) => send('GET', path),
    post: (path, body) => send('POST', path, body),
    postPublic: (path, body) => sendPublic('POST', path, body),
    patch: (path, body) => send('PATCH', path, body),
    put: (path, body) => send('PUT', path, body),
    delete: (path, body) => send('DELETE', path, body),
  };
}

async function request<T>(args: RequestArgs): Promise<T> {
  const base = getApiBaseUrl();
  if (!base) {
    throw new ApiError(503, 'api_not_configured');
  }
  const response = await args.fetchImpl(`${base}${args.path}`, {
    method: args.method,
    headers: buildRequestHeaders(args),
    body: args.body !== undefined ? JSON.stringify(args.body) : undefined,
  });

  if (
    response.status === 401 &&
    args.requireAuth &&
    !args.didRetry &&
    args.options.refreshAccessToken
  ) {
    const next = await args.options.refreshAccessToken();
    if (next) {
      return request<T>({ ...args, didRetry: true });
    }
  }

  return parseResponse<T>(response);
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
  const text = await response.text();
  let data: unknown = null;
  if (text.length > 0) {
    try {
      data = JSON.parse(text) as unknown;
    } catch {
      throw new ApiError(
        response.status,
        response.ok ? 'invalid_json' : `http_${String(response.status)}`,
      );
    }
  }
  if (!response.ok) {
    const code =
      data && typeof data === 'object' && 'error' in data && typeof data.error === 'string'
        ? data.error
        : `http_${String(response.status)}`;
    throw new ApiError(response.status, code);
  }
  return data as T;
}
