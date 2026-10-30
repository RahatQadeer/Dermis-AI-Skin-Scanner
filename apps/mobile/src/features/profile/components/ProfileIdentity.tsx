import { StyleSheet, View } from 'react-native';

import { AppText } from '@/src/components/text/AppText';
import { getCopy } from '@/src/copy';
import { colors, radii, spacing } from '@/src/theme';

export type ProfileIdentityProps = {
  displayName: string;
  email?: string | null;
  scanCount: number;
  /** Account (profile) creation time; omitted from the line until known. */
  memberSince: string | null;
};

export function ProfileIdentity({
  displayName,
  email,
  scanCount,
  memberSince,
}: ProfileIdentityProps) {
  const p = getCopy().screens.profile;

  return (
    <View style={styles.row}>
      <View style={styles.avatar}>
        <AppText variant="title" color={colors.pink}>
          {toInitials(displayName)}
        </AppText>
      </View>
      <View style={styles.text}>
        <AppText variant="title">{displayName}</AppText>
        {email ? (
          <AppText variant="caption" color={colors.mute}>
            {email}
          </AppText>
        ) : null}
        <AppText variant="body" color={colors.mute}>
          {[
            memberSince ? p.memberSince(formatMonthYear(memberSince)) : null,
            `${scanCount} ${p.scansLabel}`,
          ]
            .filter(Boolean)
            .join(' · ')}
        </AppText>
      </View>
    </View>
  );
}

function formatMonthYear(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
}

function toInitials(name: string): string {
  const clean = name.includes('@') ? (name.split('@')[0] ?? name) : name;
  const parts = clean
    .trim()
    .split(/[\s._-]+/)
    .filter(Boolean);
  const chars = parts
    .slice(0, 2)
    .map((word) => word[0] ?? '')
    .join('');
  return (chars || clean.slice(0, 2)).toUpperCase();
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: radii.pill,
    backgroundColor: colors.noteSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    flex: 1,
    gap: spacing.xxs,
  },
});
