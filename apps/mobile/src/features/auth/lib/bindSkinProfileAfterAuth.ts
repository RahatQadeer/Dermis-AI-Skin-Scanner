import { resolveSkinProfileStatus } from '@/src/features/session/resolveSkinProfileStatus';
import type { SessionState } from '@/src/features/session/SessionContext';

/** Persist quiz draft to this account immediately so Home/Progress use one profile. */
export async function bindSkinProfileAfterAuth(
  session: SessionState,
  userId: string,
): Promise<void> {
  try {
    const status = await resolveSkinProfileStatus(userId);
    if (status === 'complete') {
      session.markSkinProfileComplete();
    }
  } catch {
    // Background sync will retry; do not fail auth.
  }
}
