import { Component } from './Component';
import { calculatePercentiles } from '../Statistics';

export interface TopologyResult {
  p50: number;
  p95: number;
  p99: number;
  packetCount: number;
}

/**
 * Chains multiple components together to form a topology.
 * Total latency is the sum of all component latencies.
 */
export class Topology {
  constructor(private components: Component[]) {}

  /**
   * Process a single request through all components.
   * @returns Total latency in seconds
   */
  processRequest(): number {
    return this.components.reduce(
      (total, component) => total + component.processRequest(),
      0
    );
  }

  /**
   * Run simulation with given number of packets.
   * @param packetCount Number of requests to simulate
   * @returns Percentile results
   */
  simulate(packetCount: number): TopologyResult {
    const latencies = Array.from({ length: packetCount }, () =>
      this.processRequest()
    );

    const percentiles = calculatePercentiles(latencies);

    return {
      ...percentiles,
      packetCount,
    };
  }

  /**
   * Get component names in order.
   */
  getComponentNames(): string[] {
    return this.components.map(c => c.name);
  }
}
