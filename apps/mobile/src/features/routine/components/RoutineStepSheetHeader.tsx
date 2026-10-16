import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/src/components/text/AppText';
import { getCopy } from '@/src/copy';
import { colors, fontFamilies, spacing } from '@/src/theme';

export function RoutineStepSheetHeader(props: {
  title: string;
  doneSparkle: boolean;
  onClose: () => void;
}) {
  const common = getCopy().common;
  return (
    <View style={styles.header}>
      <AppText variant="headline" color={colors.ink} style={styles.title}>
        {props.title}
      </AppText>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={common.cancel}
        onPress={props.onClose}
        hitSlop={8}
        disabled={props.doneSparkle}
      >
        <AppText variant="bodyStrong" color={colors.green}>
          {common.cancel}
        </AppText>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    marginBottom: spacing.lg,
    paddingHorizontal: spacing.xxs,
  },
  title: {
    flex: 1,
    fontFamily: fontFamilies.headingBold,
  },
});
