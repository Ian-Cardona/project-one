/**
 * M/M/1 Queueing Model calculations
 *
 * λ = arrival rate (requests/second)
 * μ = service rate (requests/second)
 * ρ = utilization (0 to 1)
 */

export function calculateUtilization(
  arrivalRate: number,
  serviceRate: number
): number {
  return arrivalRate / serviceRate;
}

export function calculateAverageWait(
  arrivalRate: number,
  serviceRate: number
): number {
  return 1 / (serviceRate - arrivalRate);
}

export function calculateAverageQueueLength(
  arrivalRate: number,
  serviceRate: number
): number {
  const rho = calculateUtilization(arrivalRate, serviceRate);
  return rho / (1 - rho);
}
