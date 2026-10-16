import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { Button } from '@/src/components/Button';
import { getCopy } from '@/src/copy';
import { spacing } from '@/src/theme';

export type ScanDetailNavProps = {
  previousId: string | null;
  nextId: string | null;
};

export function ScanDetailNav({ previousId, nextId }: ScanDetailNavProps) {
  const router = useRouter();
  const p = getCopy().screens.progress;

  return (
    <View style={styles.row}>
      <View style={styles.half}>
        <Button
          label={p.previousScan}
          variant="outline"
          disabled={!previousId}
          onPress={() => {
            if (previousId) {
              router.replace(`/(tabs)/progress/${previousId}`);
            }
          }}
        />
      </View>
      <View style={styles.half}>
        <Button
          label={p.nextScan}
          variant="primary"
          disabled={!nextId}
          onPress={() => {
            if (nextId) {
              router.replace(`/(tabs)/progress/${nextId}`);
            }
          }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  half: {
    flex: 1,
  },
});
