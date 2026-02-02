import { EventQueue, SimulationEvent } from './EventQueue';
import { calculatePercentiles } from './Statistics';
import { calculateUtilization } from './QueueingModel';

export interface SimulationConfig {
  arrivalRate: number;  // λ: requests per second
  serviceRate: number;  // μ: requests per second
  packetCount: number;  // number of packets to simulate
}

export interface SimulationResult {
  p50: number;
  p95: number;
  p99: number;
  packetCount: number;
  utilization: number;
}

interface PacketState {
  arrivalTime: number;
}

/**
 * Sample from exponential distribution.
 * Used for inter-arrival times and service times in M/M/1.
 */
function exponentialRandom(rate: number): number {
  return -Math.log(Math.random()) / rate;
}

/**
 * Run discrete event simulation of M/M/1 queue.
 */
export function simulate(config: SimulationConfig): SimulationResult {
  const { arrivalRate, serviceRate, packetCount } = config;

  const queue = new EventQueue();
  const packets = new Map<number, PacketState>();
  const latencies: number[] = [];

  let currentTime = 0;
  let serverBusyUntil = 0;

  // Schedule all arrivals upfront using Poisson process
  let arrivalTime = 0;
  for (let i = 0; i < packetCount; i++) {
    arrivalTime += exponentialRandom(arrivalRate);
    queue.push({
      time: arrivalTime,
      type: 'ARRIVAL',
      packetId: i,
    });
  }

  // Process events
  while (!queue.isEmpty()) {
    const event = queue.pop()!;
    currentTime = event.time;

    if (event.type === 'ARRIVAL') {
      // Record arrival time
      packets.set(event.packetId, { arrivalTime: currentTime });

      // Determine when service starts (now if server free, else when server free)
      const serviceStartTime = Math.max(currentTime, serverBusyUntil);
      const serviceTime = exponentialRandom(serviceRate);
      const departureTime = serviceStartTime + serviceTime;

      // Update server busy time
      serverBusyUntil = departureTime;

      // Schedule departure
      queue.push({
        time: departureTime,
        type: 'DEPARTURE',
        packetId: event.packetId,
      });
    } else if (event.type === 'DEPARTURE') {
      // Calculate latency (total time in system)
      const packetState = packets.get(event.packetId)!;
      const latency = currentTime - packetState.arrivalTime;
      latencies.push(latency);

      // Clean up
      packets.delete(event.packetId);
    }
  }

  // Calculate percentiles
  const percentiles = calculatePercentiles(latencies);

  return {
    ...percentiles,
    packetCount,
    utilization: calculateUtilization(arrivalRate, serviceRate),
  };
}
