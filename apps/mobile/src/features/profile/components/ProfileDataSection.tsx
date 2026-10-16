import { Pressable, StyleSheet, View } from 'react-native';

import { Card } from '@/src/components/Card';
import { ListRow } from '@/src/components/ListRow';
import { AppText } from '@/src/components/text/AppText';
import { getCopy } from '@/src/copy';
import { colors, spacing } from '@/src/theme';

const CHEVRON = '›';

export type ProfileDataSectionProps = {
  onExport: () => void;
  onDeleteScanData: () => void;
  onDeleteAccount: () => void;
  onSignOut: () => void;
};

export function ProfileDataSection({
  onExport,
  onDeleteScanData,
  onDeleteAccount,
  onSignOut,
}: ProfileDataSectionProps) {
  const p = getCopy().screens.profile;

  return (
    <View style={styles.block}>
      <AppText variant="headline">{p.sectionData}</AppText>
      <Card padded={false}>
        <ListRow title={p.dataExport} onPress={onExport} trailing={<Chevron />} />
        <ListRow
          title={p.dataPhotos}
          trailing={
            <AppText variant="bodyStrong" color={colors.green}>
              {p.dataPhotosValue}
            </AppText>
          }
        />
        <DeleteRow label={p.dataDeleteScans} onPress={onDeleteScanData} />
        <DeleteRow label={p.dataDeleteAccount} onPress={onDeleteAccount} />
        <ListRow title={p.dataLogOut} onPress={onSignOut} trailing={<Chevron />} />
      </Card>
    </View>
  );
}

function Chevron() {
  return (
    <AppText variant="headline" color={colors.mute}>
      {CHEVRON}
    </AppText>
  );
}

function DeleteRow({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => [styles.deleteRow, pressed ? styles.pressed : null]}
    >
      <AppText variant="bodyStrong" color={colors.red}>
        {label}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  block: {
    gap: spacing.md,
  },
  deleteRow: {
    minHeight: 44,
    justifyContent: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
  },
  pressed: {
    opacity: 0.85,
  },
});
