import { useWindowDimensions } from 'react-native';

import { NARROW_SCREEN_WIDTH, SHORT_SCREEN_HEIGHT, type Responsive } from './responsive';

/** Live viewport descriptor used to adapt layout to small/narrow devices. */
export function useResponsive(): Responsive {
  const { width, height } = useWindowDimensions();
  return {
    width,
    height,
    short: height <= SHORT_SCREEN_HEIGHT,
    narrow: width < NARROW_SCREEN_WIDTH,
  };
}
