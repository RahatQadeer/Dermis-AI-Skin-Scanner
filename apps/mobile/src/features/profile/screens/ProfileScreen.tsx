import { StatusBar } from 'expo-status-bar';
import { StyleSheet } from 'react-native';

import { Screen } from '@/src/components/layout/Screen';
import { TAB_BAR_SCROLL_PAD } from '@/src/components/layout/tabBarTypes';
import { ToastHost } from '@/src/components/layout/ToastHost';
import { useHomeSnapshot } from '@/src/features/home/hooks/useHomeSnapshot';
import { resolveAccountDisplayName } from '@/src/features/session/accountDisplayName';
import { useSession } from '@/src/features/session/SessionContext';
import { spacing } from '@/src/theme';

import { ProfileActions } from '../components/ProfileActions';
import { ProfileIdentity } from '../components/ProfileIdentity';
import { ProfileSettingsSection } from '../components/ProfileSettingsSection';
import { ProfileStatCards } from '../components/ProfileStatCards';
import { useProfileSettings } from '../hooks/useProfileSettings';

export function ProfileScreen() {
  const session = useSession();
  const snapshot = useHomeSnapshot();
  const settings = useProfileSettings();

  return (
    <Screen scroll padded edges={['top', 'left', 'right']} contentStyle={styles.content}>
      <StatusBar style="dark" />
      <ProfileIdentity
        displayName={
          resolveAccountDisplayName({ firstName: session.firstName }) ??
          (session.accessToken ? 'Member' : snapshot.displayName)
        }
        email={session.email}
        scanCount={snapshot.quota.lifetimeScanCount}
      />
      <ProfileStatCards />
      <ProfileSettingsSection
        notificationsOn={settings.notificationsOn}
        onNotificationsChange={settings.setNotificationsOn}
        lightingOn={settings.lightingOn}
        onLightingChange={settings.setLightingOn}
        shareDataOn={settings.shareDataOn}
        onShareDataChange={settings.setShareDataOn}
        routineNudgesOn={settings.tipsOn}
        onRoutineNudgesChange={settings.setTipsOn}
      />
      <ProfileActions settings={settings} plan={snapshot.quota.plan} />
      <ToastHost
        message={settings.toastMessage}
        visible={settings.toastVisible}
        onDismiss={settings.dismissToast}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: spacing.lg,
    paddingBottom: TAB_BAR_SCROLL_PAD,
  },
});
