/** Pure URL policy helpers (no Expo imports — safe for Node CI). DERM-068. */

export function isSafeLegalUrl(url: string): boolean {
  if (!url.trim()) {
    return false;
  }
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

export function isHttpsUrl(url: string): boolean {
  return isSafeLegalUrl(url);
}
