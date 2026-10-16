import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { Button } from '@/src/components/Button';
import { AppText } from '@/src/components/text/AppText';
import { getCopy } from '@/src/copy';
import { colors, radii, spacing } from '@/src/theme';

export type LockedOverlayProps = {
  locked: boolean;
  children: ReactNode;
  onUnlock: () => void;
  /** Shown under the CTA when locked. */
  hint?: string;
};

export function LockedOverlay({ locked, children, onUnlock, hint }: LockedOverlayProps) {
  if (!locked) {
    return <>{children}</>;
  }

  const copy = getCopy();
  const message = hint ?? copy.paywall.lockedHint;

  return (
    <View style={styles.wrap} accessibilityLabel={copy.paywall.lockedA11y}>
      <View style={styles.content} accessibilityElementsHidden importantForAccessibility="no">
        {children}
      </View>
      <View style={styles.overlay} accessibilityViewIsModal>
        <View style={styles.panel}>
          <AppText variant="bodyStrong" align="center" color={colors.ink}>
            {message}
          </AppText>
          <Button
            label={copy.common.unlockWithPro}
            variant="primary"
            onPress={onUnlock}
            accessibilityLabel={copy.common.unlockWithPro}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'relative',
    overflow: 'hidden',
    borderRadius: radii.lg,
  },
  content: {
    opacity: 0.35,
  },
  overlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: colors.overlay,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  panel: {
    width: '100%',
    maxWidth: 320,
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
});
