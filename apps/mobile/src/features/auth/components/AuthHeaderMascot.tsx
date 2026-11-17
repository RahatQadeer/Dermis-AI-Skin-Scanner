import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Mascot } from '@/src/components/mascot/Mascot';
import { SpeechBubble } from '@/src/components/SpeechBubble';
import { getCopy } from '@/src/copy';
import { spacing } from '@/src/theme';

import { lineForAuthTone, moodForAuthTone, type AuthMascotTone } from './AuthMascot';

export type AuthHeaderMascotProps = {
  tone: AuthMascotTone;
  /** Idle speech-bubble line for this screen. */
  bubble: string;
};

/** Sheep on the left with a speech bubble beside it (auth header). */
export function AuthHeaderMascot({ tone, bubble }: AuthHeaderMascotProps) {
  const tips = getCopy().mascot.dermis.tipLines;
  const [tipIndex, setTipIndex] = useState(0);
  const [tapped, setTapped] = useState(false);
  const idleMessage =
    tone === 'idle' && tapped ? (tips[tipIndex % tips.length] ?? bubble) : lineForAuthTone(tone, bubble);

  return (
    <View style={styles.row}>
      <Mascot
        mood={moodForAuthTone(tone)}
        size={64}
        showBubble={false}
        revealOnTap
        lines={tips}
        lineIndex={tipIndex}
        onLineChange={(next) => {
          setTapped(true);
          setTipIndex(next);
        }}
      />
      <View style={styles.bubble}>
        <SpeechBubble message={idleMessage} tail="left" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  bubble: {
    flex: 1,
  },
});
