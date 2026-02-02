import { Component } from './Component';
import { sampleNormal } from '../Probability';

export interface NetworkConfig {
  /** Mean one-way latency in seconds */
  meanLatency: number;
  /** Standard deviation of latency in seconds */
  stddev: number;
  /** Probability of packet loss (0 to 1) */
  packetLossRate: number;
}

/**
 * Models network latency with jitter and packet loss.
 * Latency follows normal distribution.
 * Packet loss triggers retries (each retry incurs full latency).
 */
export class NetworkComponent implements Component {
  name = 'Network';

  constructor(private config: NetworkConfig) {}

  processRequest(): number {
    let totalLatency = 0;

    // Keep trying until packet gets through
    while (true) {
      // Sample latency from normal distribution, clamp to positive
      const latency = Math.max(
        0.0001, // Minimum 0.1ms
        sampleNormal(this.config.meanLatency, this.config.stddev)
      );
      totalLatency += latency;

      // Check if packet was lost
      if (Math.random() >= this.config.packetLossRate) {
        // Packet succeeded
        break;
      }
      // Packet lost, retry
    }

    return totalLatency;
  }
}
