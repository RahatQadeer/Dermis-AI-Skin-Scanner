import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from '@/src/components/text/AppText';
import { SheepHeadMark } from '@/src/components/mascot/SheepHeadMark';
import { getCopy } from '@/src/copy';
import { colors, fontFamilies, radii, shadows, spacing } from '@/src/theme';

import { isCentreScanTab, TAB_BAR_ORDER, type TabId } from './tabBarTypes';
import {
  HomeTabIcon,
  ProfileTabIcon,
  ProgressTabIcon,
  RoutineTabIcon,
} from './TabBarIcons';

export type TabBarProps = {
  active: TabId;
  onSelect: (id: TabId) => void;
};

function tabLabel(id: TabId): string {
  const nav = getCopy().nav;
  return nav[id];
}

function SideTabIcon({ id, active }: { id: TabId; active: boolean }) {
  const color = active ? colors.ink : colors.mute;
  if (id === 'home') {
    return <HomeTabIcon color={color} active={active} />;
  }
  if (id === 'progress') {
    return <ProgressTabIcon color={color} active={active} />;
  }
  if (id === 'routine') {
    return <RoutineTabIcon color={color} active={active} />;
  }
  return <ProfileTabIcon color={color} active={active} />;
}

function SideTab({
  id,
  active,
  onSelect,
}: {
  id: TabId;
  active: boolean;
  onSelect: (id: TabId) => void;
}) {
  const color = active ? colors.ink : colors.mute;
  return (
    <Pressable
      accessibilityRole="tab"
      accessibilityState={{ selected: active }}
      accessibilityLabel={tabLabel(id)}
      onPress={() => onSelect(id)}
      style={({ pressed }) => [styles.sideTab, pressed && styles.pressed]}
    >
      <SideTabIcon id={id} active={active} />
      <AppText
        variant="label"
        color={color}
        align="center"
        style={active ? styles.labelActive : styles.labelIdle}
      >
        {tabLabel(id)}
      </AppText>
    </Pressable>
  );
}

function CentreScanButton({ onSelect }: { onSelect: (id: TabId) => void }) {
  const nav = getCopy().nav;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={nav.scanA11y}
      onPress={() => onSelect('scan')}
      style={({ pressed }) => [styles.scanHit, pressed && styles.pressed]}
    >
      <View style={[styles.scanFab, styles.scanGlow]}>
        <SheepHeadMark size={34} />
      </View>
    </Pressable>
  );
}

export function TabBar({ active, onSelect }: TabBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.host,
        // Tiny mint gap under the pill (not a full safe-area band).
        { paddingBottom: insets.bottom > 0 ? spacing.md : spacing.sm },
      ]}
      pointerEvents="box-none"
    >
      <View style={[styles.bar, shadows.soft]} accessibilityRole="tablist">
        {TAB_BAR_ORDER.map((id) =>
          isCentreScanTab(id) ? (
            <CentreScanButton key={id} onSelect={onSelect} />
          ) : (
            <SideTab key={id} id={id} active={active === id} onSelect={onSelect} />
          ),
        )}
      </View>
    </View>
  );
}

const FAB = 58;

const styles = StyleSheet.create({
  host: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 20,
    elevation: 20,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    backgroundColor: 'transparent',
  },
  bar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.sm,
    paddingTop: spacing.sm + 2,
    paddingBottom: spacing.sm + 2,
    minHeight: 64,
  },
  sideTab: {
    flex: 1,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    paddingVertical: spacing.xs,
  },
  labelIdle: {
    fontFamily: fontFamilies.bodySemiBold,
    fontSize: 11,
  },
  labelActive: {
    fontFamily: fontFamilies.bodyBold,
    fontSize: 11,
  },
  scanHit: {
    width: FAB + 12,
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: -(FAB / 2 + 4),
    marginBottom: 2,
  },
  scanFab: {
    width: FAB,
    height: FAB,
    borderRadius: radii.pill,
    backgroundColor: colors.pinkBright,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: colors.surface,
  },
  scanGlow: {
    shadowColor: colors.pink,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 8,
  },
  pressed: {
    opacity: 0.9,
  },
});
