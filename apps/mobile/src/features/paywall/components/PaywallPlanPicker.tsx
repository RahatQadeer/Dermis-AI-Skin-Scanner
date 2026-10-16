import { StyleSheet, View } from 'react-native';

import { PlanCard, type PlanKind } from '@/src/components/PlanCard';
import { AppText } from '@/src/components/text/AppText';
import { getCopy } from '@/src/copy';
import { spacing } from '@/src/theme';

import { paywallDark } from '../paywallDark';

export type PaywallPlanPickerProps = {
  plan: PlanKind;
  onSelect: (plan: PlanKind) => void;
  badgeLabel?: string;
  annualPriceLabel: string;
  monthlyPriceLabel: string;
};

export function PaywallPlanPicker({
  plan,
  onSelect,
  badgeLabel,
  annualPriceLabel,
  monthlyPriceLabel,
}: PaywallPlanPickerProps) {
  const p = getCopy().paywall;

  return (
    <View style={styles.block}>
      <PlanCard
        kind="annual"
        priceLabel={annualPriceLabel}
        selected={plan === 'annual'}
        onSelect={() => onSelect('annual')}
        badgeLabel={badgeLabel}
        subtitle={p.trialNote}
      />
      <PlanCard
        kind="monthly"
        priceLabel={monthlyPriceLabel}
        selected={plan === 'monthly'}
        onSelect={() => onSelect('monthly')}
      />
      <AppText variant="caption" color={paywallDark.textMuted}>
        {p.trialTimeline}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  block: {
    gap: spacing.sm,
  },
});
