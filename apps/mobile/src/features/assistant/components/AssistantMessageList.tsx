import { useEffect, useRef } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  type ScrollViewInstance,
} from 'react-native';

import { AppText } from '@/src/components/text/AppText';
import { getCopy } from '@/src/copy';
import { colors, radii, spacing } from '@/src/theme';

import type { ChatMessage } from '../lib/chatHistory';

type Props = {
  messages: ChatMessage[];
  sending: boolean;
  onSuggestion: (text: string) => void;
};

export function AssistantMessageList({ messages, sending, onSuggestion }: Props) {
  const a = getCopy().screens.assistant;
  const scrollRef = useRef<ScrollViewInstance>(null);

  useEffect(() => {
    scrollRef.current?.scrollToEnd({ animated: true });
  }, [messages.length, sending]);

  return (
    <ScrollView
      ref={scrollRef}
      style={styles.list}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="interactive"
    >
      <Bubble role="assistant" text={a.welcome} />
      {messages.length === 0 ? (
        <View style={styles.suggestions}>
          {a.suggestions.map((s) => (
            <Pressable
              key={s}
              accessibilityRole="button"
              onPress={() => onSuggestion(s)}
              style={styles.suggestion}
            >
              <AppText variant="caption" color={colors.ink}>
                {s}
              </AppText>
            </Pressable>
          ))}
        </View>
      ) : null}
      {messages.map((m) => (
        <Bubble key={m.id} {...m} />
      ))}
      {sending ? (
        <View style={styles.thinking} accessibilityLiveRegion="polite">
          <ActivityIndicator color={colors.ink} />
          <AppText variant="caption" color={colors.muteBody}>
            {a.thinking}
          </AppText>
        </View>
      ) : null}
    </ScrollView>
  );
}

function Bubble({ role, text, hadPhoto, seeProfessional }: Omit<ChatMessage, 'id'>) {
  const a = getCopy().screens.assistant;
  const mine = role === 'user';
  return (
    <View style={[styles.bubble, mine ? styles.mine : styles.theirs]}>
      {hadPhoto ? (
        <AppText variant="caption" color={colors.muteBody}>
          📷 {a.photoAttached.split(' —')[0]}
        </AppText>
      ) : null}
      <AppText variant="body" color={colors.ink} selectable>
        {text}
      </AppText>
      {seeProfessional ? (
        <View style={styles.flag}>
          <AppText variant="caption" color={colors.surface}>
            {a.seeProfessional}
          </AppText>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  list: { flex: 1 },
  content: { gap: spacing.md, paddingVertical: spacing.md },
  bubble: { maxWidth: '88%', borderRadius: radii.xl, padding: spacing.md, gap: spacing.xs },
  mine: { alignSelf: 'flex-end', backgroundColor: colors.greenSoft },
  theirs: { alignSelf: 'flex-start', backgroundColor: colors.surface },
  suggestions: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  suggestion: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
  },
  thinking: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  flag: {
    alignSelf: 'flex-start',
    backgroundColor: colors.pink,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
});
