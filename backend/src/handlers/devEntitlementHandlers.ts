import { json } from '../http/respond';
import type { EntitlementService } from '../services/entitlementService';

/** POST /v1/dev/entitlements/pro — gated by AppDeps.devEntitlements. */
export async function handleDevGrantPro(
  entitlements: EntitlementService,
  userId: string,
): Promise<Response> {
  const row = await entitlements.grantProForUser(userId);
  return json({ plan: row.plan });
}
