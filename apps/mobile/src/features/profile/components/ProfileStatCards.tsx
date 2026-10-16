import { StyleSheet, View } from 'react-native';

import { AppText } from '@/src/components/text/AppText';
import { getCopy } from '@/src/copy';
import { colors, radii, spacing } from '@/src/theme';

export function ProfileStatCards() {
  const p = getCopy().screens.profile;
  const items = [
    { label: p.statSkinType, value: p.statSkinTypeValue },
    { label: p.statFitzpatrick, value: p.statFitzpatrickValue },
    { label: p.statSensitivity, value: p.statSensitivityValue },
  ];

  return (
    <View style={styles.row}>
      {items.map((item) => (
        <View key={item.label} style={styles.card}>
          <AppText variant="caption" color={colors.mute}>
            {item.label}
          </AppText>
          <AppText variant="bodyStrong">{item.value}</AppText>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
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
