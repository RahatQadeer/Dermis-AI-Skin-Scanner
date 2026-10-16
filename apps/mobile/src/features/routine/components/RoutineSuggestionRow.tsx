import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/src/components/text/AppText';
import { getCopy } from '@/src/copy';
import { colors, fontFamilies, radii, spacing, touchTargets } from '@/src/theme';

import type { RoutineSuggestion } from '../lib/routineSuggestions';

export type RoutineSuggestionRowProps = {
  item: RoutineSuggestion;
  added: boolean;
  onToggle: (label: string) => void;
};

export function RoutineSuggestionRow({ item, added, onToggle }: RoutineSuggestionRowProps) {
  const r = getCopy().screens.routine;
  return (
    <View style={styles.suggestCard}>
      <View style={styles.suggestText}>
        <AppText variant="bodyStrong" color={colors.ink}>
          {item.label}
        </AppText>
        <AppText variant="caption" color={colors.muteBody}>
          {item.subtitle}
        </AppText>
        <View style={styles.badge}>
          <AppText variant="caption" color={colors.greenDeep} style={styles.badgeText}>
            {item.badge}
          </AppText>
        </View>
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={
          added ? r.removeSuggestionA11y(item.label) : r.addSuggestionA11y(item.label)
        }
        onPress={() => onToggle(item.label)}
        style={({ pressed }) => [added ? styles.addedBtn : styles.plusBtn, pressed && styles.pressed]}
      >
        {added ? (
          <AppText variant="caption" color={colors.greenDeep} style={styles.addedText}>
            {r.suggestionAdded}
          </AppText>
        ) : (
          <AppText variant="headline" color={colors.surface}>
            +
          </AppText>
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  suggestCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.borderMuted,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  suggestText: {
    flex: 1,
    gap: spacing.xxs,
  },
  badge: {
    alignSelf: 'flex-start',
    marginTop: spacing.xs,
    backgroundColor: colors.greenSoft,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xxs + 1,
  },
  badgeText: {
    fontFamily: fontFamilies.bodySemiBold,
  },
  plusBtn: {
    width: touchTargets.min - 4,
    height: touchTargets.min - 4,
    borderRadius: radii.pill,
    backgroundColor: colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addedBtn: {
    minWidth: touchTargets.min + 12,
    height: touchTargets.min - 4,
    borderRadius: radii.pill,
    backgroundColor: colors.greenSoft,
    borderWidth: 1,
    borderColor: colors.green,
    paddingHorizontal: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addedText: {
    fontFamily: fontFamilies.bodyBold,
  },
  pressed: {
    opacity: 0.88,
  },
});
