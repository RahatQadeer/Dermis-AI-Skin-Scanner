import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, StyleSheet } from 'react-native';

import { Button } from '@/src/components/Button';
import { Card } from '@/src/components/Card';
import { HealthDisclaimer } from '@/src/components/HealthDisclaimer';
import { Screen } from '@/src/components/layout/Screen';
import { AppText } from '@/src/components/text/AppText';
import { getCopy } from '@/src/copy';
import { useScanNavigation } from '@/src/features/consent/hooks/useScanNavigation';
import { colors, spacing } from '@/src/theme';

import { FaceRegisterPrompt } from '../components/FaceRegisterPrompt';
import { HomeHeader } from '../components/HomeHeader';
import { HomeHeroCard } from '../components/HomeHeroCard';
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
    <Screen
      scroll
      padded
      tabBarPadding
      edges={['top', 'left', 'right']}
      contentStyle={styles.content}
    >
      <StatusBar style="dark" />
      <HomeHeader
        name={snapshot.displayName.trim() ? snapshot.displayName : null}
        onAvatar={() => router.push('/profile')}
      />
      {snapshot.scan ? (
        <HomeHeroCard
          scan={snapshot.scan}
          onViewReport={() => router.push('/(report)/results')}
          onViewRecommendations={() => router.push('/(report)/recommendations')}
        />
      ) : (
        <HomeHeroEmpty onScan={goScan} />
      )}
      {snapshot.scan ? <HomeScanCta plan={snapshot.quota.plan} onPress={goScan} /> : null}
      <HomeQuotaRow quota={snapshot.quota} onUpgrade={() => router.push('/paywall')} />
      <HomeRoutineCard routine={snapshot.routine} onContinue={() => router.push('/routine')} />
      <HomeStatCards scan={snapshot.scan} />
      {snapshot.scan ? <HomePrioritiesCard scan={snapshot.scan} /> : null}
      <HealthDisclaimer compact />
      <FaceRegisterPrompt />
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: spacing.lg,
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
