import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, StyleSheet } from 'react-native';

import { Button } from '@/src/components/Button';
import { Card } from '@/src/components/Card';
import { HealthDisclaimer } from '@/src/components/HealthDisclaimer';
import { Screen } from '@/src/components/layout/Screen';
import { TAB_BAR_SCROLL_PAD } from '@/src/components/layout/tabBarTypes';
import { AppText } from '@/src/components/text/AppText';
import { getCopy } from '@/src/copy';
import { useScanNavigation } from '@/src/features/consent/hooks/useScanNavigation';
import { colors, spacing } from '@/src/theme';

import { HomeHeader } from '../components/HomeHeader';
import { HomeHeroCard } from '../components/HomeHeroCard';
import { AssistantEntryCard } from '@/src/features/assistant/components/AssistantEntryCard';

import { HomePrioritiesCard } from '../components/HomePrioritiesCard';
import { HomeQuotaRow } from '../components/HomeQuotaRow';
import { HomeRoutineCard } from '../components/HomeRoutineCard';
import { HomeScanCta } from '../components/HomeScanCta';
import { HomeStatCards } from '../components/HomeStatCards';
import { useHomeSnapshot } from '../hooks/useHomeSnapshot';

function HomeHeroEmpty({ onScan }: { onScan: () => void }) {
  const h = getCopy().screens.home;
  return (
    <Card style={styles.emptyHero}>
      <AppText variant="headline">{h.indexEmptyTitle}</AppText>
      <AppText variant="body" color={colors.mute}>
        {h.indexEmptyBody}
      </AppText>
      <Button label={h.scanCta} onPress={onScan} />
    </Card>
  );
}

export function HomeScreen() {
  const router = useRouter();
  const snapshot = useHomeSnapshot();
  const { goScan } = useScanNavigation();

  if (snapshot.loading) {
    return (
      <Screen padded edges={['top', 'left', 'right']} contentStyle={styles.loading}>
        <StatusBar style="dark" />
        <ActivityIndicator color={colors.pinkBright} size="large" />
      </Screen>
    );
  }

  return (
    <Screen scroll padded edges={['top', 'left', 'right']} contentStyle={styles.content}>
      <StatusBar style="dark" />
      <HomeHeader
        name={snapshot.displayName.trim() ? snapshot.displayName : null}
        onAvatar={() => router.push('/profile')}
      />
      {snapshot.scan ? (
        <HomeHeroCard scan={snapshot.scan} onViewReport={() => router.push('/(tabs)/results')} />
      ) : (
        <HomeHeroEmpty onScan={goScan} />
      )}
      <HomeScanCta plan={snapshot.quota.plan} onPress={goScan} />
      <HomeQuotaRow quota={snapshot.quota} onUpgrade={() => router.push('/paywall')} />
      <HomeRoutineCard routine={snapshot.routine} onContinue={() => router.push('/routine')} />
      <AssistantEntryCard />
      <HomeStatCards scan={snapshot.scan} />
      {snapshot.scan ? <HomePrioritiesCard scan={snapshot.scan} /> : null}
      <HealthDisclaimer compact />
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: spacing.lg,
    paddingBottom: TAB_BAR_SCROLL_PAD,
  },
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyHero: {
    gap: spacing.md,
  },
});
