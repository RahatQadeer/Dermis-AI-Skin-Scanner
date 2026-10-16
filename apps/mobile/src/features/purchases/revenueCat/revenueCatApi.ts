import type { PaywallPackageMap } from '../lib/paywallPackages';

export type RevenueCatConfigureResult =
  { ok: true } | { ok: false; reason: 'unsupported' | 'configure_failed' };

/** Default (web / typecheck): native module overrides via `revenueCatApi.native.ts`. */
export async function configureRevenueCat(_apiKey: string): Promise<RevenueCatConfigureResult> {
  return { ok: false, reason: 'unsupported' };
}

export async function logInRevenueCat(_appUserId: string): Promise<void> {}

export async function logOutRevenueCat(): Promise<void> {}

export async function fetchPaywallPackages(): Promise<PaywallPackageMap> {
  return { annual: null, monthly: null };
}

export async function purchaseStorePackage(
  _identifier: string,
): Promise<'success' | 'cancelled' | 'error'> {
  return 'error';
}

export async function restoreRevenueCatPurchases(): Promise<'restored' | 'none' | 'error'> {
  return 'error';
}

export async function fetchActiveEntitlementIds(): Promise<string[]> {
  return [];
}
