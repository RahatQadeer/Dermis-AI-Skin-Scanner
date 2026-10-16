import { StyleSheet, View } from 'react-native';

import { AppText } from '@/src/components/text/AppText';
import { getCopy } from '@/src/copy';
import { colors, fontFamilies, radii } from '@/src/theme';

/**
 * Prototype stats row: gap 8, margin-top 18, padding 10×12, radius 18.
 * Equal card height so 1- and 2-line subtitles align like the design.
 */
export function WelcomeStats() {
  const stats = getCopy().screens.welcome.stats;

  return (
    <View style={styles.row}>
      {stats.map((stat) => (
        <View key={stat.title} style={styles.card}>
          <AppText style={styles.title} color={colors.ink} numberOfLines={1}>
            {stat.title}
          </AppText>
          <AppText style={styles.subtitle} numberOfLines={2}>
            {stat.subtitle}
          </AppText>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: 8,
    marginTop: 28,
  },
  card: {
    flex: 1,
    minWidth: 0,
    minHeight: 78,
    backgroundColor: colors.surface,
    borderRadius: radii.card,
    paddingVertical: 14,
    paddingHorizontal: 12,
    justifyContent: 'center',
  },
  title: {
    fontFamily: fontFamilies.heading,
    fontSize: 17,
    lineHeight: 17,
  },
  subtitle: {
    fontFamily: fontFamilies.bodySemiBold,
    fontSize: 11,
    lineHeight: 14,
    color: colors.muteSoft,
    marginTop: 4,
  },
});
