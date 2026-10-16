import { StyleSheet } from 'react-native';

import { AppText } from '@/src/components/text/AppText';
import { getCopy } from '@/src/copy';
import { colors, spacing } from '@/src/theme';

export type HealthDisclaimerProps = {
  /** Shorter line for tight layouts (device + estimates only). */
  compact?: boolean;
};

/** PRODUCT.md required health / wellness disclaimers. */
export function HealthDisclaimer({ compact = false }: HealthDisclaimerProps) {
  const c = getCopy().compliance;
  const text = compact ? `${c.notMedicalDevice} ${c.estimatesOnly}` : c.healthDeclaration;

  return (
    <AppText
      variant="caption"
      color={colors.mute}
      align="center"
      style={styles.text}
      accessibilityRole="text"
    >
      {text}
    </AppText>
  );
}

const styles = StyleSheet.create({
  text: {
    marginTop: spacing.sm,
  },
});
