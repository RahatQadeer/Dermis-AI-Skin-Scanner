import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';

import { useSession } from '@/src/features/session/SessionContext';

import { fetchProfile, type ProfileDto } from '../api/profileApi';

/**
 * The signed-in user's saved skin assessment, refreshed whenever Profile gains
 * focus. Null while loading, signed out or on error.
 */
export function useSavedSkinProfile(): {
  profile: ProfileDto | null;
  setProfile: (profile: ProfileDto | null) => void;
  reload: () => void;
} {
  const { accessToken, apiEnabled, userId } = useSession();
  const [owned, setOwned] = useState<{ userId: string | null; profile: ProfileDto | null }>({
    userId: null,
    profile: null,
  });
  const [tick, setTick] = useState(0);

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
      // `tick` intentionally retriggers a refetch after local saves.
      // eslint-disable-next-line react-hooks/exhaustive-deps -- reload via tick
    }, [accessToken, apiEnabled, userId, tick]),
  );

  return {
    profile: owned.userId === userId ? owned.profile : null,
    setProfile: (profile) => setOwned({ userId, profile }),
    reload: () => setTick((n) => n + 1),
  };
}
