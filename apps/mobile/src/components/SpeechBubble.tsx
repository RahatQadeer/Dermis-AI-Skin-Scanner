import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/src/components/text/AppText';
import { colors, radii, shadows, spacing } from '@/src/theme';

export type SpeechBubbleProps = {
  message: string;
  /** Tail points toward the speaker (left/right). */
  tail?: 'left' | 'right';
  footer?: ReactNode;
  /** Tighter padding + caption type (Welcome hero). */
  compact?: boolean;
};

export function SpeechBubble({
  message,
  tail = 'left',
  footer,
  compact = false,
}: SpeechBubbleProps) {
  return (
    <View style={[styles.wrap, compact ? styles.wrapCompact : null]}>
      <View
        style={[styles.bubble, compact ? styles.bubbleCompact : null, shadows.soft]}
        accessibilityRole="text"
        accessibilityLabel={message}
      >
        <AppText variant={compact ? 'caption' : 'body'} color={colors.ink}>
          {message}
        </AppText>
        {footer}
      </View>
      <View style={[styles.tail, tail === 'left' ? styles.tailLeft : styles.tailRight]} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    maxWidth: '92%',
  },
  wrapCompact: {
    maxWidth: 168,
  },
  bubble: {
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  bubbleCompact: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.card,
  },
  tail: {
    width: 0,
    height: 0,
    borderStyle: 'solid',
    borderTopWidth: 10,
    borderTopColor: colors.surface,
    borderLeftWidth: 8,
    borderLeftColor: 'transparent',
    borderRightWidth: 8,
    borderRightColor: 'transparent',
    marginTop: -1,
  },
  tailLeft: {
    marginLeft: spacing.xl,
    alignSelf: 'flex-start',
  },
  tailRight: {
    marginRight: spacing.xl,
    alignSelf: 'flex-end',
  },
});
