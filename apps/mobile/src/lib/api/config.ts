/** Public API base URL. Empty → mock/local UI data (CI and offline demos). */
export function getApiBaseUrl(): string {
  const raw = (process.env.EXPO_PUBLIC_API_URL ?? '').replace(/\/$/, '');
  if (!raw) {
    return '';
  }
  if (!isAllowedApiBaseUrl(raw)) {
    return '';
  }
  return raw;
}

export function isApiEnabled(): boolean {
  return getApiBaseUrl().length > 0;
}

/**
 * Release builds require HTTPS. Dev (`__DEV__`) may use http:// for local backends.
 * When `__DEV__` is undefined (Node unit tests), http is allowed so CI clients can mock.
 */
export function isAllowedApiBaseUrl(url: string): boolean {
  if (url.startsWith('https://')) {
    return true;
  }
  const isRelease = typeof __DEV__ !== 'undefined' && __DEV__ === false;
  if (isRelease) {
    return false;
  }
  return url.startsWith('http://') || url.startsWith('https://');
}
