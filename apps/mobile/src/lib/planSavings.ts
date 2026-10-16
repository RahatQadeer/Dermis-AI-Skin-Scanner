/**
 * Savings vs paying monthly × 12. Returns null when annual is not cheaper.
 * Amounts must be numeric store prices in the same currency.
 */
export function computeSavingsPercent(annualAmount: number, monthlyAmount: number): number | null {
  if (!Number.isFinite(annualAmount) || !Number.isFinite(monthlyAmount) || monthlyAmount <= 0) {
    return null;
  }

  const fullYearMonthly = monthlyAmount * 12;
  if (fullYearMonthly <= annualAmount) {
    return null;
  }

  return Math.round(((fullYearMonthly - annualAmount) / fullYearMonthly) * 100);
}
