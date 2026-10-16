import { StyleSheet, View } from 'react-native';

import { Button } from '@/src/components/Button';
import { Sheet } from '@/src/components/layout/Sheet';
import { AppText } from '@/src/components/text/AppText';
import { getCopy } from '@/src/copy';
import { colors, spacing } from '@/src/theme';

export type DeleteAccountSheetProps = {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

export function DeleteAccountSheet({ visible, onClose, onConfirm }: DeleteAccountSheetProps) {
  const p = getCopy().screens.profile;
  const common = getCopy().common;

  return (
    <Sheet visible={visible} onClose={onClose} title={p.deleteSheetTitle}>
      <View style={styles.body}>
        <AppText variant="body" color={colors.mute}>
          {p.deleteSheetBody}
        </AppText>
        <Button label={p.deleteConfirm} variant="danger" onPress={onConfirm} />
        <Button label={common.cancel} variant="ghost" onPress={onClose} />
      </View>
    </Sheet>
  );
}

const styles = StyleSheet.create({
  body: {
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },
});
