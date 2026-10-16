import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from '@/src/components/text/AppText';
import { DermisSheepSvg } from '@/src/components/mascot/DermisSheepSvg';
import { getCopy } from '@/src/copy';
import { colors, fontFamilies, radii, shadows } from '@/src/theme';

import { QuizStepProgress } from '../components/QuizStepProgress';
import {
  QuizStepFour,
  QuizStepOne,
  QuizStepThree,
  QuizStepTwo,
  quizStepMeta,
} from '../components/QuizStepPanels';
import { useQuizFlow } from '../hooks/useQuizFlow';
import { QUIZ_STEP_COUNT, type QuizDraft } from '../lib/quizLogic';

export function QuizScreen() {
  const { step, draft, patchDraft, canContinue, goBack, goNext } = useQuizFlow();
  const common = getCopy().common;
  const meta = quizStepMeta(step);
  const insets = useSafeAreaInsets();
  const [bubble, setBubble] = useState<string>(meta.intro);

  useEffect(() => {
    setBubble(quizStepMeta(step).intro);
  }, [step]);

  const ctaLabel = step === QUIZ_STEP_COUNT ? common.finish : common.continue;

  return (
    <View style={[styles.root, { paddingTop: Math.max(insets.top, 12) + 10 }]}>
      <StatusBar style="dark" />
      <View style={styles.padX}>
        <QuizStepProgress step={step} answered={canContinue} onBack={goBack} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        bounces={false}
        alwaysBounceVertical={false}
        overScrollMode="never"
      >
        <QuizStepHeader meta={meta} bubble={bubble} onResetBubble={() => setBubble(meta.intro)} />
        <QuizStepBody step={step} draft={draft} onPatch={patchDraft} onReact={setBubble} />
      </ScrollView>

      <QuizFooter
        hint={meta.hint}
        ctaLabel={ctaLabel}
        canContinue={canContinue}
        onNext={goNext}
        insetBottom={insets.bottom}
      />
    </View>
  );
}

type HeaderProps = {
  meta: ReturnType<typeof quizStepMeta>;
  bubble: string;
  onResetBubble: () => void;
};

function QuizStepHeader({ meta, bubble, onResetBubble }: HeaderProps) {
  return (
    <>
      <View style={styles.mascotRow}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={getCopy().mascot.dermis.tapHint}
          onPress={onResetBubble}
          style={styles.sheepHit}
        >
          <DermisSheepSvg size={78} mood="idle" />
        </Pressable>
        <View style={[styles.bubble, shadows.soft]}>
          <AppText style={styles.bubbleText}>{bubble}</AppText>
          <View style={styles.bubbleTail} />
        </View>
      </View>

      <AppText style={styles.eyebrow} color={colors.quizEyebrow}>
        {meta.eyebrow}
      </AppText>
      <AppText style={styles.title} color={colors.ink} accessibilityRole="header">
        {meta.title}
      </AppText>
      <AppText style={styles.sub} color={colors.muteSoft}>
        {meta.sub}
      </AppText>
    </>
  );
}

type FooterProps = {
  hint: string;
  ctaLabel: string;
  canContinue: boolean;
  onNext: () => void;
  insetBottom: number;
};

function QuizFooter({ hint, ctaLabel, canContinue, onNext, insetBottom }: FooterProps) {
  return (
    <View style={[styles.footer, { paddingBottom: Math.max(insetBottom, 12) + 8 }]}>
      <AppText style={styles.hint} color={colors.muteFoot}>
        {hint}
      </AppText>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={ctaLabel}
        accessibilityState={{ disabled: !canContinue }}
        disabled={!canContinue}
        onPress={onNext}
        style={[styles.cta, canContinue ? styles.ctaOn : styles.ctaOff]}
      >
        <AppText style={styles.ctaLabel} color={canContinue ? colors.surface : colors.muteFoot}>
          {ctaLabel}
        </AppText>
        <AppText style={styles.ctaArrow} color={canContinue ? colors.surface : colors.muteFoot}>
          {getCopy().quiz.continueArrow}
        </AppText>
      </Pressable>
    </View>
  );
}

type BodyProps = {
  step: number;
  draft: QuizDraft;
  onPatch: (partial: Partial<QuizDraft>) => void;
  onReact: (text: string) => void;
};

function QuizStepBody({ step, draft, onPatch, onReact }: BodyProps) {
  return (
    <View>
      {step === 1 ? <QuizStepOne draft={draft} onPatch={onPatch} onReact={onReact} /> : null}
      {step === 2 ? <QuizStepTwo draft={draft} onPatch={onPatch} onReact={onReact} /> : null}
      {step === 3 ? <QuizStepThree draft={draft} onPatch={onPatch} /> : null}
      {step === 4 ? <QuizStepFour draft={draft} onPatch={onPatch} onReact={onReact} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.cream,
  },
  padX: {
    paddingHorizontal: 22,
  },
  scroll: {
    flex: 1,
    marginTop: 0,
  },
  scrollContent: {
    paddingHorizontal: 22,
    paddingBottom: 16,
  },
  mascotRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 10,
    marginTop: 22,
  },
  sheepHit: {
    width: 78,
    flexShrink: 0,
  },
  bubble: {
    flex: 1,
    minWidth: 0,
    marginBottom: 34,
    backgroundColor: colors.surface,
    borderRadius: radii.card,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  bubbleText: {
    fontFamily: fontFamilies.bodyBold,
    fontSize: 18,
    lineHeight: 24,
    color: colors.ink,
  },
  bubbleTail: {
    position: 'absolute',
    left: -5,
    bottom: 12,
    width: 12,
    height: 12,
    backgroundColor: colors.surface,
    transform: [{ rotate: '45deg' }],
    borderRadius: 2,
  },
  eyebrow: {
    marginTop: 14,
    marginBottom: 8,
    fontFamily: fontFamilies.bodyExtraBold,
    fontSize: 13,
    lineHeight: 17,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
  },
  title: {
    marginTop: 4,
    fontFamily: fontFamilies.heading,
    fontSize: 32,
    lineHeight: Math.round(32 * 1.1),
    letterSpacing: -0.2,
  },
  sub: {
    marginTop: 6,
    marginBottom: 22,
    fontFamily: fontFamilies.body,
    fontSize: 15,
    lineHeight: 22.5,
  },
  footer: {
    paddingHorizontal: 22,
    paddingTop: 4,
  },
  hint: {
    textAlign: 'center',
    fontFamily: fontFamilies.bodySemiBold,
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 10,
  },
  cta: {
    height: 58,
    borderRadius: radii.pill,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  ctaOn: {
    backgroundColor: colors.ink,
  },
  ctaOff: {
    backgroundColor: colors.quizContinueDisabled,
  },
  ctaLabel: {
    fontFamily: fontFamilies.bodyBold,
    fontSize: 16,
    lineHeight: 20,
  },
  ctaArrow: {
    fontFamily: fontFamilies.bodyBold,
    fontSize: 18,
    lineHeight: 20,
  },
});
