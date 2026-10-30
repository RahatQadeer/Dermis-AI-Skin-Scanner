import { isApiError } from '@/src/lib/api/errors';

import type { assistantCopy } from '@/src/copy/screens/assistant';

type Key = keyof typeof assistantCopy;

/** Server/client error → message key (pure, unit-testable). */
export function assistantErrorKey(error: unknown): Key {
  if (!isApiError(error)) {
    return 'errorUnavailable';
  }
  switch (error.code) {
    case 'assistant_daily_limit':
      return 'errorDailyLimit';
    case 'assistant_not_configured':
      return 'errorNotConfigured';
    case 'network_unreachable':
      return 'errorOffline';
    default:
      return 'errorUnavailable';
  }
}
