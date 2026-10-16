export type CostLogEntry = {
  requestId: string;
  userId: string;
  model: string;
  promptVersion: string;
  promptTokenCount?: number;
  candidatesTokenCount?: number;
  totalTokenCount?: number;
  /** Rough USD estimate; override rates via env later. */
  estimatedCostUsd?: number;
};

/** Placeholder rates — TODO(spec): confirm billing tier. */
const USD_PER_1K_INPUT = 0.0001;
const USD_PER_1K_OUTPUT = 0.0004;

export function estimateCostUsd(usage: {
  promptTokenCount?: number;
  candidatesTokenCount?: number;
}): number | undefined {
  const input = usage.promptTokenCount;
  const output = usage.candidatesTokenCount;
  if (input == null && output == null) {
    return undefined;
  }
  const inCost = ((input ?? 0) / 1000) * USD_PER_1K_INPUT;
  const outCost = ((output ?? 0) / 1000) * USD_PER_1K_OUTPUT;
  return Number((inCost + outCost).toFixed(6));
}

export function logScanCost(
  entry: CostLogEntry,
  sink: (line: string) => void = console.info,
): void {
  sink(
    JSON.stringify({
      type: 'scan_cost',
      ...entry,
    }),
  );
}
