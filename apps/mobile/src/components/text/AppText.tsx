import { Text, type TextProps, type TextStyle } from 'react-native';

import { colors, textStyles } from '@/src/theme';

export type AppTextVariant = keyof typeof textStyles;

export type AppTextProps = TextProps & {
  variant?: AppTextVariant;
  color?: string;
  align?: TextStyle['textAlign'];
};

export function AppText({
  variant = 'body',
  color = colors.ink,
  align,
  style,
  ...rest
}: AppTextProps) {
  return <Text style={[textStyles[variant], { color, textAlign: align }, style]} {...rest} />;
}
