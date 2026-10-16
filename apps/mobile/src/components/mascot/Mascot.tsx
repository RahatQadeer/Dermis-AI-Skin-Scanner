import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated from 'react-native-reanimated';

import { SpeechBubble } from '@/src/components/SpeechBubble';
import { getCopy } from '@/src/copy';
import { spacing } from '@/src/theme';

import { MascotFigure } from './MascotFigure';
import {
  defaultMotionForMood,
  type MascotCharacter,
  type MascotMood,
  type MascotMotionKind,
} from './mascotTypes';
import { useMascotMotion } from './useMascotMotion';

export type MascotProps = {
  character?: MascotCharacter;
  mood?: MascotMood;
  /** Lines to cycle on tap. Defaults to Dermis welcome lines. */
  lines?: readonly string[];
  lineIndex?: number;
  onLineChange?: (index: number) => void;
  showBubble?: boolean;
  size?: number;
  /** Smaller speech bubble (Welcome hero). */
  compactBubble?: boolean;
  motionKind?: MascotMotionKind;
  accessibilityLabel?: string;
};

function resolveLines(lines: readonly string[] | undefined): readonly string[] {
  if (lines && lines.length > 0) {
    return lines;
  }
  return getCopy().mascot.dermis.welcomeLines;
}

function resolveA11yLabel(
  character: MascotCharacter,
  accessibilityLabel: string | undefined,
): string {
  if (accessibilityLabel) {
    return accessibilityLabel;
  }
  const copy = getCopy();
  return character === 'dermis'
    ? copy.mascot.dermis.tapHint
    : copy.mascot.placeholders.professorTapHint;
}

function useLineIndex(
  lineIndex: number | undefined,
  onLineChange: ((index: number) => void) | undefined,
  lineCount: number,
) {
  const [internalIndex, setInternalIndex] = useState(0);
  const index = lineIndex ?? internalIndex;

  const advance = () => {
    const next = (index + 1) % lineCount;
    if (lineIndex === undefined) {
      setInternalIndex(next);
    }
    onLineChange?.(next);
  };

  return { index, advance };
}

function MascotBubble(props: {
  show: boolean;
  message: string;
  character: MascotCharacter;
  compact: boolean;
}) {
  if (!props.show) {
    return null;
  }
  return (
    <SpeechBubble
      message={props.message}
      tail={props.character === 'dermis' ? 'left' : 'right'}
      compact={props.compact}
    />
  );
}

export function Mascot({
  character = 'dermis',
  mood = 'idle',
  lines,
  lineIndex,
  onLineChange,
  showBubble = true,
  size = 112,
  compactBubble = false,
  motionKind,
  accessibilityLabel,
}: MascotProps) {
  const resolvedLines = resolveLines(lines);
  const { index, advance } = useLineIndex(lineIndex, onLineChange, resolvedLines.length);
  const message = resolvedLines[index % resolvedLines.length] ?? '';
  const kind = motionKind ?? defaultMotionForMood(mood);
  const { style } = useMascotMotion(kind);
  const a11y = resolveA11yLabel(character, accessibilityLabel);

  return (
    <View style={styles.wrap}>
      <MascotBubble
        show={Boolean(showBubble && message)}
        message={message}
        character={character}
        compact={compactBubble}
      />
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={a11y}
        accessibilityHint={message}
        onPress={advance}
        style={styles.hit}
      >
        <Animated.View style={style}>
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
  hit: {
    minWidth: 44,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
