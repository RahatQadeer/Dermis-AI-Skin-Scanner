import type { PasswordCheck, PasswordStrengthLabel } from '@dermis/domain';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/src/components/text/AppText';
import { getCopy } from '@/src/copy';
import { colors, radii, spacing } from '@/src/theme';

const BAR_COUNT = 4;

export type PasswordStrengthMeterProps = {
  score: 0 | 1 | 2 | 3 | 4;
  label: PasswordStrengthLabel;
  checks: PasswordCheck;
};

export function PasswordStrengthMeter({ score, label, checks }: PasswordStrengthMeterProps) {
  const c = getCopy().inputs;
  const labelText =
    label === 'weak'
      ? c.strengthWeak
      : label === 'fair'
        ? c.strengthFair
        : label === 'good'
          ? c.strengthGood
          : c.strengthStrong;

  return (
    <View style={styles.wrap} accessibilityRole="summary">
      <View style={styles.bars}>
        {Array.from({ length: BAR_COUNT }, (_, index) => (
          <View
            key={index}
            style={[
              styles.bar,
              {
                backgroundColor: index < score ? barColor(score) : colors.border,
              },
            ]}
          />
        ))}
      </View>
      <AppText variant="caption" color={colors.mute}>
        {labelText}
      </AppText>
      <View style={styles.checks}>
        <CheckLine ok={checks.minLength} text={c.checkLength} />
        <CheckLine ok={checks.upper} text={c.checkUpper} />
        <CheckLine ok={checks.lower} text={c.checkLower} />
        <CheckLine ok={checks.number} text={c.checkNumber} />
        <CheckLine ok={checks.symbol} text={c.checkSymbol} optional />
      </View>
    </View>
  );
}

function CheckLine({
  ok,
  text,
  optional = false,
}: {
  ok: boolean;
  text: string;
  optional?: boolean;
}) {
  const color = ok ? colors.green : optional ? colors.inkMuted : colors.mute;
  return (
    <AppText variant="caption" color={color}>
      {ok ? `✓ ${text}` : `○ ${text}`}
    </AppText>
  );
}

function barColor(score: number): string {
  if (score <= 1) return colors.red;
  if (score === 2) return colors.amber;
  if (score === 3) return colors.sky;
  return colors.green;
}

const styles = StyleSheet.create({
  wrap: {
    gap: spacing.xs,
  },
  bars: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  bar: {
    flex: 1,
    height: spacing.xs,
    borderRadius: radii.sm,
  },
  checks: {
    gap: spacing.xxs,
  },
});
