import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { Button } from '@/src/components/Button';
import { getCopy } from '@/src/copy';
import { spacing } from '@/src/theme';
import type { Plan } from '@dermis/domain/server';

export type ProfileAccountSectionProps = {
  plan: Plan;
};

/** Upgrade / restore actions (store compliance); account data lives in the Data section. */
export function ProfileAccountSection({ plan }: ProfileAccountSectionProps) {
  const router = useRouter();
  const p = getCopy().screens.profile;
  const common = getCopy().common;

  return (
    <View style={styles.block}>
      {plan === 'free' ? (
        <Button label={p.upgrade} onPress={() => router.push('/paywall')} />
      ) : null}
      <Button
        label={common.restorePurchases}
        variant="outline"
        onPress={() => router.push('/paywall')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  block: {
    gap: spacing.md,
  },
});
