/** Build SVG polyline points for a 0–100 trend series. */
export function buildPolyline(
  values: readonly number[],
  width: number,
  height: number,
  pad: number,
): string {
  if (values.length === 0) {
    return '';
  }
  return values
    .map((value, index) => {
      const x = xForIndex(index, values.length, width, pad);
      const y = yForValue(value, height, pad);
      return `${x},${y}`;
    })
    .join(' ');
}

export function xForIndex(index: number, count: number, width: number, pad: number): number {
  if (count <= 1) {
    return width / 2;
  }
  return pad + (index / (count - 1)) * (width - pad * 2);
}

export function yForValue(value: number, height: number, pad: number): number {
  const usable = height - pad * 2;
  return pad + usable * (1 - value / 100);
}
