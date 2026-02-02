import { Component } from './Component';
import { sampleNormal } from '../Probability';

export interface LambdaConfig {
  /** Mean warm execution latency in seconds */
  warmLatency: number;
  /** Standard deviation of warm latency (optional, default 10% of mean) */
  warmStddev?: number;
  /** Mean cold start latency in seconds */
  coldStartLatency: number;
  /** Standard deviation of cold start latency (optional, default 20% of mean) */
  coldStartStddev?: number;
  /** Probability of cold start (0 to 1) */
  coldStartProbability: number;
}

/**
 * Models AWS Lambda with cold start behavior.
 * Bimodal latency: warm requests are fast, cold starts are slow.
 */
export class LambdaComponent implements Component {
  name = 'Lambda';

  private warmStddev: number;
  private coldStartStddev: number;

  constructor(private config: LambdaConfig) {
    this.warmStddev = config.warmStddev ?? config.warmLatency * 0.1;
    this.coldStartStddev = config.coldStartStddev ?? config.coldStartLatency * 0.2;
  }

  processRequest(): number {
    const isColdStart = Math.random() < this.config.coldStartProbability;

    if (isColdStart) {
      return Math.max(
        0.001,
        sampleNormal(this.config.coldStartLatency, this.coldStartStddev)
      );
    } else {
      return Math.max(
        0.001,
        sampleNormal(this.config.warmLatency, this.warmStddev)
      );
    }
  }
}
