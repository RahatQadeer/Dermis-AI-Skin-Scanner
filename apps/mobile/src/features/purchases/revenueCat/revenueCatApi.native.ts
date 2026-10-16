import Purchases, { LOG_LEVEL, PACKAGE_TYPE, type PurchasesPackage } from 'react-native-purchases';

import { PRO_ENTITLEMENT_ID } from '../constants';
import type { PaywallPackageMap, StorePackageRef } from '../lib/paywallPackages';
import type { RevenueCatConfigureResult } from './revenueCatApi';

export async function configureRevenueCat(apiKey: string): Promise<RevenueCatConfigureResult> {
  try {
    if (__DEV__) {
      Purchases.setLogLevel(LOG_LEVEL.DEBUG);
    }
    Purchases.configure({ apiKey });
    return { ok: true };
  } catch {
    return { ok: false, reason: 'configure_failed' };
  }
}

export async function logInRevenueCat(appUserId: string): Promise<void> {
  await Purchases.logIn(appUserId);
}

export async function logOutRevenueCat(): Promise<void> {
  await Purchases.logOut();
}

export async function fetchPaywallPackages(): Promise<PaywallPackageMap> {
  const offerings = await Purchases.getOfferings();
  const current = offerings.current;
  if (!current) {
    return { annual: null, monthly: null };
  }
  return {
    annual: findPackage(current.availablePackages, PACKAGE_TYPE.ANNUAL),
    monthly: findPackage(current.availablePackages, PACKAGE_TYPE.MONTHLY),
  };
}

export async function purchaseStorePackage(
  identifier: string,
): Promise<'success' | 'cancelled' | 'error'> {
  try {
    const offerings = await Purchases.getOfferings();
    const pkg = offerings.current?.availablePackages.find((p) => p.identifier === identifier);
    if (!pkg) {
      return 'error';
    }
    await Purchases.purchasePackage(pkg);
    return 'success';
  } catch (error: unknown) {
    if (isUserCancelled(error)) {
      return 'cancelled';
    }
    return 'error';
  }
}

export async function restoreRevenueCatPurchases(): Promise<'restored' | 'none' | 'error'> {
  try {
    const info = await Purchases.restorePurchases();
    const active = Object.keys(info.entitlements.active);
    return active.includes(PRO_ENTITLEMENT_ID) ? 'restored' : 'none';
  } catch {
    return 'error';
  }
}

export async function fetchActiveEntitlementIds(): Promise<string[]> {
  const info = await Purchases.getCustomerInfo();
  return Object.keys(info.entitlements.active);
}

function findPackage(
  packages: PurchasesPackage[],
  type: (typeof PACKAGE_TYPE)[keyof typeof PACKAGE_TYPE],
): StorePackageRef | null {
  const match = packages.find((p) => p.packageType === type);
  if (!match) {
    return null;
  }
  return toStorePackageRef(match);
}

function toStorePackageRef(pkg: PurchasesPackage): StorePackageRef {
  const packageType =
    pkg.packageType === PACKAGE_TYPE.ANNUAL
      ? 'ANNUAL'
      : pkg.packageType === PACKAGE_TYPE.MONTHLY
        ? 'MONTHLY'
        : 'UNKNOWN';
  return {
    identifier: pkg.identifier,
    priceString: pkg.product.priceString,
    priceAmount: pkg.product.price,
    packageType,
  };
}

function isUserCancelled(error: unknown): boolean {
  if (typeof error !== 'object' || error === null) {
    return false;
  }
  const userCancelled = (error as { userCancelled?: boolean }).userCancelled;
  return userCancelled === true;
}
