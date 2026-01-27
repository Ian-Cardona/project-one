import { describe, test, expect } from 'vitest';
import {
  calculateUtilization,
  calculateAverageWait,
  calculateAverageQueueLength,
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
});
