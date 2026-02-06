#!/usr/bin/env node
/**
 * CLI for simulating Manila → AWS Singapore topology
 */
import { Topology } from '../components/Topology';
import { NetworkComponent } from '../components/Network';
import { LambdaComponent } from '../components/Lambda';
import { DynamoDBComponent } from '../components/DynamoDB';
import { loadCalibration, msToSeconds } from '../calibration/CalibrationLoader';

// Load calibration data from aggregated benchmarks
const calibration = loadCalibration('manila-aws-singapore');

// Build components from calibration
const networkOut = new NetworkComponent({
  meanLatency: msToSeconds(calibration.network.oneWayLatency.mean),
  stddev: msToSeconds(calibration.network.oneWayLatency.stddev),
  packetLossRate: calibration.network.packetLoss,
});

const lambda = new LambdaComponent({
  warmLatency: msToSeconds(calibration.lambda.warm.p50),
  coldStartLatency: msToSeconds(calibration.lambda.coldStart.p50),
  coldStartProbability: calibration.lambda.coldStartProbability,
});

const dynamo = new DynamoDBComponent({
  meanLatency: msToSeconds(calibration.dynamodb.getItem.p50),
  stddev: msToSeconds(calibration.dynamodb.getItem.p50 * 0.5), // Estimate stddev as 50% of mean
});

const networkBack = new NetworkComponent({
  meanLatency: msToSeconds(calibration.network.oneWayLatency.mean),
  stddev: msToSeconds(calibration.network.oneWayLatency.stddev),
  packetLossRate: calibration.network.packetLoss,
});

const topology = new Topology([networkOut, lambda, dynamo, networkBack]);

console.log('Manila → AWS Singapore Simulation');
console.log('==================================');
console.log(`Route: ${calibration.description}`);
console.log(`Calibration: ${calibration.source}`);
console.log('');
console.log('Topology:', topology.getComponentNames().join(' → '));
console.log('');
console.log('Configuration (from calibration):');
console.log(`  Network (one-way): ${calibration.network.oneWayLatency.mean}ms ± ${calibration.network.oneWayLatency.stddev}ms, ${calibration.network.packetLoss * 100}% packet loss`);
console.log(`  Lambda: ${calibration.lambda.warm.p50}ms warm, ${calibration.lambda.coldStart.p50}ms cold (${calibration.lambda.coldStartProbability * 100}% cold start rate)`);
console.log(`  DynamoDB: ${calibration.dynamodb.getItem.p50}ms (p50)`);
console.log('');

const packetCount = 10000;
console.log(`Simulating ${packetCount} requests...`);
console.log('');

const result = topology.simulate(packetCount);

console.log('Results');
console.log('-------');
console.log(`  p50: ${(result.p50 * 1000).toFixed(1)}ms`);
console.log(`  p95: ${(result.p95 * 1000).toFixed(1)}ms`);
console.log(`  p99: ${(result.p99 * 1000).toFixed(1)}ms`);
console.log('');

// Calculate expected paths from calibration
const warmPath = calibration.network.oneWayLatency.mean * 2 + calibration.lambda.warm.p50 + calibration.dynamodb.getItem.p50;
const coldPath = calibration.network.oneWayLatency.mean * 2 + calibration.lambda.coldStart.p50 + calibration.dynamodb.getItem.p50;

console.log('Expected (theoretical):');
console.log(`  Warm path:  ~${warmPath}ms (${calibration.network.oneWayLatency.mean} + ${calibration.lambda.warm.p50} + ${calibration.dynamodb.getItem.p50} + ${calibration.network.oneWayLatency.mean})`);
console.log(`  Cold path:  ~${coldPath}ms (${calibration.network.oneWayLatency.mean} + ${calibration.lambda.coldStart.p50} + ${calibration.dynamodb.getItem.p50} + ${calibration.network.oneWayLatency.mean})`);
console.log('');
console.log(`Note: p99 should be dominated by cold starts (~${calibration.lambda.coldStartProbability * 100}% of requests)`);
