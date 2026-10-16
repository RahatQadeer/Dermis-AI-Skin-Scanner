import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/src/components/text/AppText';
import { getCopy } from '@/src/copy';
import { colors, radii, shadows, spacing } from '@/src/theme';

export type PlanKind = 'annual' | 'monthly';

export type PlanCardProps = {
  kind: PlanKind;
  /** Localized price string from the store (e.g. "$49.99"). */
  priceLabel: string;
  selected: boolean;
  onSelect: () => void;
  /** Optional savings badge — pass `savingsBadgeLabel(percent)` from copy helper. */
  badgeLabel?: string;
  /** e.g. trial line for annual; omit when not applicable. */
  subtitle?: string;
  disabled?: boolean;
};

function planCopy(kind: PlanKind) {
  const paywall = getCopy().paywall;
  return {
    title: kind === 'annual' ? paywall.annualPlan : paywall.monthlyPlan,
    period: kind === 'annual' ? paywall.perYear : paywall.perMonth,
  };
}

function PlanBadge({ label }: { label: string }) {
  return (
    <View style={styles.badge}>
      <AppText variant="label" color={colors.surface}>
        {label}
      </AppText>
    </View>
  );
}

function PlanBody({
  title,
  period,
  priceLabel,
  subtitle,
}: {
  title: string;
  period: string;
  priceLabel: string;
  subtitle?: string;
}) {
  return (
    <View style={styles.row}>
      <View style={styles.copy}>
        <AppText variant="bodyStrong" color={colors.ink}>
          {title}
        </AppText>
        {subtitle ? (
          <AppText variant="caption" color={colors.mute}>
            {subtitle}
          </AppText>
        ) : null}
      </View>
      <View style={styles.priceBlock}>
        <AppText variant="headline" color={colors.ink}>
          {priceLabel}
        </AppText>
        <AppText variant="caption" color={colors.mute}>
          {period}
        </AppText>
      </View>
    </View>
  );
}

export function PlanCard({
  kind,
  priceLabel,
  selected,
  onSelect,
  badgeLabel,
  subtitle,
  disabled = false,
}: PlanCardProps) {
  const { title, period } = planCopy(kind);
  const borderColor = selected ? colors.green : colors.border;

  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ selected, disabled }}
      accessibilityLabel={`${title}, ${priceLabel} ${period}`}
      disabled={disabled}
      onPress={onSelect}
      style={({ pressed }) => [
        styles.card,
        shadows.soft,
        { borderColor, opacity: disabled ? 0.45 : pressed ? 0.9 : 1 },
      ]}
    >
      {badgeLabel ? <PlanBadge label={badgeLabel} /> : null}
      <PlanBody title={title} period={period} priceLabel={priceLabel} subtitle={subtitle} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    borderWidth: 2,
    padding: spacing.lg,
    minHeight: 44,
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.pink,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    marginBottom: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  copy: {
    flex: 1,
    gap: spacing.xxs,
  },
  priceBlock: {
    alignItems: 'flex-end',
    gap: spacing.xxs,
  },
});
