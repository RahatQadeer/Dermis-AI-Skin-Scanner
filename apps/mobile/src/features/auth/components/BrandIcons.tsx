import Svg, { Path } from 'react-native-svg';

import { colors } from '@/src/theme';

export function AppleIcon({
  size = 18,
  color = colors.surface,
}: {
  size?: number;
  color?: string;
}) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" accessibilityRole="image">
      <Path
        fill={color}
        d="M17.05 12.04c-.03-2.26 1.85-3.34 1.93-3.4-1.05-1.54-2.69-1.75-3.27-1.77-1.39-.14-2.72.82-3.43.82-.71 0-1.8-.8-2.96-.78-1.52.02-2.93.88-3.71 2.24-1.58 2.74-.4 6.8 1.13 9.03.75 1.09 1.64 2.32 2.81 2.27 1.13-.04 1.55-.73 2.92-.73 1.36 0 1.75.73 2.95.71 1.22-.02 1.99-1.11 2.73-2.21.86-1.27 1.22-2.5 1.24-2.56-.03-.01-2.38-.91-2.41-3.62zM14.9 5.6c.63-.76 1.05-1.82.93-2.88-.9.04-1.99.6-2.64 1.36-.58.67-1.09 1.75-.95 2.78 1 .08 2.03-.51 2.66-1.26z"
      />
    </Svg>
  );
}

export function GoogleIcon({ size = 18 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" accessibilityRole="image">
      <Path
        fill={colors.googleBlue}
        d="M23.5 12.27c0-.79-.07-1.54-.2-2.27H12v4.3h6.46c-.28 1.5-1.12 2.77-2.39 3.62v3h3.86c2.26-2.08 3.57-5.15 3.57-8.65z"
      />
      <Path
        fill={colors.googleGreen}
        d="M12 24c3.24 0 5.95-1.07 7.93-2.9l-3.86-3c-1.07.72-2.45 1.15-4.07 1.15-3.13 0-5.78-2.11-6.73-4.96H1.3v3.1A11.99 11.99 0 0 0 12 24z"
      />
      <Path
        fill={colors.googleYellow}
        d="M5.27 14.29c-.24-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29v-3.1H1.3A11.99 11.99 0 0 0 0 12c0 1.94.46 3.77 1.3 5.39l3.97-3.1z"
      />
      <Path
        fill={colors.googleRed}
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.3 6.61l3.97 3.1C6.22 6.86 8.87 4.75 12 4.75z"
      />
    </Svg>
  );
}
