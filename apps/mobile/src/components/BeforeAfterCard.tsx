import { clampScore } from '@/src/lib/clampScore';
import { AppText } from '@/src/components/text/AppText';
import { colors, spacing } from '@/src/theme';

import { Card } from '@/src/components/Card';
import { StyleSheet, View } from 'react-native';

export type BeforeAfterCardProps = {
  title: string;
  beforeLabel: string;
  afterLabel: string;
  beforeScore: number;
  afterScore: number;
};

export function BeforeAfterCard({
  title,
  beforeLabel,
  afterLabel,
  beforeScore,
  afterScore,
}: BeforeAfterCardProps) {
  const before = clampScore(beforeScore);
  const after = clampScore(afterScore);

  return (
    <Card>
      <AppText variant="bodyStrong" style={styles.title}>
        {title}
      </AppText>
      <View style={styles.row}>
        <ScoreColumn label={beforeLabel} score={before} muted />
        <AppText variant="headline" color={colors.pink}>
          {ARROW}
        </AppText>
        <ScoreColumn label={afterLabel} score={after} />
      </View>
    </Card>
  );
}

function ScoreColumn({
  label,
  score,
  muted = false,
}: {
  label: string;
  score: number;
  muted?: boolean;
}) {
  return (
    <View style={styles.column}>
      <AppText variant="caption" color={colors.mute} align="center">
        {label}
      </AppText>
      <AppText variant="title" color={muted ? colors.mute : colors.ink} align="center">
        {String(score)}
      </AppText>
    </View>
  );
}

const ARROW = '→';

const styles = StyleSheet.create({
  title: {
    marginBottom: spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.lg,
  },
  column: {
    flex: 1,
    gap: spacing.xs,
  },
});
