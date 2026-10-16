import { useCallback, useEffect, useState } from 'react';

import { getCopy } from '@/src/copy';
import { useSession } from '@/src/features/session/SessionContext';
import { useScanCapture } from '@/src/features/scan/context/ScanCaptureContext';

import { useAccountActions } from './useAccountActions';
import { patchSettings } from '../api/settingsApi';
import { applyScanReminderToggle } from './applyScanReminderToggle';
import { loadProfileSettings } from './loadProfileSettings';

type ProfileCopy = ReturnType<typeof getCopy>['screens']['profile'];
type Session = ReturnType<typeof useSession>;

export function useProfileSettings() {
  const session = useSession();
  const p = getCopy().screens.profile;
  const toast = useToast();
  const toggles = useSettingsToggles({ session, showToast: toast.showToast, p });
  const localPrefs = useLocalPrefs();
  const { setLastScan } = useScanCapture();
  const account = useAccountActions({
    session,
    showToast: toast.showToast,
    p,
    clearLastScan: () => setLastScan(null),
  });
  const [deleteOpen, setDeleteOpen] = useState(false);

  return {
    ...toggles,
    ...localPrefs,
    ...toast,
    deleteOpen,
    setDeleteOpen,
    onExport: account.onExport,
    onConfirmDeleteScans: account.onConfirmDeleteScans,
    onConfirmDeleteAccount: account.onConfirmDeleteAccount,
    busy: account.busy,
  };
}

/** UI-only preferences (no backend yet): lighting check on, data-sharing off. */
function useLocalPrefs() {
  const [lightingOn, setLightingOn] = useState(true);
  const [shareDataOn, setShareDataOn] = useState(false);
  return { lightingOn, setLightingOn, shareDataOn, setShareDataOn };
}

function useToast() {
  const [toastMessage, setToastMessage] = useState('');
  const [toastVisible, setToastVisible] = useState(false);
  const showToast = useCallback((message: string) => {
    setToastMessage(message);
    setToastVisible(true);
  }, []);
  const dismissToast = useCallback(() => setToastVisible(false), []);
  return { toastMessage, toastVisible, showToast, dismissToast };
}

function useSettingsToggles(ctx: {
  session: Session;
  showToast: (m: string) => void;
  p: ProfileCopy;
}) {
  const [notificationsOn, setNotificationsOnLocal] = useState(false);
  const [tipsOn, setTipsOnLocal] = useState(true);
  useLoadSettings({
    session: ctx.session,
    setNotifications: setNotificationsOnLocal,
    setTips: setTipsOnLocal,
    showToast: ctx.showToast,
    loadError: ctx.p.settingsLoadError,
  });

  return {
    notificationsOn,
    tipsOn,
    setNotificationsOn: useScanReminderToggle({
      setLocal: setNotificationsOnLocal,
      session: ctx.session,
      showToast: ctx.showToast,
      p: ctx.p,
    }),
    setTipsOn: useTogglePatch({
      setLocal: setTipsOnLocal,
      key: 'notifyProductUpdates',
      session: ctx.session,
      showToast: ctx.showToast,
      errorMsg: ctx.p.settingsSaveError,
    }),
  };
}

function useScanReminderToggle(ctx: {
  setLocal: (v: boolean) => void;
  session: Session;
  showToast: (m: string) => void;
  p: ProfileCopy;
}) {
  return useCallback(
    (value: boolean) => {
      void applyScanReminderToggle({
        value,
        setLocal: ctx.setLocal,
        apiLive: ctx.session.apiEnabled && Boolean(ctx.session.accessToken),
        showToast: ctx.showToast,
        messages: {
          permissionDenied: ctx.p.notificationsPermissionDenied,
          unsupported: ctx.p.notificationsUnsupported,
          scheduleError: ctx.p.notificationsScheduleError,
          settingsSaveError: ctx.p.settingsSaveError,
        },
      });
    },
    [ctx],
  );
}

function useLoadSettings(ctx: {
  session: Session;
  setNotifications: (v: boolean) => void;
  setTips: (v: boolean) => void;
  showToast: (m: string) => void;
  loadError: string;
}): void {
  useEffect(() => {
    if (!ctx.session.apiEnabled || !ctx.session.accessToken) {
      return;
    }
    let cancelled = false;
    void loadProfileSettings({
      setNotifications: ctx.setNotifications,
      setTips: ctx.setTips,
      showToast: ctx.showToast,
      loadError: ctx.loadError,
      isCancelled: () => cancelled,
    });
    return () => {
      cancelled = true;
    };
  }, [ctx]);
}

function useTogglePatch(ctx: {
  setLocal: (v: boolean) => void;
  key: 'notifyScanReminders' | 'notifyProductUpdates';
  session: Session;
  showToast: (m: string) => void;
  errorMsg: string;
}) {
  return useCallback(
    (value: boolean) => {
      ctx.setLocal(value);
      if (!ctx.session.apiEnabled || !ctx.session.accessToken) {
        return;
      }
      void patchSettings({ [ctx.key]: value }).catch(() => {
        ctx.setLocal(!value);
        ctx.showToast(ctx.errorMsg);
      });
    },
    [ctx],
  );
}
