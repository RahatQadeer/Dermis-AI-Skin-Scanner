import { Pressable, StyleSheet, View } from 'react-native';
import Animated from 'react-native-reanimated';

import { spacing } from '@/src/theme';

import { MascotBubble } from './MascotBubble';
import { MascotFigure } from './MascotFigure';
import { withMascotDefaults, type MascotProps } from './mascotProps';
import { useMascotController } from './useMascotController';

export type { MascotProps } from './mascotProps';

export function Mascot(props: MascotProps) {
  const resolved = withMascotDefaults(props);
  const { character, mood, size, bubbleOverlay, compactBubble } = resolved;
  const { message, motionStyle, overlay, onPress, a11y, bubbleVisible } =
    useMascotController(resolved);

  return (
    <View
      ref={overlay.hostRef}
      onLayout={overlay.onLayout}
      collapsable={false}
      style={[styles.wrap, bubbleOverlay ? styles.wrapOverlay : null]}
    >
      <MascotBubble
        show={bubbleVisible}
        message={message}
        character={character}
        compact={compactBubble || bubbleOverlay}
        overlay={bubbleOverlay}
        alignEnd={overlay.alignEnd}
        maxWidth={overlay.maxWidth}
      />
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={a11y}
        accessibilityHint={message}
        onPress={onPress}
        style={styles.hit}
      >
        <Animated.View style={motionStyle}>
          <MascotFigure character={character} mood={mood} size={size} />
        </Animated.View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  wrapOverlay: {
    position: 'relative',
    overflow: 'visible',
    gap: 0,
    zIndex: 20,
  },
  hit: {
    minWidth: 44,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
