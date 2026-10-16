import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/src/components/text/AppText';
import { colors, fontFamilies, radii, shadows } from '@/src/theme';

export type QuizOptionRowProps = {
  title: string;
  subtitle: string;
  selected?: boolean;
  disabled?: boolean;
  onPress?: () => void;
  leading?: ReactNode;
  accessibilityLabel?: string;
};

/**
 * Prototype quiz option: white card, ink border when selected, pink ✓,
 * title 15 / sub 12.5 Nunito, radius 20.
 */
function cardStyle(selected: boolean, disabled: boolean) {
  return [
    styles.card,
    selected ? styles.cardSelected : styles.cardIdle,
    disabled && !selected ? styles.cardDisabled : null,
  ];
}

function CheckDot({ selected }: { selected: boolean }) {
  return (
    <View style={[styles.check, selected ? styles.checkOn : styles.checkOff]}>
      {selected ? (
        <AppText style={styles.checkMark} color={colors.ink}>
          ✓
        </AppText>
      ) : null}
    </View>
  );
}

export function QuizOptionRow({
  title,
  subtitle,
  selected = false,
  disabled = false,
  onPress,
  leading,
  accessibilityLabel,
}: QuizOptionRowProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? `${title}. ${subtitle}`}
      accessibilityState={{ selected, disabled }}
      disabled={disabled || !onPress}
      onPress={onPress}
      style={cardStyle(selected, disabled)}
    >
      {leading ? <View style={styles.leading}>{leading}</View> : null}
      <View style={styles.text}>
        <AppText style={styles.title} color={colors.ink}>
          {title}
        </AppText>
        <AppText style={styles.subtitle} color={colors.muteSoft}>
          {subtitle}
        </AppText>
      </View>
      <CheckDot selected={selected} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 2,
    backgroundColor: colors.surface,
  },
  cardIdle: {
    borderColor: colors.surface,
    ...shadows.soft,
    shadowOpacity: 0.04,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  cardSelected: {
    borderColor: colors.ink,
    ...shadows.soft,
    shadowOpacity: 0.12,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 10 },
    elevation: 4,
    transform: [{ translateY: -2 }],
  },
  cardDisabled: {
    opacity: 0.45,
  },
  leading: {
    flexShrink: 0,
  },
  text: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    fontFamily: fontFamilies.bodyBold,
    fontSize: 17,
    lineHeight: 22,
  },
  subtitle: {
    marginTop: 1,
    fontFamily: fontFamilies.body,
    fontSize: 14.5,
    lineHeight: 20,
  },
  check: {
    width: 24,
    height: 24,
    borderRadius: radii.pill,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  checkOff: {
    borderColor: colors.borderMuted,
    backgroundColor: 'transparent',
  },
  checkOn: {
    borderColor: colors.pinkBright,
    backgroundColor: colors.pinkBright,
  },
  checkMark: {
    fontFamily: fontFamilies.bodyBold,
    fontSize: 12,
    lineHeight: 14,
  },
});
