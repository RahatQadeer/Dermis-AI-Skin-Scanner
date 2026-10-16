/**
 * Display name for Home/Profile — signup full name only (never email local-part).
 */
export function resolveAccountDisplayName(input: {
  firstName?: string | null;
  /** @deprecated email is not used for display; kept for call-site compat. */
  email?: string | null;
}): string | null {
  const name = input.firstName?.trim();
  return name && name.length > 0 ? name : null;
}

/** @deprecated kept for tests that cover email formatting utilities elsewhere. */
export function displayNameFromEmailLocal(localPart: string): string {
  const withoutTag = (localPart.split('+')[0] ?? localPart).trim();
  if (!withoutTag) {
    return '';
  }
  const parts = withoutTag
    .split(/[._\-\s]+/)
    .map((part) => part.trim())
    .filter(Boolean);
  if (parts.length === 0) {
    return '';
  }
  return parts.map(titleCaseToken).join(' ');
}

function titleCaseToken(token: string): string {
  if (token.length === 0) {
    return token;
  }
  return token.charAt(0).toUpperCase() + token.slice(1).toLowerCase();
}
