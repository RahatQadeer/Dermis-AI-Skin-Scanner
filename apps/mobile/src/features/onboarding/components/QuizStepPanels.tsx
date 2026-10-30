import type { AgeBand, ConcernId } from '@dermis/domain';
import { StyleSheet, View } from 'react-native';

import { getCopy } from '@/src/copy';
import { colors } from '@/src/theme';

import type { QuizDraft } from '../lib/quizLogic';
import { toggleQuizPriority } from '../lib/quizLogic';

import { QuizOptionRow } from './QuizOptionRow';

type StepProps = {
  draft: QuizDraft;
  onPatch: (partial: Partial<QuizDraft>) => void;
  onReact?: (text: string) => void;
};

export function QuizStepOne({ draft, onPatch, onReact }: StepProps) {
  const q = getCopy().quiz.q1;
  return (
    <View style={styles.list}>
      {q.options.map((option) => (
        <QuizOptionRow
          key={option.label}
          title={option.label}
          subtitle={option.sub}
          selected={draft.skinFeel === option.label}
          onPress={() => {
            onPatch({ skinFeel: option.label });
            onReact?.(option.reaction);
          }}
        />
      ))}
    </View>
  );
}

export function QuizStepTwo({ draft, onPatch, onReact }: StepProps) {
  const q = getCopy().quiz.q2;
  return (
    <View style={styles.list}>
      {q.options.map((option) => (
        <QuizOptionRow
          key={option.label}
          title={option.label}
          subtitle={option.sub}
          selected={draft.fitzpatrick === option.label}
          leading={
            <View style={styles.swatchRing}>
              <View style={[styles.swatchFill, { backgroundColor: option.swatch }]} />
            </View>
          }
          onPress={() => {
            onPatch({ fitzpatrick: option.label });
            onReact?.(option.reaction);
          }}
        />
      ))}
    </View>
  );
}

export function QuizStepThree({ draft, onPatch }: StepProps) {
  const q = getCopy().quiz.q3;
  const atMax = draft.priorities.length >= 3;

  const toggle = (id: ConcernId) => {
    onPatch({ priorities: toggleQuizPriority(draft.priorities, id) });
  };

  return (
    <View style={styles.list}>
      {q.options.map((option) => {
        const selected = draft.priorities.includes(option.id);
        return (
          <QuizOptionRow
            key={option.id}
            title={option.label}
            subtitle={option.sub}
            selected={selected}
            disabled={!selected && atMax}
            onPress={() => toggle(option.id)}
          />
        );
      })}
    </View>
  );
}

export function QuizStepFour({ draft, onPatch, onReact }: StepProps) {
  const q = getCopy().quiz.q4;
  return (
    <View style={styles.list}>
      {q.options.map((option) => (
        <QuizOptionRow
          key={option.label}
          title={option.label}
          subtitle={option.sub}
          selected={draft.productReaction === option.label}
          onPress={() => {
            onPatch({ productReaction: option.label });
            onReact?.(option.reaction);
          }}
        />
      ))}
    </View>
  );
}

export function QuizStepFive({ draft, onPatch, onReact }: StepProps) {
  const q = getCopy().quiz.q5;
  return (
    <View style={styles.list}>
      {q.options.map((option) => (
        <QuizOptionRow
          key={option.id}
          title={option.label}
          subtitle={option.sub}
          selected={draft.ageBand === option.id}
          onPress={() => {
            onPatch({ ageBand: option.id as AgeBand });
            onReact?.(option.reaction);
          }}
        />
      ))}
    </View>
  );
}

export function quizStepMeta(step: number) {
  const quiz = getCopy().quiz;
  switch (step) {
    case 1:
      return quiz.q1;
    case 2:
      return quiz.q2;
    case 3:
      return quiz.q3;
    case 4:
      return quiz.q4;
    case 5:
      return quiz.q5;
    default:
      return quiz.q1;
  }
}

const styles = StyleSheet.create({
  list: {
    gap: 8,
    paddingBottom: 8,
  },
  swatchRing: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.quizTrack,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
  swatchFill: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: colors.surface,
  },
});
