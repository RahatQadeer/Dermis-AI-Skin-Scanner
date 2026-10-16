import { useFocusEffect } from 'expo-router';
import { useCallback, useRef } from 'react';

import { mapScanDtosToProgress } from '../lib/mapScanDtoToProgress';
import { fetchProgressScansForFocus } from './fetchProgressScans';
import type { ProgressLoadError } from './useProgressScans';
import type { ProgressScan } from '../types/progressTypes';
import type { ScanDto } from '@/src/features/scan/api/scanApi';

export function useProgressScansLoad(ctx: {
  session: {
    hydrated: boolean;
    apiEnabled: boolean;
    accessToken: string | null;
  };
  tick: number;
  lastScanRef: { current: ScanDto | null };
  setScans: (s: ProgressScan[]) => void;
  setError: (e: ProgressLoadError | null) => void;
  setLoading: (v: boolean) => void;
}): void {
  const requestId = useRef(0);

  useFocusEffect(
    useCallback(() => {
      void ctx.tick;
      if (!ctx.session.hydrated) {
        return;
      }

      if (!ctx.session.apiEnabled || !ctx.session.accessToken) {
        const local = ctx.lastScanRef.current;
        ctx.setScans(local ? mapScanDtosToProgress([local]) : []);
        ctx.setError(null);
        ctx.setLoading(false);
        return;
      }

      const id = ++requestId.current;
      ctx.setLoading(true);
      void fetchProgressScansForFocus(ctx.lastScanRef.current).then((result) => {
        if (id !== requestId.current) {
          return;
        }
        ctx.setScans(result.scans);
        ctx.setError(result.error);
        ctx.setLoading(false);
      });
      // eslint-disable-next-line react-hooks/exhaustive-deps -- tick-driven refresh
    }, [ctx.session.accessToken, ctx.session.apiEnabled, ctx.session.hydrated, ctx.tick]),
  );
}
