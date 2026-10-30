import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';

import { useSession } from '@/src/features/session/SessionContext';

import { fetchProfile, type ProfileDto } from '../api/profileApi';

/**
 * The signed-in user's saved skin assessment, refreshed whenever Profile gains
 * focus (e.g. after editing it). Null while loading, signed out or on error —
 * the UI then shows "not set" rather than placeholder values.
 */
export function useSavedSkinProfile(): ProfileDto | null {
  const { accessToken, apiEnabled, userId } = useSession();
  const [owned, setOwned] = useState<{ userId: string | null; profile: ProfileDto | null }>({
    userId: null,
    profile: null,
  });

  useFocusEffect(
    useCallback(() => {
      if (!apiEnabled || !accessToken) {
        return;
      }
      let cancelled = false;
      void fetchProfile()
        .then((profile) => {
          if (!cancelled) {
            setOwned({ userId, profile });
          }
        })
        .catch(() => {});
      return () => {
        cancelled = true;
      };
    }, [accessToken, apiEnabled, userId]),
  );

  return owned.userId === userId ? owned.profile : null;
}
