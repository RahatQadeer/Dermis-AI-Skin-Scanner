import { CONCERN_IDS, type ConcernId } from '@dermis/domain';
import { ScrollView, StyleSheet } from 'react-native';

import { Chip } from '@/src/components/Chip';
import { getCopy } from '@/src/copy';
import { concernLabel } from '@/src/features/home/lib/concernLabel';
import { spacing } from '@/src/theme';

import type { ConcernFilter } from '../lib/filterProducts';

export type ConcernFilterRowProps = {
  value: ConcernFilter;
  onChange: (value: ConcernFilter) => void;
};

export function ConcernFilterRow({ value, onChange }: ConcernFilterRowProps) {
  const r = getCopy().screens.recommendations;

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      accessibilityLabel={r.concernFilterA11y}
      contentContainerStyle={styles.row}
      bounces={false}
      alwaysBounceHorizontal={false}
      overScrollMode="never"
    >
      <Chip label={r.filterAll} selected={value === 'all'} onPress={() => onChange('all')} />
      {CONCERN_IDS.map((id: ConcernId) => (
        <Chip
          key={id}
          label={concernLabel(id)}
          selected={value === id}
          onPress={() => onChange(id)}
        />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingVertical: spacing.xs,
  },
});
