import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { Card } from '@/src/components/Card';
import { ListRow } from '@/src/components/ListRow';
import { AppText } from '@/src/components/text/AppText';
import { getCopy } from '@/src/copy';
import { colors, spacing } from '@/src/theme';

import { ProfileAboutSection } from './ProfileAboutSection';

export type ProfileLegalSectionProps = {
  onLegalUnavailable: () => void;
};

export function ProfileLegalSection({ onLegalUnavailable }: ProfileLegalSectionProps) {
  const router = useRouter();
  const p = getCopy().screens.profile;

  return (
    <View style={styles.block}>
      <AppText variant="headline" color={colors.ink}>
        {p.sectionLegal}
      </AppText>
      <Card padded={false}>
        <ListRow
          title={p.recommendations}
          subtitle={p.recommendationsHint}
          onPress={() => router.push('/(tabs)/recommendations')}
        />
        <ListRow
          title={p.privacy}
          onPress={() => router.push('/(scan)/privacy')}
          accessibilityLabel={p.privacy}
        />
      </Card>
      <ProfileAboutSection onLegalUnavailable={onLegalUnavailable} />
    </View>
  );
}

const styles = StyleSheet.create({
  block: {
    gap: spacing.md,
  },
});
