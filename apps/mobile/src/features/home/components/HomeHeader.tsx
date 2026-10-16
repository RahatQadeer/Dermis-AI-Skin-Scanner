import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/src/components/text/AppText';
import { getCopy } from '@/src/copy';
import { colors, radii, spacing } from '@/src/theme';

export type HomeHeaderProps = {
  name: string | null;
  onAvatar: () => void;
};

function todayLabel(): string {
  return new Date().toLocaleDateString(undefined, {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
  });
}

function greetingFor(name: string | null): string {
  const h = getCopy().screens.home;
  const hour = new Date().getHours();
  if (!name) {
    if (hour < 12) {
      return h.greetingMorningAnon;
    }
    if (hour < 18) {
      return h.greetingAfternoonAnon;
    }
    return h.greetingEveningAnon;
  }
  if (hour < 12) {
    return h.greetingMorning(name);
  }
  if (hour < 18) {
    return h.greetingAfternoon(name);
  }
  return h.greetingEvening(name);
}

function initialsFor(name: string | null): string {
  if (!name) {
    return '?';
  }
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('');
}

export function HomeHeader({ name, onAvatar }: HomeHeaderProps) {
  const nav = getCopy().nav;
  return (
    <View style={styles.row}>
      <View style={styles.text}>
        <AppText variant="caption" color={colors.mute}>
          {todayLabel()}
        </AppText>
        <AppText variant="title">{greetingFor(name)}</AppText>
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={nav.profile}
        onPress={onAvatar}
        style={styles.avatar}
      >
        <AppText variant="bodyStrong" color={colors.pink}>
          {initialsFor(name)}
        </AppText>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  text: {
    flex: 1,
    gap: spacing.xxs,
  },
  avatar: {
    width: spacing.huge,
    height: spacing.huge,
    borderRadius: radii.pill,
    backgroundColor: colors.noteSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
