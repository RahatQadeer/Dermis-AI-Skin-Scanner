import { json } from '../http/respond';
import type { AuthenticatedUser } from '../auth/AuthPort';

export function handleAuthMe(user: AuthenticatedUser): Response {
  return json({
    user: {
      id: user.id,
      email: user.email,
      firstName: user.firstName ?? null,
    },
  });
}
