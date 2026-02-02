import { describe, test, expect } from 'vitest';
import { calculatePercentile, calculatePercentiles } from './Statistics';

describe('Statistics', () => {
  describe('calculatePercentile', () => {
    test('p50 of [1,2,3,4,5,6,7,8,9,10] is 5.5', () => {
      const data = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
      expect(calculatePercentile(data, 0.5)).toBeCloseTo(5.5, 1);
    });

    test('p50 of unsorted array sorts correctly', () => {
      const data = [10, 1, 5, 3, 8, 2, 7, 4, 9, 6];
      expect(calculatePercentile(data, 0.5)).toBeCloseTo(5.5, 1);
    });

    test('p95 of 100 elements (1-100) is ~95', () => {
      const data = Array.from({ length: 100 }, (_, i) => i + 1);
      // index = 0.95 * 99 = 94.05, interpolates between 95 and 96
      expect(calculatePercentile(data, 0.95)).toBeCloseTo(95.05, 1);
    });

    test('p99 of 100 elements (1-100) is ~99', () => {
      const data = Array.from({ length: 100 }, (_, i) => i + 1);
      // index = 0.99 * 99 = 98.01, interpolates between 99 and 100
      expect(calculatePercentile(data, 0.99)).toBeCloseTo(99.01, 1);
    });

    test('single element returns that element', () => {
      expect(calculatePercentile([42], 0.5)).toBe(42);
      expect(calculatePercentile([42], 0.99)).toBe(42);
    });

    test('empty array returns NaN', () => {
      expect(calculatePercentile([], 0.5)).toBeNaN();
    });

    test('two elements interpolates correctly', () => {
      const data = [10, 20];
      expect(calculatePercentile(data, 0.5)).toBeCloseTo(15, 1);
    });
  });

  describe('calculatePercentiles', () => {
    test('returns p50, p95, p99 for standard dataset', () => {
      const data = Array.from({ length: 1000 }, (_, i) => i + 1);
      const result = calculatePercentiles(data);

      // index = percentile * (length - 1), then interpolate
      expect(result.p50).toBeCloseTo(500.5, 0);  // 0.5 * 999 = 499.5
      expect(result.p95).toBeCloseTo(950.05, 0); // 0.95 * 999 = 949.05
      expect(result.p99).toBeCloseTo(990.01, 0); // 0.99 * 999 = 989.01
    });

    test('handles empty array', () => {
      const result = calculatePercentiles([]);
      expect(result.p50).toBeNaN();
      expect(result.p95).toBeNaN();
      expect(result.p99).toBeNaN();
    });
  });
});
