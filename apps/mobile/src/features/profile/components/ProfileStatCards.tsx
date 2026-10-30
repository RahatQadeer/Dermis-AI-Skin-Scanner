import { StyleSheet, View } from 'react-native';

import { AppText } from '@/src/components/text/AppText';
import { getCopy } from '@/src/copy';
import { colors, radii, spacing } from '@/src/theme';

import type { ProfileDto } from '../api/profileApi';

/** The user's saved skin assessment (never placeholder values). */
export function ProfileStatCards({ profile }: { profile: ProfileDto | null }) {
  const p = getCopy().screens.profile;
  const items = [
    {
      label: p.statSkinType,
      value: profile?.skinType ? p.skinTypeLabels[profile.skinType] : p.statNotSet,
    },
    {
      label: p.statFitzpatrick,
      value: profile?.skinTone ? p.skinToneLabels[profile.skinTone] : p.statNotSet,
    },
    {
      label: p.statSensitivity,
      value: profile?.sensitivity ? p.sensitivityLabels[profile.sensitivity] : p.statNotSet,
    },
    {
      label: p.statAgeBand,
      value: profile?.ageBand ? p.ageBandLabels[profile.ageBand] : p.statNotSet,
    },
  ];

  return (
    <View style={styles.wrap}>
      <View style={styles.row}>
        {items.slice(0, 2).map((item) => (
          <View key={item.label} style={styles.card}>
            <AppText variant="caption" color={colors.mute}>
              {item.label}
            </AppText>
            <AppText variant="bodyStrong">{item.value}</AppText>
          </View>
        ))}
      </View>
      <View style={styles.row}>
        {items.slice(2).map((item) => (
          <View key={item.label} style={styles.card}>
            <AppText variant="caption" color={colors.mute}>
              {item.label}
            </AppText>
            <AppText variant="bodyStrong">{item.value}</AppText>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  card: {
    flex: 1,
    gap: spacing.xs,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.lg,
    padding: spacing.md,
  },
});
