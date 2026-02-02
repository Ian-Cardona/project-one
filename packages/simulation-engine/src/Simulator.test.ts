import { describe, test, expect } from 'vitest';
import { simulate, SimulationConfig, SimulationResult } from './Simulator';
import { calculatePercentileLatency } from './QueueingModel';

describe('Simulator', () => {
  describe('basic execution', () => {
    test('completes without errors', () => {
      const config: SimulationConfig = {
        arrivalRate: 800,
        serviceRate: 1000,
        packetCount: 100,
      };

      const result = simulate(config);

      expect(result).toBeDefined();
      expect(result.p50).toBeGreaterThan(0);
      expect(result.p95).toBeGreaterThan(0);
      expect(result.p99).toBeGreaterThan(0);
    });

    test('p99 > p95 > p50', () => {
      const result = simulate({
        arrivalRate: 800,
        serviceRate: 1000,
        packetCount: 500,
      });

      expect(result.p99).toBeGreaterThan(result.p95);
      expect(result.p95).toBeGreaterThan(result.p50);
    });
  });

  describe('M/M/1 validation', () => {
    // Monte Carlo simulation has inherent variance.
    // These tests verify the simulation is in the right ballpark.
    // Gate 4 (real-world validation) is the true accuracy test.

    test('p50 within 25% of theoretical (λ=800, μ=1000)', () => {
      const config: SimulationConfig = {
        arrivalRate: 800,
        serviceRate: 1000,
        packetCount: 10000,
      };

      const result = simulate(config);
      const theoretical = calculatePercentileLatency(800, 1000, 0.5);

      const error = Math.abs(result.p50 - theoretical) / theoretical;
      expect(error).toBeLessThan(0.25);
    });

    test('p95 within 35% of theoretical (λ=800, μ=1000)', () => {
      const config: SimulationConfig = {
        arrivalRate: 800,
        serviceRate: 1000,
        packetCount: 10000,
      };

      const result = simulate(config);
      const theoretical = calculatePercentileLatency(800, 1000, 0.95);

      const error = Math.abs(result.p95 - theoretical) / theoretical;
      expect(error).toBeLessThan(0.35);
    });

    test('p99 within 40% of theoretical (λ=800, μ=1000)', () => {
      const config: SimulationConfig = {
        arrivalRate: 800,
        serviceRate: 1000,
        packetCount: 10000,
      };

      const result = simulate(config);
      const theoretical = calculatePercentileLatency(800, 1000, 0.99);

      // p99 has higher variance due to fewer samples in tail
      const error = Math.abs(result.p99 - theoretical) / theoretical;
      expect(error).toBeLessThan(0.40);
    });
  });

  describe('utilization effects', () => {
    test('higher utilization increases latency', () => {
      const lowUtil = simulate({
        arrivalRate: 500,
        serviceRate: 1000,
        packetCount: 1000,
      });

      const highUtil = simulate({
        arrivalRate: 900,
        serviceRate: 1000,
        packetCount: 1000,
      });

      expect(highUtil.p50).toBeGreaterThan(lowUtil.p50);
      expect(highUtil.p99).toBeGreaterThan(lowUtil.p99);
    });
  });

  describe('result metadata', () => {
    test('returns packet count', () => {
      const result = simulate({
        arrivalRate: 800,
        serviceRate: 1000,
        packetCount: 500,
      });

      expect(result.packetCount).toBe(500);
    });

    test('returns utilization', () => {
      const result = simulate({
        arrivalRate: 800,
        serviceRate: 1000,
        packetCount: 500,
      });

      expect(result.utilization).toBeCloseTo(0.8, 1);
    });
  });
});
