import { createApiClient, type ApiClient } from './httpClient';

let shared: ApiClient | null = null;
let tokenGetter: (() => string | null) | null = null;
let refreshHandler: (() => Promise<string | null>) | null = null;

function ensureClient(): ApiClient {
  if (!shared) {
    shared = createApiClient({
      getAccessToken: () => tokenGetter?.() ?? null,
      refreshAccessToken: () => refreshHandler?.() ?? Promise.resolve(null),
    });
  }
  return shared;
}

/** Bind once from SessionProvider so feature APIs share one client. */
export function bindApiTokenGetter(getter: () => string | null): void {
  tokenGetter = getter;
  ensureClient();
}

/** Optional: refresh expired JWTs on 401 and retry the request once. */
export function bindApiRefreshHandler(handler: () => Promise<string | null>): void {
  refreshHandler = handler;
  ensureClient();
}

export function getApiClient(): ApiClient {
  return ensureClient();
}
