import { Link, Stack } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { getCopy } from '@/src/copy';
import { colors, spacing, textStyles } from '@/src/theme';

export default function NotFoundScreen() {
  const nav = getCopy().nav;
  const screen = getCopy().screens.notFound;

  return (
    <>
      <Stack.Screen options={{ title: nav.notFound }} />
      <View style={styles.container}>
        <Text style={styles.title}>{screen.title}</Text>
        <Link href="/(tabs)/home" style={styles.link}>
          <Text style={styles.linkText}>{nav.goHome}</Text>
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    backgroundColor: colors.background,
  },
  title: {
    ...textStyles.headline,
    color: colors.ink,
  },
  link: {
    marginTop: spacing.lg,
  },
  linkText: {
    ...textStyles.bodyStrong,
    color: colors.pink,
  },
});
