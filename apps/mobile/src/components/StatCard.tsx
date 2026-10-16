import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { Card } from '@/src/components/Card';
import { AppText } from '@/src/components/text/AppText';
import { colors, spacing } from '@/src/theme';

export type StatCardProps = {
  title: string;
  value: string;
  caption?: string;
  trailing?: ReactNode;
};

export function StatCard({ title, value, caption, trailing }: StatCardProps) {
  return (
    <Card style={styles.card}>
      <View style={styles.row}>
        <View style={styles.text}>
          <AppText variant="caption" color={colors.mute}>
            {title}
          </AppText>
          <AppText variant="title">{value}</AppText>
          {caption ? (
            <AppText variant="caption" color={colors.mute}>
              {caption}
            </AppText>
          ) : null}
        </View>
        {trailing}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    minWidth: 140,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  text: {
    flex: 1,
    gap: spacing.xxs,
  },
});
