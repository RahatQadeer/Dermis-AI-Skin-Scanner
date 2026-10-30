import { isElementUnlocked } from '@dermis/domain';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, View } from 'react-native';

import { IconButton } from '@/src/components/IconButton';
import { LockedOverlay } from '@/src/components/LockedOverlay';
import { Screen } from '@/src/components/layout/Screen';
import { ToastHost } from '@/src/components/layout/ToastHost';
import { AppText } from '@/src/components/text/AppText';
import { getCopy } from '@/src/copy';
import { useHomeSnapshot } from '@/src/features/home/hooks/useHomeSnapshot';
import { colors, spacing } from '@/src/theme';

import { AssistantComposer } from '../components/AssistantComposer';
import { AssistantMessageList } from '../components/AssistantMessageList';
import { AssistantPhotoSheet } from '../components/AssistantPhotoSheet';
import { useAssistantChat } from '../hooks/useAssistantChat';

export function AssistantScreen() {
  const a = getCopy().screens.assistant;
  const router = useRouter();
  const snapshot = useHomeSnapshot();
  const chat = useAssistantChat();
  const [photoOpen, setPhotoOpen] = useState(false);
  const locked =
    chat.proRequired ||
    (!snapshot.loading && !isElementUnlocked(snapshot.quota.plan, 'aiAssistant'));

  return (
    <Screen padded edges={['top', 'left', 'right', 'bottom']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <AssistantHeader remaining={chat.remaining} />
        <AppText variant="caption" color={colors.muteBody}>
          {a.disclaimer}
        </AppText>
        <LockedOverlay locked={locked} onUnlock={() => router.push('/paywall')} hint={a.lockedHint}>
          <AssistantChatBody chat={chat} onAddPhoto={() => setPhotoOpen(true)} />
        </LockedOverlay>
      </KeyboardAvoidingView>
      <AssistantPhotoSheet
        visible={photoOpen}
        onClose={() => setPhotoOpen(false)}
        onCaptured={chat.setPhoto}
        onError={chat.setError}
      />
      <ToastHost
        message={chat.error ?? ''}
        visible={Boolean(chat.error)}
        onDismiss={chat.dismissError}
      />
    </Screen>
  );
}

function AssistantHeader({ remaining }: { remaining: number | null }) {
  const a = getCopy().screens.assistant;
  const router = useRouter();
  return (
    <View style={styles.header}>
      <IconButton
        accessibilityLabel={getCopy().common.back}
        onPress={() => (router.canGoBack() ? router.back() : router.replace('/home'))}
      >
        <AppText variant="headline">←</AppText>
      </IconButton>
      <View style={styles.flex}>
        <AppText variant="title">{a.title}</AppText>
        <AppText variant="caption" color={colors.muteBody}>
          {remaining !== null ? a.remaining(remaining) : a.subtitle}
        </AppText>
      </View>
    </View>
  );
}

function AssistantChatBody({
  chat,
  onAddPhoto,
}: {
  chat: ReturnType<typeof useAssistantChat>;
  onAddPhoto: () => void;
}) {
  return (
    <View style={styles.flex}>
      <AssistantMessageList
        messages={chat.messages}
        sending={chat.sending}
        onSuggestion={(text) => void chat.send(text)}
      />
      <AssistantComposer
        draft={chat.draft}
        onDraft={chat.setDraft}
        onSend={() => void chat.send()}
        sending={chat.sending}
        hasPhoto={Boolean(chat.photo)}
        onAddPhoto={onAddPhoto}
        onRemovePhoto={() => chat.setPhoto(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
});
