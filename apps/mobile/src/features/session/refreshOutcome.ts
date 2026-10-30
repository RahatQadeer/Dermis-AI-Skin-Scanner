import { isApiError } from '@/src/lib/api/errors';

/**
 * True when the server rejected the refresh token itself (revoked, expired,
 * reused) — the session cannot recover and the user must sign in again.
 * Network failures, timeouts, throttling and 5xx keep the session.
 */
export function isRefreshRejected(error: unknown): boolean {
  if (!isApiError(error)) {
    return false;
  }
  return error.status >= 400 && error.status < 500 && error.status !== 408 && error.status !== 429;
}

/** A refresh that resolves after sign-out or an account switch must be discarded. */
export function isRefreshStillCurrent(
  startedWith: string,
  currentRefreshToken: string | null,
): boolean {
  return currentRefreshToken === startedWith;
}
