import { StyleSheet, View } from 'react-native';

import { SpeechBubble } from '@/src/components/SpeechBubble';
import { spacing } from '@/src/theme';

import type { MascotCharacter } from './mascotTypes';

type MascotBubbleProps = {
  show: boolean;
  message: string;
  character: MascotCharacter;
  compact: boolean;
  overlay: boolean;
  alignEnd: boolean;
  maxWidth: number;
};

export function MascotBubble(props: MascotBubbleProps) {
  if (!props.show) {
    return null;
  }
  const bubble = (
    <SpeechBubble
      message={props.message}
      tail={props.character === 'dermis' ? 'left' : 'right'}
      compact={props.compact}
      style={{ maxWidth: props.maxWidth, width: props.overlay ? props.maxWidth : undefined }}
    />
  );
  if (!props.overlay) {
    return bubble;
  }
  return (
    <View
      pointerEvents="none"
      style={[
        styles.overlayBubble,
        props.alignEnd ? styles.overlayEnd : styles.overlayStart,
        { maxWidth: props.maxWidth, width: props.maxWidth },
      ]}
    >
      {bubble}
    </View>
  );
}

const styles = StyleSheet.create({
  overlayBubble: {
    position: 'absolute',
    bottom: '100%',
    marginBottom: spacing.xxs,
    zIndex: 30,
    elevation: 30,
  },
  /** Sheep on the right → tip grows left so it stays on-screen. */
  overlayEnd: {
    right: 0,
  },
  /** Sheep on the left → tip grows right. */
  overlayStart: {
    left: 0,
  },
});
