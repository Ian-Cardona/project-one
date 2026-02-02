import { Component } from './Component';
import { sampleNormal } from '../Probability';

export interface DynamoDBConfig {
  /** Mean GetItem latency in seconds */
  meanLatency: number;
  /** Standard deviation of latency in seconds */
  stddev: number;
}

/**
 * Models DynamoDB GetItem operation latency.
 */
export class DynamoDBComponent implements Component {
  name = 'DynamoDB';

  constructor(private config: DynamoDBConfig) {}

  processRequest(): number {
    return Math.max(
      0.001,
      sampleNormal(this.config.meanLatency, this.config.stddev)
    );
  }
}
