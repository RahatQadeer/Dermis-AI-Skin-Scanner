import { useCallback, useState } from 'react';

import { getCopy } from '@/src/copy';
import type { SessionState } from '@/src/features/session/SessionContext';

import {
  runDeleteAccount,
  runDeleteScans,
  runExportAccount,
} from './accountActionHandlers';

type ProfileCopy = ReturnType<typeof getCopy>['screens']['profile'];

export function useAccountActions(ctx: {
  session: SessionState;
  showToast: (m: string) => void;
  p: ProfileCopy;
  clearLastScan: () => void;
}) {
  const [busy, setBusy] = useState(false);

  const onExport = useCallback(async () => {
    setBusy(true);
    await runExportAccount(ctx.session, ctx.p, ctx.showToast);
    setBusy(false);
  }, [ctx]);

  const onConfirmDeleteScans = useCallback(async (): Promise<boolean> => {
    setBusy(true);
    const ok = await runDeleteScans(ctx.session, ctx.p, ctx.showToast, ctx.clearLastScan);
    setBusy(false);
    return ok;
  }, [ctx]);

  const onConfirmDeleteAccount = useCallback(async (): Promise<boolean> => {
    setBusy(true);
    const ok = await runDeleteAccount(ctx.session, ctx.p, ctx.showToast, ctx.clearLastScan);
    setBusy(false);
    return ok;
  }, [ctx]);

  return { onExport, onConfirmDeleteScans, onConfirmDeleteAccount, busy };
}
