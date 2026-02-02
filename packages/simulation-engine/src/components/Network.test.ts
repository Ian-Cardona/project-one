import { describe, test, expect } from 'vitest';
import { NetworkComponent, NetworkConfig } from './Network';

describe('NetworkComponent', () => {
  describe('latency distribution', () => {
    test('mean latency approximates configured mean', () => {
      const config: NetworkConfig = {
        meanLatency: 0.110, // 110ms in seconds
        stddev: 0.006,      // 6ms
        packetLossRate: 0,
      };
      const network = new NetworkComponent(config);

      const samples = Array.from({ length: 5000 }, () => network.processRequest());
      const mean = samples.reduce((a, b) => a + b, 0) / samples.length;

      expect(mean).toBeCloseTo(0.110, 2);
    });

    test('stddev approximates configured stddev', () => {
      const config: NetworkConfig = {
        meanLatency: 0.110,
        stddev: 0.010, // 10ms for easier testing
        packetLossRate: 0,
      };
      const network = new NetworkComponent(config);

      const samples = Array.from({ length: 5000 }, () => network.processRequest());
      const mean = samples.reduce((a, b) => a + b, 0) / samples.length;
      const variance = samples.reduce((a, b) => a + (b - mean) ** 2, 0) / samples.length;
      const stddev = Math.sqrt(variance);

      expect(stddev).toBeCloseTo(0.010, 2);
    });

    test('latency is always positive (clamps negative samples)', () => {
      const config: NetworkConfig = {
        meanLatency: 0.005, // 5ms - close to zero
        stddev: 0.010,      // 10ms - high variance, will generate negatives
        packetLossRate: 0,
      };
      const network = new NetworkComponent(config);

      const samples = Array.from({ length: 1000 }, () => network.processRequest());
      expect(samples.every(s => s > 0)).toBe(true);
    });
  });

  describe('packet loss', () => {
    test('packet loss adds retry latency', () => {
      const config: NetworkConfig = {
        meanLatency: 0.100,
        stddev: 0.001, // Low variance for predictable testing
        packetLossRate: 0.5, // 50% loss rate
      };
      const network = new NetworkComponent(config);

      const samples = Array.from({ length: 1000 }, () => network.processRequest());
      const mean = samples.reduce((a, b) => a + b, 0) / samples.length;

      // With 50% loss, average attempts = 2, so mean should be ~200ms
      // (geometric distribution: E[attempts] = 1/(1-p) = 1/0.5 = 2)
      expect(mean).toBeGreaterThan(0.150);
    });

    test('zero packet loss has no retries', () => {
      const config: NetworkConfig = {
        meanLatency: 0.100,
        stddev: 0.001,
        packetLossRate: 0,
      };
      const network = new NetworkComponent(config);

      const samples = Array.from({ length: 1000 }, () => network.processRequest());
      const mean = samples.reduce((a, b) => a + b, 0) / samples.length;

      expect(mean).toBeCloseTo(0.100, 2);
    });
  });

  describe('component interface', () => {
    test('has name property', () => {
      const network = new NetworkComponent({
        meanLatency: 0.100,
        stddev: 0.010,
        packetLossRate: 0,
      });

      expect(network.name).toBe('Network');
    });
  });
});
