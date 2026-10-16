import type { ReactNode } from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from '@/src/components/text/AppText';
import { getCopy } from '@/src/copy';
import { colors, radii, shadows, spacing } from '@/src/theme';

export type SheetProps = {
  visible: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
  /** When false, tapping the dimmed overlay does not dismiss. */
  dismissOnOverlay?: boolean;
  /** Drawn above the sheet (e.g. full-screen confetti). */
  fullscreenOverlay?: ReactNode;
};

export function Sheet({
  visible,
  onClose,
  children,
  title,
  dismissOnOverlay = true,
  fullscreenOverlay,
}: SheetProps) {
  const insets = useSafeAreaInsets();
  const closeLabel = getCopy().common.close;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.root}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={closeLabel}
          style={styles.overlay}
          onPress={dismissOnOverlay ? onClose : undefined}
        />
        <View
          style={[
            styles.sheet,
            shadows.card,
            { paddingBottom: Math.max(insets.bottom, spacing.lg) },
          ]}
          accessibilityViewIsModal
        >
          <View style={styles.handle} />
          {title ? (
            <AppText variant="headline" align="center" color={colors.ink} style={styles.title}>
              {title}
            </AppText>
          ) : null}
          {children}
        </View>
        {fullscreenOverlay}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  overlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: colors.overlay,
  },
  sheet: {
    backgroundColor: colors.cream,
    borderTopLeftRadius: radii.xxl,
    borderTopRightRadius: radii.xxl,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    maxHeight: '88%',
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: radii.pill,
    backgroundColor: colors.hill,
    marginBottom: spacing.md,
  },
  title: {
    marginBottom: spacing.md,
  },
});
