import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { StyleSheet } from 'react-native';

import { Screen } from '@/src/components/layout/Screen';
import { TAB_BAR_SCROLL_PAD } from '@/src/components/layout/tabBarTypes';
import { ToastHost } from '@/src/components/layout/ToastHost';
import { useHomeSnapshot } from '@/src/features/home/hooks/useHomeSnapshot';
import { resolveAccountDisplayName } from '@/src/features/session/accountDisplayName';
import { useSession } from '@/src/features/session/SessionContext';
import { spacing } from '@/src/theme';

import type { ProfileDto } from '../api/profileApi';
import { ProfileActions } from '../components/ProfileActions';
import { ProfileFaceActions } from '../components/ProfileFaceActions';
import { ProfileIdentity } from '../components/ProfileIdentity';
import { ProfileSettingsSection } from '../components/ProfileSettingsSection';
import { ProfileSkinEditSheet } from '../components/ProfileSkinEditSheet';
import { ProfileStatCards } from '../components/ProfileStatCards';
import { useProfileSettings } from '../hooks/useProfileSettings';
import { useSavedSkinProfile } from '../hooks/useSavedSkinProfile';

export function ProfileScreen() {
  const session = useSession();
  const snapshot = useHomeSnapshot();
  const settings = useProfileSettings();
  const skin = useSavedSkinProfile();
  const [editOpen, setEditOpen] = useState(false);
  const canEdit = canEditSkin(skin.profile);

  return (
    <Screen scroll padded edges={['top', 'left', 'right']} contentStyle={styles.content}>
      <StatusBar style="dark" />
      <ProfileBody
        displayName={
          resolveAccountDisplayName({ firstName: session.firstName }) ??
          (session.accessToken ? 'Member' : snapshot.displayName)
        }
        email={session.email}
        scanCount={snapshot.quota.lifetimeScanCount}
        memberSince={skin.profile?.createdAt ?? null}
        skinProfile={skin.profile}
        signedIn={Boolean(session.accessToken)}
        canEdit={canEdit}
        onEditSkin={() => setEditOpen(true)}
        settings={settings}
        plan={snapshot.quota.plan}
      />
      {skin.profile && canEdit ? (
        <ProfileSkinEditSheet
          visible={editOpen}
          profile={skin.profile}
          onClose={() => setEditOpen(false)}
          onSaved={skin.setProfile}
          showToast={settings.showToast}
        />
      ) : null}
      <ToastHost
        message={settings.toastMessage}
        visible={settings.toastVisible}
        onDismiss={settings.dismissToast}
      />
    </Screen>
  );
}

function ProfileBody(props: {
  displayName: string;
  email: string | null;
  scanCount: number;
  memberSince: string | null;
  skinProfile: ProfileDto | null;
  signedIn: boolean;
  canEdit: boolean;
  onEditSkin: () => void;
  settings: ReturnType<typeof useProfileSettings>;
  plan: 'free' | 'pro';
}) {
  return (
    <>
      <ProfileIdentity
        displayName={props.displayName}
        email={props.email}
        scanCount={props.scanCount}
        memberSince={props.memberSince}
      />
      <ProfileStatCards profile={props.skinProfile} />
      <ProfileFaceActions
        signedIn={props.signedIn}
        canEditSkin={props.canEdit}
        onEditSkin={props.onEditSkin}
      />
      <ProfileSettingsSection
        notificationsOn={props.settings.notificationsOn}
        onNotificationsChange={props.settings.setNotificationsOn}
        routineNudgesOn={props.settings.tipsOn}
        onRoutineNudgesChange={props.settings.setTipsOn}
      />
      <ProfileActions settings={props.settings} plan={props.plan} />
    </>
  );
}

function canEditSkin(profile: ProfileDto | null): boolean {
  return (
    profile != null &&
    profile.skinType != null &&
    profile.skinTone != null &&
    profile.sensitivity != null
  );
}

const styles = StyleSheet.create({
  content: {
    gap: spacing.lg,
    paddingBottom: TAB_BAR_SCROLL_PAD,
  },
});
