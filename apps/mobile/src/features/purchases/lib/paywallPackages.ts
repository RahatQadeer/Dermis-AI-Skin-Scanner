import type { PlanKind } from '@/src/components/PlanCard';

import { PRO_ENTITLEMENT_ID } from '../constants';

export type StorePackageRef = {
  identifier: string;
  priceString: string;
  priceAmount: number;
  packageType: 'ANNUAL' | 'MONTHLY' | 'UNKNOWN';
};

export type PaywallPackageMap = {
  annual: StorePackageRef | null;
  monthly: StorePackageRef | null;
};

export function packageForPlan(map: PaywallPackageMap, plan: PlanKind): StorePackageRef | null {
  return plan === 'annual' ? map.annual : map.monthly;
}

export function hasActiveProEntitlement(activeEntitlementIds: readonly string[]): boolean {
  return activeEntitlementIds.includes(PRO_ENTITLEMENT_ID);
}
