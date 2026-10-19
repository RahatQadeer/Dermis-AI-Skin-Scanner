import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { PartyConfetti } from '@/src/components/celebration/PartyConfetti';
import { Toast, type ToastProps } from '@/src/components/Toast';

export type ToastHostProps = ToastProps & {
  /** Confetti on success toasts only (default true). */
  celebrate?: boolean;
};

/**
 * Full-screen overlay for Toast + a short sparkle burst when a message appears.
 */
export function ToastHost({ celebrate = true, ...props }: ToastHostProps) {
  const [burstKey, setBurstKey] = useState(0);

  useEffect(() => {
    if (!celebrate || !props.visible || !props.message) {
      return;
    }
    setBurstKey((n) => n + 1);
  }, [celebrate, props.visible, props.message]);

  return (
    <View pointerEvents="box-none" style={styles.host}>
      <PartyConfetti active={celebrate && props.visible && burstKey > 0} burstKey={burstKey} />
      <Toast {...props} />
    </View>
  );
}

const styles = StyleSheet.create({
  host: {
    ...StyleSheet.absoluteFill,
    zIndex: 200,
    elevation: 200,
  },
});
