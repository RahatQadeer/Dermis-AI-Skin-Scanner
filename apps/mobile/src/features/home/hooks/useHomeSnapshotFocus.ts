import { resolveEffectivePlan } from '@dermis/domain';
import { useFocusEffect } from 'expo-router';
import { useCallback } from 'react';

import type { ScanDto } from '@/src/features/scan/api/scanApi';

import { scanDtoToHomeScan } from '../lib/scanDtoToHomeScan';
import type {
  HomeRoutineProgress,
  HomeScanSnapshot,
  HomeSnapshot,
} from '../mock/homeMockScenarios';
import { applyGuestHomeSnapshot, refreshHomeSnapshot } from './refreshHomeSnapshot';

type HomeFocusCtx = {
  live: boolean;
  accessToken: string | null;
  quotaRefreshVersion: number;
  lastScan: ScanDto | null;
  readyRef: { current: boolean };
  /** Last server-confirmed plan, tagged with its user (never reused across accounts). */
  knownPlanRef: { current: { userId: string | null; plan: HomeSnapshot['quota']['plan'] } | null };
  userId: string | null;
  setQuota: (q: HomeSnapshot['quota']) => void;
  setScan: (s: HomeScanSnapshot | null) => void;
  setRoutine: (r: HomeRoutineProgress) => void;
  setLoading: (v: boolean) => void;
};

function applyLastScanFallback(ctx: HomeFocusCtx): void {
  if (!ctx.lastScan) {
    return;
  }
  const known = ctx.knownPlanRef.current;
  ctx.setScan(scanDtoToHomeScan(ctx.lastScan, null));
  ctx.setQuota({
    plan: known && known.userId === ctx.userId ? known.plan : resolveEffectivePlan('free'),
    lifetimeScanCount: 1,
    dailyScanCount: 0,
  });
  ctx.readyRef.current = true;
}

export function useHomeSnapshotFocus(ctx: HomeFocusCtx): void {
  useFocusEffect(
    useCallback(() => {
      void ctx.quotaRefreshVersion;
      if (!ctx.live || !ctx.accessToken) {
        applyGuestHomeSnapshot(ctx.lastScan, ctx, ctx.readyRef);
        return;
      }

      let cancelled = false;
      if (!ctx.readyRef.current) {
        ctx.setLoading(true);
      }

      void (async () => {
        try {
          const known = ctx.knownPlanRef.current;
          const next = await refreshHomeSnapshot(
            ctx.lastScan,
            known && known.userId === ctx.userId ? known.plan : null,
          );
          if (cancelled) {
            return;
          }
          ctx.knownPlanRef.current = { userId: ctx.userId, plan: next.quota.plan };
          ctx.setQuota(next.quota);
          ctx.setScan(next.scan);
          ctx.setRoutine(next.routine);
          ctx.readyRef.current = true;
        } catch {
          if (!cancelled) {
            applyLastScanFallback(ctx);
          }
        } finally {
          if (!cancelled) {
            ctx.setLoading(false);
          }
        }
      })();

      return () => {
        cancelled = true;
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps -- focus refresh; version bump via quotaRefreshVersion
    }, [ctx.accessToken, ctx.lastScan, ctx.live, ctx.quotaRefreshVersion]),
  );
}
