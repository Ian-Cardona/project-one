import { describe, test, expect } from 'vitest';
import { LambdaComponent, LambdaConfig } from './Lambda';

describe('LambdaComponent', () => {
  describe('cold start behavior', () => {
    test('cold start probability is respected', () => {
      const config: LambdaConfig = {
        warmLatency: 0.010,      // 10ms
        coldStartLatency: 0.300, // 300ms
        coldStartProbability: 0.1,
      };
      const lambda = new LambdaComponent(config);

      const samples = Array.from({ length: 5000 }, () => lambda.processRequest());
      const coldStarts = samples.filter(s => s >= 0.200).length;
      const coldRatio = coldStarts / samples.length;

      expect(coldRatio).toBeCloseTo(0.1, 1);
    });

    test('warm requests return warm latency', () => {
      const config: LambdaConfig = {
        warmLatency: 0.010,
        coldStartLatency: 0.300,
        coldStartProbability: 0, // No cold starts
      };
      const lambda = new LambdaComponent(config);

      const samples = Array.from({ length: 100 }, () => lambda.processRequest());
      const mean = samples.reduce((a, b) => a + b, 0) / samples.length;

      expect(mean).toBeCloseTo(0.010, 2);
    });

    test('100% cold start returns cold latency', () => {
      const config: LambdaConfig = {
        warmLatency: 0.010,
        coldStartLatency: 0.300,
        coldStartStddev: 0.001, // Low variance for predictable testing
        coldStartProbability: 1, // Always cold
      };
      const lambda = new LambdaComponent(config);

      const samples = Array.from({ length: 100 }, () => lambda.processRequest());
      const mean = samples.reduce((a, b) => a + b, 0) / samples.length;

      expect(mean).toBeCloseTo(0.300, 2);
    });
  });

  describe('latency variance', () => {
    test('warm latency has variance', () => {
      const config: LambdaConfig = {
        warmLatency: 0.010,
        warmStddev: 0.002,
        coldStartLatency: 0.300,
        coldStartProbability: 0,
      };
      const lambda = new LambdaComponent(config);

      const samples = Array.from({ length: 1000 }, () => lambda.processRequest());
      const mean = samples.reduce((a, b) => a + b, 0) / samples.length;
      const variance = samples.reduce((a, b) => a + (b - mean) ** 2, 0) / samples.length;

      expect(variance).toBeGreaterThan(0);
    });

    test('cold start latency has variance', () => {
      const config: LambdaConfig = {
        warmLatency: 0.010,
        coldStartLatency: 0.300,
        coldStartStddev: 0.050,
        coldStartProbability: 1,
      };
      const lambda = new LambdaComponent(config);

      const samples = Array.from({ length: 1000 }, () => lambda.processRequest());
      const mean = samples.reduce((a, b) => a + b, 0) / samples.length;
      const variance = samples.reduce((a, b) => a + (b - mean) ** 2, 0) / samples.length;
      const stddev = Math.sqrt(variance);

      expect(stddev).toBeCloseTo(0.050, 1);
    });
  });

  describe('component interface', () => {
    test('has name property', () => {
      const lambda = new LambdaComponent({
        warmLatency: 0.010,
        coldStartLatency: 0.300,
        coldStartProbability: 0.1,
      });

      expect(lambda.name).toBe('Lambda');
    });
  });
});
