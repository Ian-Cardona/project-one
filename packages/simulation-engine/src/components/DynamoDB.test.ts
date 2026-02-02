import { describe, test, expect } from 'vitest';
import { DynamoDBComponent, DynamoDBConfig } from './DynamoDB';

describe('DynamoDBComponent', () => {
  describe('latency distribution', () => {
    test('mean latency approximates configured mean', () => {
      const config: DynamoDBConfig = {
        meanLatency: 0.005, // 5ms
        stddev: 0.002,
      };
      const dynamo = new DynamoDBComponent(config);

      const samples = Array.from({ length: 5000 }, () => dynamo.processRequest());
      const mean = samples.reduce((a, b) => a + b, 0) / samples.length;

      expect(mean).toBeCloseTo(0.005, 2);
    });

    test('latency is always positive', () => {
      const config: DynamoDBConfig = {
        meanLatency: 0.005,
        stddev: 0.010, // High variance
      };
      const dynamo = new DynamoDBComponent(config);

      const samples = Array.from({ length: 1000 }, () => dynamo.processRequest());
      expect(samples.every(s => s > 0)).toBe(true);
    });
  });

  describe('component interface', () => {
    test('has name property', () => {
      const dynamo = new DynamoDBComponent({
        meanLatency: 0.005,
        stddev: 0.002,
      });

      expect(dynamo.name).toBe('DynamoDB');
    });
  });
});
