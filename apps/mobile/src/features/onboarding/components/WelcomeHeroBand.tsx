import { StyleSheet, View } from 'react-native';

import { colors } from '@/src/theme';

import { WelcomeHeader } from './WelcomeHeader';
import { WelcomeMascotBlock } from './WelcomeMascotBlock';
import { WelcomePortrait } from './WelcomePortrait';

export type WelcomeHeroBandProps = {
  onLogIn: () => void;
};

/**
 * Exact prototype welcome hero (402×460 device coords):
 * mint #DCEBD3, clouds, hill, nav @ 62/22, portrait, sheep+bubble.
 */
export function WelcomeHeroBand({ onLogIn }: WelcomeHeroBandProps) {
  return (
    <View style={styles.hero}>
      <View style={[styles.cloud, styles.cloudA]} />
      <View style={[styles.cloud, styles.cloudB]} />
      <View style={styles.hill} />
      <View style={styles.nav}>
        <WelcomeHeader onLogIn={onLogIn} />
      </View>
      <WelcomePortrait />
      <WelcomeMascotBlock />
    </View>
  );
}

const styles = StyleSheet.create({
  hero: {
    height: 460,
    backgroundColor: colors.hero,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    overflow: 'hidden',
  },
  cloud: {
    position: 'absolute',
    borderRadius: 99,
    backgroundColor: colors.surface,
  },
  cloudA: {
    left: 30,
    top: 120,
    width: 70,
    height: 22,
    opacity: 0.7,
  },
  cloudB: {
    right: 120,
    top: 78,
    width: 48,
    height: 16,
    opacity: 0.6,
  },
  hill: {
    position: 'absolute',
    left: '-12%',
    right: '-12%',
    bottom: -78,
    height: 198,
    backgroundColor: colors.hill,
    borderTopLeftRadius: 999,
    borderTopRightRadius: 999,
  },
  nav: {
    position: 'absolute',
    top: 62,
    left: 22,
    right: 22,
    zIndex: 4,
  },
});
