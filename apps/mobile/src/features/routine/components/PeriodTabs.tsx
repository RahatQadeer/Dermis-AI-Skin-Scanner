import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/src/components/text/AppText';
import { getCopy } from '@/src/copy';
import { colors, radii, shadows, spacing } from '@/src/theme';

import type { RoutinePeriod } from '../types/routineTypes';

export type PeriodTabsProps = {
  value: RoutinePeriod;
  onChange: (value: RoutinePeriod) => void;
  disabled?: boolean;
};

export function PeriodTabs({ value, onChange, disabled = false }: PeriodTabsProps) {
  const r = getCopy().screens.routine;
  const tabs: { value: RoutinePeriod; label: string }[] = [
    { value: 'am', label: r.periodAmTab },
    { value: 'pm', label: r.periodPmTab },
  ];

  return (
    <View
      accessibilityRole="tablist"
      accessibilityLabel={r.periodA11y}
      style={[styles.track, disabled ? styles.disabled : null]}
    >
      {tabs.map((tab) => {
        const selected = tab.value === value;
        return (
          <Pressable
            key={tab.value}
            accessibilityRole="tab"
            accessibilityState={{ selected, disabled }}
            accessibilityLabel={tab.label}
            disabled={disabled}
            onPress={() => onChange(tab.value)}
            style={[styles.tab, selected ? styles.tabSelected : null]}
          >
            <AppText variant="bodyStrong" align="center" color={selected ? colors.surface : colors.ink}>
              {tab.label}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    flexDirection: 'row',
    backgroundColor: colors.quizTrack,
    borderRadius: radii.pill,
    padding: spacing.xs,
    gap: spacing.xs,
  },
  tab: {
    flex: 1,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
  },
  tabSelected: {
    backgroundColor: colors.ink,
    ...shadows.soft,
  },
  disabled: {
    opacity: 0.45,
  },
});
