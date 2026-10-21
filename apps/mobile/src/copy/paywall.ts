/** Paywall strings — prices come from the store at runtime (DERM-052). D3 disclosures: DERM-065. */
export const paywallCopy = {
  title: 'Dermis Pro',
  headline: 'Track every change your skin makes.',
  freeTierLine: 'Free: 1 scan total, baseline Skin Health Index',
  proTierLine: 'Pro: 5 scans per day, full reports on each Pro scan',
  proBadge: 'PRO',
  projectedIndexLabel: 'YOUR PROJECTED INDEX',
  projectedBasis: 'Modelled on similar skin profiles',
  projectedFrom: '62',
  projectedTo: '78',
  projectedHorizon: 'in 12 weeks',
  projectedConcerns: ['Pores 55 → 71', 'Texture 57 → 74', 'Dark spots 67 → 79'] as const,
  tierFreeLabel: 'FREE',
  tierFreeValue: '1',
  tierFreeUnit: 'scan total',
  tierFreeNote: 'Your baseline report',
  tierProLabel: 'PRO',
  tierProValue: '5',
  tierProUnit: 'scans per day',
  tierProNote: 'Resets at midnight',
  features: [
    {
      title: '5 scans per day',
      body: 'Free includes 1 scan. Pro resets your 5 daily scans at midnight.',
    },
    { title: 'Zone map on every Pro scan', body: 'All 6 concerns across 6 facial zones.' },
    { title: 'Progress tracking and trends', body: 'See how each concern changes week over week.' },
    { title: 'Shareable PDF report', body: 'Export a clean summary for your next appointment.' },
  ] as const,
  compareTitle: 'What’s included',
  compareFreeTitle: 'Free',
  compareProTitle: 'Pro',
  compareFreeItems: [
    '1 scan total',
    'Baseline Skin Health Index',
    'One priority concern preview',
  ] as const,
  compareProItems: [
    '5 scans per day',
    'Full concern scores + zone map on each Pro scan',
    'Routine tracking and progress',
  ] as const,
  restore: 'Restore purchases',
  terms: 'Terms of Use',
  privacy: 'Privacy Policy',
  autoRenews:
    'Your subscription renews automatically until you cancel in your App Store or Google Play account settings.',
  cancelHint: 'Cancel anytime in your App Store or Google Play subscription settings.',
  chargeToAccount:
    'Payment will be charged to your Apple ID or Google Play account upon confirmation of purchase.',
  renewWindow:
    'Your account is charged within 24 hours before the end of the current period unless you cancel first.',
  billingSummaryAnnual: (price: string) =>
    `${price} per year after any free trial. Auto-renewing annual subscription.`,
  billingSummaryMonthly: (price: string) =>
    `${price} per month. Auto-renewing monthly subscription.`,
  annualPlan: 'Annual',
  monthlyPlan: 'Monthly',
  perYear: 'per year',
  perMonth: 'per month',
  trialNote: '7-day free trial',
  trialTimeline:
    'Annual plan: 7-day free trial, then billed yearly at the price shown unless cancelled before the trial ends. Monthly plan has no trial in the current offer.',
  lockedHint: 'Pro feature',
  lockedA11y: 'Locked. Unlock with Pro.',
  startTrialCta: 'Start free trial',
  subscribeMonthlyCta: 'Subscribe',
  /** Layout-only reference until RevenueCat provides localized prices. */
  mockPriceAnnual: '$49.99',
  mockPriceMonthly: '$9.99',
  billingUnavailable:
    'Store billing is not connected yet. Sign in with email, or use a preview build with testing unlock enabled.',
  offeringsUnavailable: 'Plans are unavailable right now. Try again in a moment.',
  purchaseError: 'Purchase could not be completed. Try again or use Restore Purchases.',
  purchaseSuccess: 'Pro unlocked — enjoy your plan.',
  restoreSuccess: 'Purchases restored.',
  restoreEmpty: 'No active subscription found for this account.',
  restoreError: 'Restore failed. Try again later.',
  legalUnavailableToast: 'Add Privacy and Terms URLs in env to open these links.',
  and: 'and',
} as const;

/** Badge from localized annual vs monthly prices — never hard-code a discount percent. */
export function savingsBadgeLabel(percent: number): string {
  return `SAVE ${percent}%`;
}
