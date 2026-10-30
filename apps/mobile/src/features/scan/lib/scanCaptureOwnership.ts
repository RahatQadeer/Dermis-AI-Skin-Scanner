/** A scan-capture value tagged with the session user that wrote it. */
export type Owned<T> = { ownerId: string | null; value: T | null };

export const EMPTY_OWNED: Owned<never> = { ownerId: null, value: null };

/**
 * Returns the value only while the same user is signed in. Read-time scoping
 * (rather than clearing in an effect) closes the window where a child screen's
 * focus effect runs before the provider's reset and sees the prior account.
 */
export function readOwned<T>(owned: Owned<T>, userId: string | null): T | null {
  return owned.ownerId === userId ? owned.value : null;
}

/**
 * Like readOwned, but also requires the scan record itself to belong to the
 * signed-in user — covers an upload started by one account resolving after
 * another account signed in, or after sign-out (every scan comes from the
 * server and carries its owner, so a signed-out session never sees one).
 */
export function readOwnedScan<T extends { userId: string }>(
  owned: Owned<T>,
  userId: string | null,
): T | null {
  const scan = readOwned(owned, userId);
  if (!scan || userId === null || scan.userId !== userId) {
    return null;
  }
  return scan;
}
