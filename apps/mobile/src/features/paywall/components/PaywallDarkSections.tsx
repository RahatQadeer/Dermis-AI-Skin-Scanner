import { Pressable, StyleSheet, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';

import { Mascot } from '@/src/components/mascot/Mascot';
import { AppText } from '@/src/components/text/AppText';
import { getCopy } from '@/src/copy';
import { colors, radii, spacing } from '@/src/theme';

import { paywallDark } from '../paywallDark';

export function PaywallTopBar({ onClose }: { onClose: () => void }) {
  const p = getCopy().paywall;
  const common = getCopy().common;
  return (
    <View style={styles.topBar}>
      <View style={styles.brandRow}>
        <AppText variant="headline" color={colors.surface}>
          {common.appName}
        </AppText>
        <View style={styles.proPill}>
          <AppText variant="label" color={colors.surface}>
            {p.proBadge}
          </AppText>
        </View>
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={common.close}
        onPress={onClose}
        hitSlop={spacing.sm}
        style={styles.close}
      >
        <AppText variant="headline" color={colors.surface}>
          ✕
        </AppText>
      </Pressable>
    </View>
  );
}

export function PaywallHero() {
  const p = getCopy().paywall;
  return (
    <View style={styles.hero}>
      <Mascot mood="happy" size={120} showBubble={false} />
      <AppText variant="display" color={colors.surface} align="center">
        {p.headline}
      </AppText>
    </View>
  );
}

export function PaywallProjectedIndex() {
  const p = getCopy().paywall;
  return (
    <View style={[styles.card, styles.projected]}>
      <View style={styles.projectedHead}>
        <AppText variant="label" color={paywallDark.textMuted}>
          {p.projectedIndexLabel}
        </AppText>
        <AppText variant="caption" color={paywallDark.textMuted} align="right" style={styles.basis}>
          {p.projectedBasis}
        </AppText>
      </View>
      <View style={styles.projectedRow}>
        <AppText variant="headline" color={paywallDark.textMuted} style={styles.strike}>
          {p.projectedFrom}
        </AppText>
        <AppText variant="display" color={colors.surface}>
          {p.projectedTo}
        </AppText>
        <AppText variant="bodyStrong" color={colors.confettiMint}>
          {p.projectedHorizon}
        </AppText>
      </View>
      <ProjectedTrend />
      <View style={styles.chips}>
        {p.projectedConcerns.map((concern) => (
          <View key={concern} style={styles.darkChip}>
            <AppText variant="caption" color={colors.surface}>
              {concern}
            </AppText>
          </View>
        ))}
      </View>
    </View>
  );
}

function ProjectedTrend() {
  return (
    <Svg width="100%" height={64} viewBox="0 0 100 40" preserveAspectRatio="none">
      <Path
        d="M2 34 C 28 31, 48 21, 72 12 S 95 7, 98 6"
        stroke={colors.pinkBright}
        strokeWidth={2}
        fill="none"
        strokeLinecap="round"
      />
      <Circle cx={98} cy={6} r={3} fill={colors.surface} />
    </Svg>
  );
}

export function PaywallTierCards() {
  const p = getCopy().paywall;
  return (
    <View style={styles.tierRow}>
      <TierCard
        label={p.tierFreeLabel}
        value={p.tierFreeValue}
        unit={p.tierFreeUnit}
        note={p.tierFreeNote}
      />
      <TierCard
        label={p.tierProLabel}
        value={p.tierProValue}
        unit={p.tierProUnit}
        note={p.tierProNote}
        highlighted
      />
    </View>
  );
}

function TierCard({
  label,
  value,
  unit,
  note,
  highlighted = false,
}: {
  label: string;
  value: string;
  unit: string;
  note: string;
  highlighted?: boolean;
}) {
  return (
    <View style={[styles.card, styles.tierCard, highlighted ? styles.tierPro : null]}>
      <AppText variant="label" color={highlighted ? colors.pinkBright : paywallDark.textMuted}>
        {label}
      </AppText>
      <View style={styles.tierValueRow}>
        <AppText variant="display" color={colors.surface}>
          {value}
        </AppText>
        <AppText variant="caption" color={paywallDark.textMuted}>
          {unit}
        </AppText>
      </View>
      <AppText variant="caption" color={paywallDark.textMuted}>
        {note}
      </AppText>
    </View>
  );
}

export function PaywallFeatureList() {
  const p = getCopy().paywall;
  return (
    <View style={styles.features}>
      {p.features.map((feature) => (
        <View key={feature.title} style={styles.featureRow}>
          <View style={styles.check}>
            <AppText variant="caption" color={colors.surface}>
              ✓
            </AppText>
          </View>
          <View style={styles.featureCopy}>
            <AppText variant="bodyStrong" color={colors.surface}>
              {feature.title}
            </AppText>
            <AppText variant="caption" color={paywallDark.textMuted}>
              {feature.body}
            </AppText>
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  proPill: {
    backgroundColor: colors.pink,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
  },
  close: {
    width: spacing.xxl,
    height: spacing.xxl,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: paywallDark.closeBg,
  },
  hero: {
    alignItems: 'center',
    gap: spacing.md,
  },
  card: {
    backgroundColor: paywallDark.card,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: paywallDark.cardBorder,
    padding: spacing.lg,
  },
  projected: {
    gap: spacing.sm,
  },
  projectedHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  basis: {
    flex: 1,
  },
  projectedRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: spacing.sm,
  },
  strike: {
    textDecorationLine: 'line-through',
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  darkChip: {
    backgroundColor: paywallDark.closeBg,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  tierRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  tierCard: {
    flex: 1,
    gap: spacing.xs,
  },
  tierPro: {
    borderColor: colors.pink,
  },
  tierValueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: spacing.xs,
  },
  features: {
    gap: spacing.lg,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  check: {
    width: spacing.xl,
    height: spacing.xl,
    borderRadius: radii.pill,
    backgroundColor: colors.green,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.xxs,
  },
  featureCopy: {
    flex: 1,
    gap: spacing.xxs,
  },
});
