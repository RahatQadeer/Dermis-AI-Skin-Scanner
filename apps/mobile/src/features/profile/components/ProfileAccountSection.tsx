import { isFeaturesUnlocked } from '@dermis/domain';
import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { Button } from '@/src/components/Button';
import { getCopy } from '@/src/copy';
import { spacing } from '@/src/theme';
import type { Plan } from '@dermis/domain/server';
import { useState } from 'react';

import { runPaywallRestore } from '@/src/features/paywall/hooks/paywallCheckoutActions';
import { isNativePurchasesEnabled } from '@/src/features/purchases/config';
import { useQuotaRefresh } from '@/src/features/quota/QuotaRefreshContext';

export type ProfileAccountSectionProps = {
  plan: Plan;
  showToast: (message: string) => void;
};

/** Upgrade / restore actions (store compliance); account data lives in the Data section. */
export function ProfileAccountSection({ plan, showToast }: ProfileAccountSectionProps) {
  const router = useRouter();
  const p = getCopy().screens.profile;
  const common = getCopy().common;
  const { bumpQuotaRefresh } = useQuotaRefresh();
  const [restoring, setRestoring] = useState(false);
  const billingHidden = isFeaturesUnlocked();

  // Restores in place (store requirement) instead of bouncing to the paywall.
  const restore = async () => {
    const pw = getCopy().paywall;
    setRestoring(true);
    const outcome = await runPaywallRestore(isNativePurchasesEnabled());
    setRestoring(false);
    if (outcome === 'restored') {
      bumpQuotaRefresh();
    }
    showToast(
      {
        restored: pw.restoreSuccess,
        none: pw.restoreEmpty,
        billing_off: pw.billingUnavailable,
        error: pw.restoreError,
      }[outcome],
    );
  };

  if (billingHidden) {
    return null;
  }

  return (
    <View style={styles.block}>
      {plan === 'free' ? (
        <Button label={p.upgrade} onPress={() => router.push('/paywall')} />
      ) : null}
      <Button
        label={common.restorePurchases}
        variant="outline"
        loading={restoring}
        onPress={() => void restore()}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  block: {
    gap: spacing.md,
  },
});
