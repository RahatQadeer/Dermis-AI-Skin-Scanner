import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { AppText } from '@/src/components/text/AppText';
import { getCopy } from '@/src/copy';
import { colors, radii, spacing, textStyles } from '@/src/theme';

import { MAX_TURN_CHARS } from '../lib/chatHistory';

type Props = {
  draft: string;
  onDraft: (text: string) => void;
  onSend: () => void;
  sending: boolean;
  hasPhoto: boolean;
  onAddPhoto: () => void;
  onRemovePhoto: () => void;
};

export function AssistantComposer(props: Props) {
  const a = getCopy().screens.assistant;
  const canSend = props.draft.trim().length > 0 && !props.sending;
  return (
    <View style={styles.wrap}>
      {props.hasPhoto ? <PhotoRow onRemove={props.onRemovePhoto} /> : null}
      <View style={styles.row}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={a.addPhoto}
          onPress={props.onAddPhoto}
          disabled={props.sending}
          style={styles.iconBtn}
        >
          <AppText variant="headline">📷</AppText>
        </Pressable>
        <TextInput
          value={props.draft}
          onChangeText={props.onDraft}
          placeholder={a.inputPlaceholder}
          placeholderTextColor={colors.inkMuted}
          multiline
          maxLength={MAX_TURN_CHARS}
          accessibilityLabel={a.inputPlaceholder}
          style={[textStyles.body, styles.input]}
        />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={a.send}
          accessibilityState={{ disabled: !canSend }}
          onPress={props.onSend}
          disabled={!canSend}
          style={[styles.send, !canSend && styles.sendDisabled]}
        >
          <AppText variant="bodyStrong" color={colors.surface}>
            ↑
          </AppText>
        </Pressable>
      </View>
    </View>
  );
}

function PhotoRow({ onRemove }: { onRemove: () => void }) {
  const a = getCopy().screens.assistant;
  return (
    <View style={styles.photoRow}>
      <AppText variant="caption" color={colors.muteBody} style={styles.flex}>
        {a.photoAttached}
      </AppText>
      <Pressable accessibilityRole="button" onPress={onRemove} hitSlop={spacing.sm}>
        <AppText variant="caption" color={colors.pink}>
          {a.removePhoto}
        </AppText>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.xs, paddingTop: spacing.sm },
  photoRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  flex: { flex: 1 },
  row: { flexDirection: 'row', alignItems: 'flex-end', gap: spacing.sm },
  iconBtn: { padding: spacing.sm },
  input: {
    flex: 1,
    maxHeight: 120,
    minHeight: 44,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.xl,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    color: colors.ink,
  },
  send: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendDisabled: { opacity: 0.4 },
});
