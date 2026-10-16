import { colors } from '../theme/colors';
import { radii } from '../theme/radii';
import { spacing } from '../theme/spacing';
import { touchTargets } from '../theme/touchTargets';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'outline' | 'danger';
export type ButtonSize = 'md' | 'lg';

export type ButtonVisualState = {
  backgroundColor: string;
  borderColor: string;
  textColor: string;
  borderWidth: number;
  minHeight: number;
  paddingHorizontal: number;
  opacity: number;
};

export function resolveButtonVisual(input: {
  variant: ButtonVariant;
  size: ButtonSize;
  disabled: boolean;
}): ButtonVisualState {
  const minHeight = input.size === 'lg' ? spacing.huge : touchTargets.min;
  const paddingHorizontal = input.size === 'lg' ? spacing.xl : spacing.lg;
  const base = variantColors(input.variant);

  return {
    ...base,
    minHeight,
    paddingHorizontal,
    opacity: input.disabled ? 0.45 : 1,
  };
}

function variantColors(
  variant: ButtonVariant,
): Omit<ButtonVisualState, 'minHeight' | 'paddingHorizontal' | 'opacity'> {
  switch (variant) {
    case 'secondary':
      return {
        backgroundColor: colors.surface,
        borderColor: colors.border,
        textColor: colors.ink,
        borderWidth: 1,
      };
    case 'ghost':
      return {
        backgroundColor: 'transparent',
        borderColor: 'transparent',
        textColor: colors.green,
        borderWidth: 0,
      };
    case 'outline':
      return {
        backgroundColor: 'transparent',
        borderColor: colors.green,
        textColor: colors.green,
        borderWidth: 1.5,
      };
    case 'danger':
      return {
        backgroundColor: colors.red,
        borderColor: colors.red,
        textColor: colors.surface,
        borderWidth: 0,
      };
    case 'primary':
    default:
      return {
        backgroundColor: colors.green,
        borderColor: colors.green,
        textColor: colors.surface,
        borderWidth: 0,
      };
  }
}

export const buttonRadii = radii.lg;
