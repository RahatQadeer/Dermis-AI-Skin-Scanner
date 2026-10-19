import { StyleSheet, View } from 'react-native';

import { AppText } from '@/src/components/text/AppText';
import { getCopy } from '@/src/copy';
import { colors, radii, spacing } from '@/src/theme';

import {
  isFaceIssue,
  isHoldIssue,
  isLightingIssue,
  type LiveScanIssue,
} from '../lib/liveScanGuidance';

type ChipState = 'neutral' | 'warn' | 'ok';

type Props = {
  liveIssue?: LiveScanIssue | null;
  ready?: boolean;
};

function stateFor(
  chip: 'lighting' | 'distance' | 'hold',
  issue: LiveScanIssue | null | undefined,
  ready: boolean,
): ChipState {
  // Warn only the chip that matches the current tip — clears when issue clears.
  if (chip === 'lighting') {
    if (isLightingIssue(issue)) return 'warn';
    if (ready) return 'ok';
    return 'neutral';
  }
  if (chip === 'distance') {
    if (isFaceIssue(issue)) return 'warn';
    if (ready) return 'ok';
    return 'neutral';
  }
  if (isHoldIssue(issue)) return 'warn';
  if (ready) return 'ok';
  return 'neutral';
}

/** Always show all three tips; amber = current problem, green = ready. */
export function ScanQualityChips({ liveIssue = null, ready = false }: Props) {
  const c = getCopy().screens.camera;
  return (
    <View style={styles.row} accessibilityRole="text">
      <TipChip label={c.qualityLighting} state={stateFor('lighting', liveIssue, ready)} />
      <TipChip label={c.qualityDistance} state={stateFor('distance', liveIssue, ready)} />
      <TipChip label={c.qualityHold} state={stateFor('hold', liveIssue, ready)} />
    </View>
  );
}

function TipChip({ label, state }: { label: string; state: ChipState }) {
  const background = state === 'warn' ? colors.amber : state === 'ok' ? colors.green : colors.mute;
  const textColor = state === 'warn' ? colors.ink : colors.surface;
  return (
    <View style={[styles.chip, { backgroundColor: background }]}>
      <AppText variant="caption" color={textColor}>
        {state === 'ok' ? `✓ ${label}` : state === 'warn' ? `! ${label}` : label}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    flexWrap: 'nowrap',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.xs,
  },
  chip: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radii.pill,
    flexShrink: 1,
  },
});
