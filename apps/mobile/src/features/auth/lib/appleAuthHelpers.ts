export type AppleFullNameInput = {
  givenName?: string | null;
  middleName?: string | null;
  familyName?: string | null;
} | null;

export function firstNameFromAppleFullName(fullName: AppleFullNameInput): string | undefined {
  if (!fullName) {
    return undefined;
  }
  const parts = [fullName.givenName, fullName.middleName, fullName.familyName]
    .map((part) => (typeof part === 'string' ? part.trim() : ''))
    .filter((part) => part.length > 0);
  return parts.length > 0 ? parts.join(' ') : undefined;
}

export function isAppleCancelError(error: unknown): boolean {
  if (!error || typeof error !== 'object') {
    return false;
  }
  const code = (error as { code?: unknown }).code;
  return code === 'ERR_REQUEST_CANCELED' || code === 'ERR_CANCELED';
}

export function trimAppleIdentityToken(
  identityToken: string | null | undefined,
): string | undefined {
  if (typeof identityToken !== 'string') {
    return undefined;
  }
  const trimmed = identityToken.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}
