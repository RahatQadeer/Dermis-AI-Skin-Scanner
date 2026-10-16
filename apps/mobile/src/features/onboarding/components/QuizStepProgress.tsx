import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/src/components/text/AppText';
import { getCopy } from '@/src/copy';
import { colors, fontFamilies, radii } from '@/src/theme';

import { QUIZ_STEP_COUNT } from '../lib/quizLogic';

import { QuizSheepHeadMark } from './QuizSheepHeadMark';

export type QuizStepProgressProps = {
  step: number;
  /** When true, fill advances to the end of this step (prototype answered). */
  answered: boolean;
  onBack: () => void;
  total?: number;
};

/**
 * Prototype quiz chrome: circular ‹ back, pink fill bar + sheep head, `1/4`.
 * Fill: `(step - 1 + (answered ? 1 : 0.5)) / total`.
 */
export function QuizStepProgress({
  step,
  answered,
  onBack,
  total = QUIZ_STEP_COUNT,
}: QuizStepProgressProps) {
  const quiz = getCopy().quiz;
  const a11y = quiz.stepProgressA11y(step, total);
  const fillRatio = (step - 1 + (answered ? 1 : 0.5)) / total;
  const fillPct = Math.round(fillRatio * 100);
  const fillWidth = `${fillPct}%` as `${number}%`;

  return (
    <View style={styles.row}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={quiz.backA11y}
        onPress={onBack}
        style={({ pressed }) => [styles.back, pressed ? styles.backPressed : null]}
      >
        <AppText style={styles.backGlyph} color={colors.ink}>
          ‹
        </AppText>
      </Pressable>

      <View style={styles.track} accessibilityRole="progressbar" accessibilityLabel={a11y}>
        <View style={[styles.fill, { width: fillWidth }]} />
        <View style={[styles.sheepWrap, { left: fillWidth }]}>
          <QuizSheepHeadMark size={30} />
        </View>
      </View>

      <AppText style={styles.stepLabel} color={colors.muteSoft}>
        {quiz.stepLabel(step, total)}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  back: {
    width: 42,
    height: 42,
    borderRadius: radii.pill,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  backPressed: {
    opacity: 0.85,
  },
  backGlyph: {
    fontFamily: fontFamilies.bodyBold,
    fontSize: 18,
    lineHeight: 20,
    marginTop: -2,
  },
  track: {
    flex: 1,
    height: 10,
    borderRadius: radii.pill,
    backgroundColor: colors.quizTrack,
    position: 'relative',
    justifyContent: 'center',
  },
  fill: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    borderRadius: radii.pill,
    backgroundColor: colors.pinkBright,
  },
  sheepWrap: {
    position: 'absolute',
    top: '50%',
    transform: [{ translateX: -15 }, { translateY: -14 }],
  },
  stepLabel: {
    width: 34,
    textAlign: 'right',
    fontFamily: fontFamilies.heading,
    fontSize: 13,
    lineHeight: 16,
    flexShrink: 0,
  },
});
