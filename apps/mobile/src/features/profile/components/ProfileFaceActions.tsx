import { useRouter, type Href } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { Button } from '@/src/components/Button';
import { AppText } from '@/src/components/text/AppText';
import { getCopy } from '@/src/copy';
import { isFaceIdentityEnabled } from '@/src/features/scan/lib/faceConfig';
import { colors, spacing } from '@/src/theme';

const FACE_ENROLL_ADD = '/(scan)/face-enroll?addFace=1' as Href;

export type ProfileFaceActionsProps = {
  signedIn: boolean;
  canEditSkin: boolean;
  onEditSkin: () => void;
};

/** Edit-skin + add-new-face CTAs for Profile (keeps prior scan history). */
export function ProfileFaceActions({ signedIn, canEditSkin, onEditSkin }: ProfileFaceActionsProps) {
  const router = useRouter();
  const p = getCopy().screens.profile;
  const faceOn = isFaceIdentityEnabled();

  return (
    <View style={styles.wrap}>
      {canEditSkin ? <Button label={p.editProfile} variant="outline" onPress={onEditSkin} /> : null}
      {faceOn && signedIn ? (
        <>
          <AppText variant="caption" color={colors.mute}>
            {p.faceStatusHint}
          </AppText>
          <AppText variant="caption" color={colors.mute}>
            {p.faceHint}
          </AppText>
          <Button
            label={p.addNewFace}
            variant="outline"
            onPress={() => router.push(FACE_ENROLL_ADD)}
          />
          <AppText variant="caption" color={colors.mute}>
            {p.faceAddHint}
          </AppText>
        </>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: spacing.sm,
  },
});
