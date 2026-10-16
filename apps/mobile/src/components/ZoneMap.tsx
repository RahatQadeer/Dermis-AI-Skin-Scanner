import { scoreColor, ZONE_IDS, type ZoneId } from '@dermis/domain';
import { Pressable, StyleSheet, View, type ViewStyle } from 'react-native';

import { AppText } from '@/src/components/text/AppText';
import { getCopy } from '@/src/copy';
import { clampScore } from '@/src/lib/clampScore';
import { scoreTokenToColor } from '@/src/lib/scoreTokenToColor';
import { colors, spacing, touchTargets } from '@/src/theme';

import { ZoneMapFace } from './ZoneMapFace';

/** Relative positions on the face oval (0–1 within face bounds). */
const ZONE_LAYOUT: Record<ZoneId, { x: number; y: number }> = {
  forehead: { x: 0.5, y: 0.18 },
  periorbital: { x: 0.5, y: 0.34 },
  leftCheek: { x: 0.22, y: 0.48 },
  rightCheek: { x: 0.78, y: 0.48 },
  tZone: { x: 0.5, y: 0.52 },
  chin: { x: 0.5, y: 0.8 },
};

export type ZoneScoreMap = Partial<Record<ZoneId, number>>;

export type ZoneMapProps = {
  scores?: ZoneScoreMap;
  selectedZoneId?: ZoneId | null;
  onSelectZone?: (zoneId: ZoneId) => void;
  size?: number;
};

export function ZoneMap({
  scores = {},
  selectedZoneId = null,
  onSelectZone,
  size = 260,
}: ZoneMapProps) {
  const zoneLabels = getCopy().zones;
  const marker = size >= 240 ? 44 : 38;
  const faceW = size * 0.82;
  const faceH = size * 1.12;

  return (
    <View style={[styles.wrap, { width: size, height: faceH }]}>
      <View style={[styles.faceHost, { width: faceW, height: faceH }]}>
        <ZoneMapFace width={faceW} height={faceH} />
      </View>
      {ZONE_IDS.map((zoneId) => (
        <ZoneMarker
          key={zoneId}
          zoneId={zoneId}
          label={zoneLabels[zoneId]}
          score={scores[zoneId]}
          selected={selectedZoneId === zoneId}
          size={size}
          faceW={faceW}
          faceH={faceH}
          marker={marker}
          onSelectZone={onSelectZone}
        />
      ))}
    </View>
  );
}

type ZoneMarkerProps = {
  zoneId: ZoneId;
  label: string;
  score?: number;
  selected: boolean;
  size: number;
  faceW: number;
  faceH: number;
  marker: number;
  onSelectZone?: (zoneId: ZoneId) => void;
};

function ZoneMarker(props: ZoneMarkerProps) {
  const layout = ZONE_LAYOUT[props.zoneId];
  const diameter = props.selected ? props.marker + 4 : props.marker;
  const faceLeft = (props.size - props.faceW) / 2;
  const left = faceLeft + layout.x * props.faceW - diameter / 2;
  const top = layout.y * props.faceH - diameter / 2;
  const hitPad = Math.max(0, Math.ceil((touchTargets.min - diameter) / 2));
  const ring = markerRingColor(props.score);
  const markerStyle = buildMarkerStyle({ selected: props.selected, diameter, left, top, ring });

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: props.selected }}
      accessibilityLabel={markerA11yLabel(props.label, props.score)}
      disabled={!props.onSelectZone}
      onPress={() => props.onSelectZone?.(props.zoneId)}
      hitSlop={{ top: hitPad, bottom: hitPad, left: hitPad, right: hitPad }}
      style={[styles.marker, markerStyle]}
    >
      <AppText
        variant="caption"
        color={props.selected ? colors.surface : colors.ink}
        align="center"
        style={styles.markerText}
        numberOfLines={1}
      >
        {markerContent(props.zoneId, props.score)}
      </AppText>
    </Pressable>
  );
}

function markerContent(zoneId: ZoneId, score: number | undefined): string {
  if (score === undefined) {
    return zoneId.slice(0, 1).toUpperCase();
  }
  return String(score);
}

function markerRingColor(score: number | undefined): string {
  if (score === undefined) {
    return colors.sky;
  }
  return scoreTokenToColor(scoreColor(clampScore(score)));
}

function markerA11yLabel(label: string, score: number | undefined): string {
  if (score === undefined) {
    return label;
  }
  return `${label}, ${String(score)}`;
}

function buildMarkerStyle(opts: {
  selected: boolean;
  diameter: number;
  left: number;
  top: number;
  ring: string;
}): ViewStyle {
  return {
    left: opts.left,
    top: opts.top,
    width: opts.diameter,
    height: opts.diameter,
    borderRadius: opts.diameter / 2,
    backgroundColor: opts.selected ? colors.ink : colors.surface,
    borderColor: opts.selected ? colors.pinkBright : opts.ring,
    borderWidth: opts.selected ? 3 : 2,
    shadowColor: opts.selected ? colors.pinkBright : 'transparent',
    shadowOpacity: opts.selected ? 0.55 : 0,
    shadowRadius: opts.selected ? 10 : 0,
    shadowOffset: { width: 0, height: 0 },
    elevation: opts.selected ? 4 : 0,
  };
}

const styles = StyleSheet.create({
  wrap: {
    alignSelf: 'center',
    position: 'relative',
  },
  faceHost: {
    alignSelf: 'center',
  },
  marker: {
    position: 'absolute',
    minWidth: 34,
    minHeight: 34,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xxs,
  },
  markerText: {
    fontVariant: ['tabular-nums'],
  },
});
