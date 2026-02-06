import { describe, test, expect } from 'vitest';
import { Topology } from './Topology';
import { NetworkComponent } from './Network';
import { LambdaComponent } from './Lambda';
import { DynamoDBComponent } from './DynamoDB';
import { calculatePercentiles } from '../core/Statistics';

describe('Topology', () => {
  describe('single component', () => {
    test('latency equals component latency', () => {
      const network = new NetworkComponent({
        meanLatency: 0.100,
        stddev: 0.001,
        packetLossRate: 0,
      });

      const topology = new Topology([network]);
      const samples = Array.from({ length: 1000 }, () => topology.processRequest());
      const mean = samples.reduce((a, b) => a + b, 0) / samples.length;

      expect(mean).toBeCloseTo(0.100, 2);
    });
  });

  describe('chained components', () => {
    test('latencies add up', () => {
      const network = new NetworkComponent({
        meanLatency: 0.100,
        stddev: 0.001,
        packetLossRate: 0,
      });

      const lambda = new LambdaComponent({
        warmLatency: 0.010,
        warmStddev: 0.001,
        coldStartLatency: 0.300,
        coldStartProbability: 0, // No cold starts
      });

      const dynamo = new DynamoDBComponent({
        meanLatency: 0.005,
        stddev: 0.001,
      });

      // Total expected: 100ms + 10ms + 5ms = 115ms
      const topology = new Topology([network, lambda, dynamo]);
      const samples = Array.from({ length: 1000 }, () => topology.processRequest());
      const mean = samples.reduce((a, b) => a + b, 0) / samples.length;

      expect(mean).toBeCloseTo(0.115, 2);
    });

    test('round trip doubles network latency', () => {
      const networkOut = new NetworkComponent({
        meanLatency: 0.100,
        stddev: 0.001,
        packetLossRate: 0,
      });

      const lambda = new LambdaComponent({
        warmLatency: 0.010,
        warmStddev: 0.001,
        coldStartLatency: 0.300,
        coldStartProbability: 0,
      });

      const networkBack = new NetworkComponent({
        meanLatency: 0.100,
        stddev: 0.001,
        packetLossRate: 0,
      });

      // Total expected: 100ms + 10ms + 100ms = 210ms
      const topology = new Topology([networkOut, lambda, networkBack]);
      const samples = Array.from({ length: 1000 }, () => topology.processRequest());
      const mean = samples.reduce((a, b) => a + b, 0) / samples.length;

      expect(mean).toBeCloseTo(0.210, 2);
    });
  });

  describe('simulate method', () => {
    test('returns percentiles', () => {
      const network = new NetworkComponent({
        meanLatency: 0.100,
        stddev: 0.010,
        packetLossRate: 0,
      });

      const topology = new Topology([network]);
      const result = topology.simulate(1000);

      expect(result.p50).toBeGreaterThan(0);
      expect(result.p95).toBeGreaterThan(result.p50);
      expect(result.p99).toBeGreaterThan(result.p95);
      expect(result.packetCount).toBe(1000);
    });
  });

  describe('realistic manila to singapore topology', () => {
    test('cold starts dominate p99', () => {
      const networkOut = new NetworkComponent({
        meanLatency: 0.055, // 55ms one way
        stddev: 0.003,
        packetLossRate: 0.001,
      });

      const lambda = new LambdaComponent({
        warmLatency: 0.008,
        coldStartLatency: 0.265,
        coldStartProbability: 0.10, // 10% cold starts
      });

      const dynamo = new DynamoDBComponent({
        meanLatency: 0.005,
        stddev: 0.003,
      });

      const networkBack = new NetworkComponent({
        meanLatency: 0.055,
        stddev: 0.003,
        packetLossRate: 0.001,
      });

      const topology = new Topology([networkOut, lambda, dynamo, networkBack]);
      const result = topology.simulate(5000);

      // p50 should be ~123ms (55 + 8 + 5 + 55) - warm path
      // p99 should be higher due to cold starts
      expect(result.p50).toBeLessThan(0.200);
      expect(result.p99).toBeGreaterThan(result.p50 * 1.5); // Cold starts inflate p99
    });
  });
});
