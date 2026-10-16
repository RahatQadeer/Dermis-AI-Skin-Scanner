import { StyleSheet, View } from 'react-native';

import { Card } from '@/src/components/Card';
import { ListRow } from '@/src/components/ListRow';
import { Toggle } from '@/src/components/Toggle';
import { AppText } from '@/src/components/text/AppText';
import { getCopy } from '@/src/copy';
import { spacing } from '@/src/theme';

export type ProfileSettingsSectionProps = {
  notificationsOn: boolean;
  onNotificationsChange: (value: boolean) => void;
  lightingOn: boolean;
  onLightingChange: (value: boolean) => void;
  shareDataOn: boolean;
  onShareDataChange: (value: boolean) => void;
  routineNudgesOn: boolean;
  onRoutineNudgesChange: (value: boolean) => void;
};

export function ProfileSettingsSection(props: ProfileSettingsSectionProps) {
  const p = getCopy().screens.profile;
  const rows = [
    {
      key: 'reminders',
      title: p.prefScanReminders,
      hint: p.prefScanRemindersHint,
      value: props.notificationsOn,
      onChange: props.onNotificationsChange,
    },
    {
      key: 'lighting',
      title: p.prefLighting,
      hint: p.prefLightingHint,
      value: props.lightingOn,
      onChange: props.onLightingChange,
    },
    {
      key: 'share',
      title: p.prefShareData,
      hint: p.prefShareDataHint,
      value: props.shareDataOn,
      onChange: props.onShareDataChange,
    },
    {
      key: 'nudges',
      title: p.prefRoutineNudges,
      hint: p.prefRoutineNudgesHint,
      value: props.routineNudgesOn,
      onChange: props.onRoutineNudgesChange,
    },
  ];

  return (
    <View style={styles.block}>
      <AppText variant="headline">{p.sectionPreferences}</AppText>
      <Card padded={false}>
        {rows.map((row) => (
          <ListRow
            key={row.key}
            title={row.title}
            subtitle={row.hint}
            trailing={
              <Toggle value={row.value} onChange={row.onChange} accessibilityLabel={row.title} />
            }
          />
        ))}
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  block: {
    gap: spacing.md,
  },
});
