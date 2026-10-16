import { useRouter } from 'expo-router';
import { Alert } from 'react-native';

import { getCopy } from '@/src/copy';
import { useSession } from '@/src/features/session/SessionContext';

import type { useProfileSettings } from '../hooks/useProfileSettings';
import { DeleteAccountSheet } from './DeleteAccountSheet';
import { ProfileAccountSection } from './ProfileAccountSection';
import { ProfileDataSection } from './ProfileDataSection';
import { ProfileLegalSection } from './ProfileLegalSection';

export function ProfileActions({
  settings,
  plan,
}: {
  settings: ReturnType<typeof useProfileSettings>;
  plan: 'free' | 'pro';
}) {
  const router = useRouter();
  const p = getCopy().screens.profile;
  const session = useSession();

  const confirmDeleteScans = () => {
    Alert.alert(p.deleteScansSheetTitle, p.deleteScansSheetBody, [
      { text: p.deleteCancel, style: 'cancel' },
      {
        text: p.deleteScansConfirm,
        style: 'destructive',
        onPress: () => {
          void settings.onConfirmDeleteScans();
        },
      },
    ]);
  };

  return (
    <>
      <ProfileDataSection
        onExport={() => void settings.onExport()}
        onDeleteScanData={confirmDeleteScans}
        onDeleteAccount={() => settings.setDeleteOpen(true)}
        onSignOut={() => {
          session.signOut();
          settings.showToast(p.signOutToast);
          router.replace('/sign-up');
        }}
      />
      <ProfileLegalSection onLegalUnavailable={() => settings.showToast(p.legalUnavailable)} />
      <ProfileAccountSection plan={plan} />
      <DeleteAccountSheet
        visible={settings.deleteOpen}
        onClose={() => settings.setDeleteOpen(false)}
        onConfirm={() => void confirmDeleteAccount(settings, router)}
      />
    </>
  );
}

function confirmDeleteAccount(
  settings: ReturnType<typeof useProfileSettings>,
  router: ReturnType<typeof useRouter>,
): void {
  void settings.onConfirmDeleteAccount().then((ok) => {
    settings.setDeleteOpen(false);
    if (ok) {
      router.replace('/sign-up');
    }
  });
}
