import { describe, test, expect } from 'vitest';
import {
  calculateUtilization,
  calculateAverageWait,
  calculateAverageQueueLength,
  calculatePercentileLatency,
} from './QueueingModel';

describe('M/M/1 Queueing Model', () => {
  describe('calculateUtilization', () => {
    test('λ=800, μ=1000 gives ρ=0.8', () => {
      const result = calculateUtilization(800, 1000);
      expect(result).toBeCloseTo(0.8, 2);
    });

    test('λ=500, μ=1000 gives ρ=0.5', () => {
      const result = calculateUtilization(500, 1000);
      expect(result).toBeCloseTo(0.5, 2);
    });

    test('λ=950, μ=1000 gives ρ=0.95', () => {
      const result = calculateUtilization(950, 1000);
      expect(result).toBeCloseTo(0.95, 2);
    });
  });

  describe('calculateAverageWait', () => {
    test('λ=800, μ=1000 gives W=5ms (1/(1000-800) = 0.005s)', () => {
      const result = calculateAverageWait(800, 1000);
      expect(result).toBeCloseTo(0.005, 4); // 5ms in seconds
    });

    test('λ=500, μ=1000 gives W=2ms', () => {
      const result = calculateAverageWait(500, 1000);
      expect(result).toBeCloseTo(0.002, 4); // 2ms in seconds
    });
  });

  describe('calculateAverageQueueLength', () => {
    test('λ=800, μ=1000 gives L=4 (ρ/(1-ρ) = 0.8/0.2)', () => {
      const result = calculateAverageQueueLength(800, 1000);
      expect(result).toBeCloseTo(4, 1);
    });

    test('λ=500, μ=1000 gives L=1', () => {
      const result = calculateAverageQueueLength(500, 1000);
      expect(result).toBeCloseTo(1, 1);
    });
  });

  describe('calculatePercentileLatency', () => {
    // Formula: t(p) = -ln(1 - p) / (μ - λ)
    // For λ=800, μ=1000: μ - λ = 200

    test('p50 latency: λ=800, μ=1000 gives ~3.47ms', () => {
      // -ln(0.5) / 200 = 0.693147 / 200 = 0.00346574s
      const result = calculatePercentileLatency(800, 1000, 0.5);
      expect(result).toBeCloseTo(0.00347, 4);
    });

    test('p95 latency: λ=800, μ=1000 gives ~14.98ms', () => {
      // -ln(0.05) / 200 = 2.995732 / 200 = 0.01497866s
      const result = calculatePercentileLatency(800, 1000, 0.95);
      expect(result).toBeCloseTo(0.01498, 4);
    });

    test('p99 latency: λ=800, μ=1000 gives ~23.03ms', () => {
      // -ln(0.01) / 200 = 4.60517 / 200 = 0.02302585s
      const result = calculatePercentileLatency(800, 1000, 0.99);
      expect(result).toBeCloseTo(0.02303, 4);
    });

    test('higher utilization increases latency', () => {
      const lowUtil = calculatePercentileLatency(500, 1000, 0.99);
      const highUtil = calculatePercentileLatency(900, 1000, 0.99);
      expect(highUtil).toBeGreaterThan(lowUtil);
    });
  });
});
