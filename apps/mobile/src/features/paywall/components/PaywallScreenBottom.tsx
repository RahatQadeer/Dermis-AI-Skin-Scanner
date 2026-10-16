import { StyleSheet, View } from 'react-native';

import { Button } from '@/src/components/Button';
import { ToastHost } from '@/src/components/layout/ToastHost';
import { AppText } from '@/src/components/text/AppText';
import { getCopy } from '@/src/copy';
import { spacing } from '@/src/theme';

import { PaywallBillingSummary } from './PaywallBillingSummary';
import { PaywallLegalFooter } from './PaywallLegalFooter';
import { PaywallPlanPicker } from './PaywallPlanPicker';
import { paywallDark } from '../paywallDark';
import type { usePaywallSelection } from '../hooks/usePaywallSelection';

type PaywallFlow = ReturnType<typeof usePaywallSelection>;

export function PaywallScreenBottom({ flow }: { flow: PaywallFlow }) {
  const p = getCopy().paywall;
  const cta = flow.plan === 'annual' ? p.startTrialCta : p.subscribeMonthlyCta;

  return (
    <>
      <PaywallPlanPicker
        plan={flow.plan}
        onSelect={flow.setPlan}
        badgeLabel={flow.badgeLabel}
        annualPriceLabel={flow.annualPriceLabel}
        monthlyPriceLabel={flow.monthlyPriceLabel}
      />
      <PaywallBillingSummary
        plan={flow.plan}
        annualPriceLabel={flow.annualPriceLabel}
        monthlyPriceLabel={flow.monthlyPriceLabel}
      />
      <View style={styles.bottomBlock}>
        <AppText variant="caption" color={paywallDark.textMuted} align="center" style={styles.charge}>
          {p.chargeToAccount}
        </AppText>
        <PaywallLegalFooter onLegalUnavailable={() => flow.showToast(p.legalUnavailableToast)} />
        <View style={styles.actions}>
          <Button label={cta} size="lg" onPress={() => void flow.purchase()} disabled={flow.busy} />
          <Button
            label={p.restore}
            variant="outline"
            size="lg"
            onPress={() => void flow.restore()}
            disabled={flow.busy}
          />
        </View>
      </View>
      <ToastHost
        message={flow.toastMessage}
        visible={flow.toastVisible}
        onDismiss={flow.dismissToast}
      />
    </>
  );
}

const styles = StyleSheet.create({
  bottomBlock: {
    marginTop: spacing.sm,
    gap: spacing.sm,
  },
  charge: {
    paddingHorizontal: spacing.sm,
    lineHeight: 18,
  },
  actions: {
    gap: spacing.sm,
  },
});
