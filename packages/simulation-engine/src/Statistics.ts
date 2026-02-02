/**
 * Statistical functions for latency analysis
 */

/**
 * Calculate a specific percentile from an array of values.
 * Uses linear interpolation between closest ranks.
 */
export function calculatePercentile(
  data: number[],
  percentile: number
): number {
  if (data.length === 0) {
    return NaN;
  }

  if (data.length === 1) {
    return data[0];
  }

  const sorted = [...data].sort((a, b) => a - b);
  const index = percentile * (sorted.length - 1);
  const lower = Math.floor(index);
  const upper = Math.ceil(index);

  if (lower === upper) {
    return sorted[lower];
  }

  // Linear interpolation
  const fraction = index - lower;
  return sorted[lower] + fraction * (sorted[upper] - sorted[lower]);
}

/**
 * Calculate p50, p95, p99 percentiles from an array of latency values.
 */
export function calculatePercentiles(data: number[]): {
  p50: number;
  p95: number;
  p99: number;
} {
  return {
    p50: calculatePercentile(data, 0.5),
    p95: calculatePercentile(data, 0.95),
    p99: calculatePercentile(data, 0.99),
  };
}
