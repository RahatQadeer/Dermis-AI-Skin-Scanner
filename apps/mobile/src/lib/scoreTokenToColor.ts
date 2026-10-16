import { colors } from '@/src/theme';
import type { ScoreColorToken } from '@dermis/domain';

/** Maps domain score colour tokens to theme hex (theme is the only hex owner). */
export function scoreTokenToColor(token: ScoreColorToken): string {
  switch (token) {
    case 'green':
      return colors.green;
    case 'sky':
      return colors.sky;
    case 'amber':
    default:
      return colors.amber;
  }
}
