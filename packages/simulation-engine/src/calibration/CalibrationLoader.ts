/**
 * Calibration data loader for route-specific configurations
 */
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export interface NetworkCalibration {
  oneWayLatency: { mean: number; stddev: number };
  packetLoss: number;
}

export interface LambdaCalibration {
  coldStart: { p50: number; p95: number; p99: number };
  warm: { p50: number; p95: number; p99: number };
  coldStartProbability: number;
}

export interface DynamoDBCalibration {
  getItem: { p50: number; p95: number; p99: number };
}

export interface VPNCalibration {
  additionalLatency: { mean: number; stddev: number };
}

export interface DirectConnectCalibration {
  latencyReduction: { percent: number };
}

export interface CalibrationData {
  route: string;
  description: string;
  source: string;
  network: NetworkCalibration;
  lambda: LambdaCalibration;
  dynamodb: DynamoDBCalibration;
  vpn?: VPNCalibration;
  directConnect?: DirectConnectCalibration;
}

/**
 * Load calibration data from a JSON file
 * @param routeName - Name of the route (e.g., 'manila-aws-singapore')
 * @returns Parsed calibration data
 */
export function loadCalibration(routeName: string): CalibrationData {
  const calibrationPath = join(__dirname, `${routeName}.json`);

  if (!existsSync(calibrationPath)) {
    throw new Error(`Calibration file not found: ${calibrationPath}`);
  }

  const raw = readFileSync(calibrationPath, 'utf-8');
  const data = JSON.parse(raw);

  return {
    route: data.route,
    description: data.description,
    source: data.source,
    network: {
      oneWayLatency: {
        mean: data.network.oneWayLatency.mean,
        stddev: data.network.oneWayLatency.stddev,
      },
      packetLoss: data.network.packetLoss,
    },
    lambda: {
      coldStart: data.lambda.coldStart,
      warm: data.lambda.warm,
      coldStartProbability: data.lambda.coldStartProbability,
    },
    dynamodb: {
      getItem: data.dynamodb.getItem,
    },
    vpn: data.vpn ? {
      additionalLatency: data.vpn.additionalLatency,
    } : undefined,
    directConnect: data.directConnect ? {
      latencyReduction: data.directConnect.latencyReduction,
    } : undefined,
  };
}

/**
 * Convert milliseconds to seconds (simulation uses seconds internally)
 */
export function msToSeconds(ms: number): number {
  return ms / 1000;
}

/**
 * Get available calibration routes
 */
export function getAvailableRoutes(): string[] {
  const files = readdirSync(__dirname);
  return files
    .filter((f: string) => f.endsWith('.json'))
    .map((f: string) => f.replace('.json', ''));
}
