import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from '@/src/components/text/AppText';
import { getCopy } from '@/src/copy';
import { colors, fontFamilies, scaleHeight, useResponsive } from '@/src/theme';

import { SummaryAnswerTable } from '../components/SummaryAnswerTable';
import { SummaryConfetti } from '../components/SummaryConfetti';
import { SummaryFooter } from '../components/SummaryFooter';
import { SummaryHero } from '../components/SummaryHero';
import { SummaryHill } from '../components/SummaryHill';
import { useFinishOnboarding } from '../hooks/useFinishOnboarding';
import { isQuizDraftComplete, sensitivityKeyFromReaction } from '../lib/quizLogic';
import { useQuizDraft } from '../state/QuizDraftProvider';

export function ProfileSummaryScreen() {
  const router = useRouter();
  const { draft } = useQuizDraft();
  const { finish, errorMessage, saving } = useFinishOnboarding(draft);

  useEffect(() => {
    if (!isQuizDraftComplete(draft)) {
      router.replace('/quiz');
    }
  }, [draft, router]);

  if (!isQuizDraftComplete(draft)) {
    return null;
  }

  return (
    <SummaryLayout
      draft={draft}
      errorMessage={errorMessage}
      onFinish={() => {
        if (!saving) void finish();
      }}
    />
  );
}

function SummaryLayout({
  draft,
  errorMessage,
  onFinish,
}: {
  draft: ReturnType<typeof useQuizDraft>['draft'];
  errorMessage: string | null;
  onFinish: () => void;
}) {
  const insets = useSafeAreaInsets();
  const summary = getCopy().screens.summary;
  const quiz = getCopy().quiz;
  const sensitivityKey = sensitivityKeyFromReaction(draft.productReaction, quiz.q4.options);
  const sensitivityNote = sensitivityKey ? summary.sensitivityNotes[sensitivityKey] : '';
  const { height } = useResponsive();
  const bandHeight = scaleHeight(330, height, 0.5);

  return (
    <View style={styles.root}>
      <StatusBar style="dark" />
      <View style={[styles.mintBand, { height: bandHeight }]} pointerEvents="none" />
      <SummaryHill />
      <SummaryConfetti />
      <ScrollView
        contentContainerStyle={[styles.content, { paddingTop: Math.max(insets.top, 12) + 18 }]}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        <SummaryHero />
        <SummaryAnswerTable draft={draft} />
        {sensitivityNote ? (
          <View style={styles.note}>
            <AppText style={styles.noteText} color={colors.ink}>
              {sensitivityNote}
            </AppText>
          </View>
        ) : null}
        {errorMessage ? (
          <AppText style={styles.errorText} color={colors.red}>
            {errorMessage}
          </AppText>
        ) : null}
        <View style={styles.spacer} />
        <SummaryFooter bottomInset={insets.bottom} onScan={onFinish} onSkip={onFinish} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.cream,
    overflow: 'hidden',
  },
  mintBand: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    backgroundColor: colors.hero,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    zIndex: 0,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: 24,
    zIndex: 2,
  },
  note: {
    marginTop: 0,
    backgroundColor: colors.noteSoft,
    borderRadius: 20,
    paddingTop: 18,
    paddingBottom: 14,
    paddingHorizontal: 16,
  },
  noteText: {
    fontFamily: fontFamilies.bodySemiBold,
    fontSize: 16,
    lineHeight: 24,
  },
  spacer: {
    flex: 1,
    minHeight: 16,
  },
  errorText: {
    marginTop: 12,
    fontFamily: fontFamilies.bodySemiBold,
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
});
