import { StyleSheet, View } from 'react-native';

import { AppText } from '@/src/components/text/AppText';
import { getCopy } from '@/src/copy';
import type { PlanKind } from '@/src/components/PlanCard';
import { spacing } from '@/src/theme';

import { paywallDark } from '../paywallDark';

export type PaywallBillingSummaryProps = {
  plan: PlanKind;
  annualPriceLabel: string;
  monthlyPriceLabel: string;
};

/** Selected-plan length + price summary (store subscription disclosure). */
export function PaywallBillingSummary({
  plan,
  annualPriceLabel,
  monthlyPriceLabel,
}: PaywallBillingSummaryProps) {
  const p = getCopy().paywall;
  const summary =
    plan === 'annual'
      ? p.billingSummaryAnnual(annualPriceLabel)
      : p.billingSummaryMonthly(monthlyPriceLabel);

  return (
    <View style={styles.wrap}>
      <AppText variant="caption" color={paywallDark.textMuted} align="center">
        {summary}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: spacing.xs,
  },
});
