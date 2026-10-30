import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { colors } from '@/src/theme';

/** Neutral full-bleed loader used while session/profile state resolves. */
export function FullScreenLoader() {
  return (
    <View style={styles.root}>
      <ActivityIndicator color={colors.ink} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
});
