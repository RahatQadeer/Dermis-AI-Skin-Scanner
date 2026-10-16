import { StyleSheet, View } from 'react-native';

import { Mascot } from '@/src/components/mascot/Mascot';
import { SpeechBubble } from '@/src/components/SpeechBubble';
import { spacing } from '@/src/theme';

import { lineForAuthTone, moodForAuthTone, type AuthMascotTone } from './AuthMascot';

export type AuthHeaderMascotProps = {
  tone: AuthMascotTone;
  /** Idle speech-bubble line for this screen. */
  bubble: string;
};

/** Sheep on the left with a speech bubble beside it (auth header). */
export function AuthHeaderMascot({ tone, bubble }: AuthHeaderMascotProps) {
  return (
    <View style={styles.row}>
      <Mascot mood={moodForAuthTone(tone)} size={64} showBubble={false} />
      <View style={styles.bubble}>
        <SpeechBubble message={lineForAuthTone(tone, bubble)} tail="left" />
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
