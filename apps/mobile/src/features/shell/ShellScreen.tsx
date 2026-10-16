import { useRouter } from 'expo-router';

import { Header } from '@/src/components/layout/Header';
import { Screen } from '@/src/components/layout/Screen';
import { AppText } from '@/src/components/text/AppText';
import { getCopy } from '@/src/copy';
import { colors, spacing } from '@/src/theme';

export type ShellScreenProps = {
  title: string;
  showBack?: boolean;
  detail?: string;
};

export function ShellScreen({ title, showBack = true, detail }: ShellScreenProps) {
  const router = useRouter();
  const canBack = showBack && router.canGoBack();

  return (
    <Screen scroll padded>
      <Header
        title={title}
        onBack={canBack ? () => router.back() : undefined}
        showBack={showBack}
      />
      {detail ? (
        <AppText variant="caption" color={colors.mute} style={{ marginTop: spacing.sm }}>
          {detail}
        </AppText>
      ) : null}
      <AppText variant="body" color={colors.mute} style={{ marginTop: spacing.md }}>
        {getCopy().shell.body}
      </AppText>
    </Screen>
  );
}
