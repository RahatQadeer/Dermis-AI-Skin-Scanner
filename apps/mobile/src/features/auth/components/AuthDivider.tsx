import { StyleSheet, View } from 'react-native';

import { AppText } from '@/src/components/text/AppText';
import { getCopy } from '@/src/copy';
import { colors, spacing } from '@/src/theme';

export function AuthDivider() {
  const auth = getCopy().auth;
  return (
    <View style={styles.row} accessibilityRole="none">
      <View style={styles.line} />
      <AppText variant="caption" color={colors.muteFoot}>
        {auth.orEmailDivider}
      </AppText>
      <View style={styles.line} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginVertical: spacing.xs,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
});
