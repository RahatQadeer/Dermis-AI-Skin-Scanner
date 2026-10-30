import { useEffect, useState } from 'react';

import { listScans, type ScanDto } from '@/src/features/scan/api/scanApi';

const EMPTY: ScanDto[] = [];

export function useResultsScanHistory(
  liveSession: boolean,
  accessToken: string | null,
  lastScanId: string | undefined,
  userId: string | null,
): { history: ScanDto[]; loading: boolean } {
  const [owned, setOwned] = useState<{ userId: string | null; rows: ScanDto[] }>({
    userId,
    rows: [],
  });
  // Rows fetched for another account are never returned, even for the render
  // before the refetch below starts. A token refresh (same user) keeps them.
  const history = owned.userId === userId ? owned.rows : EMPTY;
  const setHistory = (rows: ScanDto[]) => setOwned({ userId, rows });
  const [loading, setLoading] = useState(liveSession);

  useEffect(() => {
    if (!liveSession) {
      setHistory([]);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    void listScans()
      .then((rows) => {
        if (!cancelled) {
          setHistory(rows);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setHistory([]);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- setHistory captures userId
  }, [accessToken, lastScanId, liveSession, userId]);

  return { history, loading };
}
