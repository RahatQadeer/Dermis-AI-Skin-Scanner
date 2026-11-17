import { useCallback, useEffect, useRef, useState, type ComponentRef } from 'react';
import { useWindowDimensions, View, type LayoutChangeEvent } from 'react-native';

import { spacing } from '@/src/theme';

/** Keep tip bubbles inside the screen with a safe gutter. */
const SCREEN_GUTTER = spacing.lg;

/** Clamp tip width/side so the bubble never runs off the screen. */
export function useSafeOverlayBubble(enabled: boolean) {
  const { width: screenW } = useWindowDimensions();
  const hostRef = useRef<ComponentRef<typeof View>>(null);
  const [box, setBox] = useState({ x: 0, width: 0 });

  const measure = useCallback(() => {
    if (!enabled) return;
    hostRef.current?.measureInWindow((x, _y, width) => {
      setBox({ x, width });
    });
  }, [enabled]);

  const onLayout = (_e: LayoutChangeEvent) => {
    measure();
  };

  useEffect(() => {
    if (!enabled) return;
    measure();
  }, [enabled, screenW, measure]);

  const sheepRight = box.x + box.width;
  const roomLeft = Math.max(0, sheepRight - SCREEN_GUTTER);
  const roomRight = Math.max(0, screenW - box.x - SCREEN_GUTTER);
  // Prefer growing toward the side with more room (right-side sheep → grow left).
  const alignEnd = box.width === 0 ? true : roomLeft >= roomRight;
  const available = box.width === 0 ? screenW - SCREEN_GUTTER * 2 : alignEnd ? roomLeft : roomRight;
  const maxWidth = Math.min(250, Math.max(160, available));

  return { hostRef, onLayout, measure, alignEnd, maxWidth };
}
