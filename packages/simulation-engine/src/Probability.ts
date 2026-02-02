/**
 * Probability distributions for simulation.
 */

/**
 * Sample from exponential distribution.
 * Used for inter-arrival times and service times in M/M/1.
 *
 * @param rate - λ (events per unit time)
 * @returns Sample from Exp(rate)
 */
export function sampleExponential(rate: number): number {
  return -Math.log(Math.random()) / rate;
}

/**
 * Sample from normal distribution using Box-Muller transform.
 * Used for network jitter.
 *
 * @param mean - μ (center of distribution)
 * @param stddev - σ (spread of distribution)
 * @returns Sample from N(mean, stddev²)
 */
export function sampleNormal(mean: number, stddev: number): number {
  const u1 = Math.random();
  const u2 = Math.random();
  const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  return mean + z * stddev;
}

/**
 * Sample from bimodal distribution (two fixed values).
 * Used for cold start modeling.
 *
 * @param lowValue - Value returned with probability (1 - highProbability)
 * @param highValue - Value returned with probability highProbability
 * @param highProbability - Probability of returning highValue
 * @returns Either lowValue or highValue
 */
export function sampleBimodal(
  lowValue: number,
  highValue: number,
  highProbability: number
): number {
  return Math.random() < highProbability ? highValue : lowValue;
}
