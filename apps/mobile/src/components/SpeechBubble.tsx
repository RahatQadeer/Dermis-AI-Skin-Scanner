import type { ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { AppText } from '@/src/components/text/AppText';
import { colors, fontFamilies, radii, shadows, spacing } from '@/src/theme';

export type SpeechBubbleProps = {
  message: string;
  /** Tail points toward the speaker (left/right). */
  tail?: 'left' | 'right';
  footer?: ReactNode;
  /** Slim tip bubble — tight padding, caption type (mascot taps / Welcome). */
  compact?: boolean;
  /** Optional outer width clamp (responsive overlays). */
  style?: StyleProp<ViewStyle>;
};

function tailStyles(tail: 'left' | 'right', compact: boolean): StyleProp<ViewStyle> {
  const side = tail === 'left' ? styles.tailLeft : styles.tailRight;
  if (!compact) {
    return [styles.tail, side];
  }
  const compactSide = tail === 'left' ? styles.tailLeftCompact : styles.tailRightCompact;
  return [styles.tail, styles.tailCompact, side, compactSide];
}

export function SpeechBubble({
  message,
  tail = 'left',
  footer,
  compact = false,
  style,
}: SpeechBubbleProps) {
  return (
    <View style={[styles.wrap, compact ? styles.wrapCompact : null, style]}>
      <View
        style={[styles.bubble, compact ? styles.bubbleCompact : shadows.soft]}
        accessibilityRole="text"
        accessibilityLabel={message}
      >
        <AppText
          variant={compact ? 'caption' : 'body'}
          color={colors.ink}
          style={compact ? styles.compactText : undefined}
        >
          {message}
        </AppText>
        {footer}
      </View>
      <View style={tailStyles(tail, compact)} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    maxWidth: '100%',
    alignSelf: 'stretch',
  },
  wrapCompact: {
    maxWidth: '100%',
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
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radii.md,
    borderWidth: StyleSheet.hairlineWidth,
  },
  compactText: {
    fontFamily: fontFamilies.bodySemiBold,
    fontSize: 12,
    lineHeight: 16,
    flexShrink: 1,
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
  tailCompact: {
    borderTopWidth: 6,
    borderLeftWidth: 5,
    borderRightWidth: 5,
  },
  tailLeft: {
    marginLeft: spacing.xl,
    alignSelf: 'flex-start',
  },
  tailRight: {
    marginRight: spacing.xl,
    alignSelf: 'flex-end',
  },
  tailLeftCompact: {
    marginLeft: spacing.md,
  },
  tailRightCompact: {
    marginRight: spacing.md,
  },
});
