import { describe, test, expect } from 'vitest';
import {
  sampleExponential,
  sampleNormal,
  sampleBimodal,
} from './Probability';

describe('Probability', () => {
  describe('sampleExponential', () => {
    test('mean approximates 1/rate for large sample', () => {
      const rate = 100;
      const samples = Array.from({ length: 10000 }, () => sampleExponential(rate));
      const mean = samples.reduce((a, b) => a + b, 0) / samples.length;

      // Expected mean = 1/rate = 0.01
      expect(mean).toBeCloseTo(0.01, 1);
    });

    test('all values are positive', () => {
      const samples = Array.from({ length: 1000 }, () => sampleExponential(100));
      expect(samples.every(s => s > 0)).toBe(true);
    });
  });

  describe('sampleNormal', () => {
    test('mean approximates specified mean', () => {
      const mean = 50;
      const stddev = 10;
      const samples = Array.from({ length: 10000 }, () => sampleNormal(mean, stddev));
      const sampleMean = samples.reduce((a, b) => a + b, 0) / samples.length;

      expect(sampleMean).toBeCloseTo(mean, 0);
    });

    test('stddev approximates specified stddev', () => {
      const mean = 50;
      const stddev = 10;
      const samples = Array.from({ length: 10000 }, () => sampleNormal(mean, stddev));
      const sampleMean = samples.reduce((a, b) => a + b, 0) / samples.length;
      const sampleVariance = samples.reduce((a, b) => a + (b - sampleMean) ** 2, 0) / samples.length;
      const sampleStddev = Math.sqrt(sampleVariance);

      expect(sampleStddev).toBeCloseTo(stddev, 0);
    });

    test('can produce negative values when mean is near zero', () => {
      const samples = Array.from({ length: 1000 }, () => sampleNormal(0, 10));
      expect(samples.some(s => s < 0)).toBe(true);
    });
  });

  describe('sampleBimodal', () => {
    test('respects probability split', () => {
      const lowValue = 10;
      const highValue = 300;
      const highProbability = 0.1;

      const samples = Array.from({ length: 10000 }, () =>
        sampleBimodal(lowValue, highValue, highProbability)
      );

      const highCount = samples.filter(s => s === highValue).length;
      const highRatio = highCount / samples.length;

      // Should be ~10% high values
      expect(highRatio).toBeCloseTo(0.1, 1);
    });

    test('returns only low or high values', () => {
      const lowValue = 10;
      const highValue = 300;

      const samples = Array.from({ length: 100 }, () =>
        sampleBimodal(lowValue, highValue, 0.5)
      );

      expect(samples.every(s => s === lowValue || s === highValue)).toBe(true);
    });
  });
});
