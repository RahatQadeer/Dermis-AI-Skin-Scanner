import { Share } from 'react-native';

import { getCopy } from '@/src/copy';
import { deleteAllScans } from '@/src/features/scan/api/scanApi';
import type { SessionState } from '@/src/features/session/SessionContext';
import { isApiError } from '@/src/lib/api/errors';

import { deleteAccount, exportAccountData } from '../api/accountApi';

type ProfileCopy = ReturnType<typeof getCopy>['screens']['profile'];

function failToast(p: ProfileCopy, error: unknown, fallback: string): string {
  if (isApiError(error) && (error.code === 'invalid_token' || error.code === 'missing_token')) {
    return p.sessionExpiredToast;
  }
  return fallback;
}

export async function runExportAccount(
  session: SessionState,
  p: ProfileCopy,
  showToast: (m: string) => void,
): Promise<void> {
  if (!session.apiEnabled || !session.accessToken) {
    showToast(p.exportStubToast);
    return;
  }
  try {
    const payload = await exportAccountData();
    await Share.share({ message: JSON.stringify(payload, null, 2) });
    showToast(p.exportOkToast);
  } catch (error) {
    showToast(failToast(p, error, p.exportFailToast));
  }
}

export async function runDeleteScans(
  session: SessionState,
  p: ProfileCopy,
  showToast: (m: string) => void,
  clearLastScan: () => void,
): Promise<boolean> {
  if (!session.apiEnabled || !session.accessToken) {
    showToast(p.deleteScansStubToast);
    return false;
  }
  try {
    await deleteAllScans();
    clearLastScan();
    showToast(p.deleteScansOkToast);
    return true;
  } catch (error) {
    showToast(failToast(p, error, p.deleteScansFailToast));
    return false;
  }
}

export async function runDeleteAccount(
  session: SessionState,
  p: ProfileCopy,
  showToast: (m: string) => void,
  clearLastScan: () => void,
): Promise<boolean> {
  if (!session.apiEnabled || !session.accessToken) {
    showToast(p.deleteStubToast);
    return false;
  }
  try {
    await deleteAccount();
    clearLastScan();
    session.signOut();
    showToast(p.deleteOkToast);
    return true;
  } catch (error) {
    showToast(failToast(p, error, p.deleteFailToast));
    return false;
  }
}
