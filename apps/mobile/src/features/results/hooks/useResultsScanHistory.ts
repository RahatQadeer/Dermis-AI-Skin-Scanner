import { useEffect, useState } from 'react';

import { listScans, type ScanDto } from '@/src/features/scan/api/scanApi';

export function useResultsScanHistory(
  liveSession: boolean,
  accessToken: string | null,
  lastScanId: string | undefined,
): { history: ScanDto[]; loading: boolean } {
  const [history, setHistory] = useState<ScanDto[]>([]);
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
  }, [accessToken, lastScanId, liveSession]);

  return { history, loading };
}
