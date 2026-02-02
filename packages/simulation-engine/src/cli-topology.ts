#!/usr/bin/env node
/**
 * CLI for simulating Manila → AWS Singapore topology
 */
import { Topology } from './components/Topology';
import { NetworkComponent } from './components/Network';
import { LambdaComponent } from './components/Lambda';
import { DynamoDBComponent } from './components/DynamoDB';

// Manila → Singapore calibration (placeholder values until Gate 4)
const networkOut = new NetworkComponent({
  meanLatency: 0.055, // 55ms one-way
  stddev: 0.006,
  packetLossRate: 0.001,
});

const lambda = new LambdaComponent({
  warmLatency: 0.008,       // 8ms warm
  coldStartLatency: 0.265,  // 265ms cold
  coldStartProbability: 0.10,
});

const dynamo = new DynamoDBComponent({
  meanLatency: 0.005, // 5ms
  stddev: 0.003,
});

const networkBack = new NetworkComponent({
  meanLatency: 0.055,
  stddev: 0.006,
  packetLossRate: 0.001,
});

const topology = new Topology([networkOut, lambda, dynamo, networkBack]);

console.log('Manila → AWS Singapore Simulation');
console.log('==================================');
console.log('Topology:', topology.getComponentNames().join(' → '));
console.log('');
console.log('Configuration:');
console.log('  Network (one-way): 55ms ± 6ms, 0.1% packet loss');
console.log('  Lambda: 8ms warm, 265ms cold (10% cold start rate)');
console.log('  DynamoDB: 5ms ± 3ms');
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

// Expected warm path: 55 + 8 + 5 + 55 = 123ms
// Expected cold path: 55 + 265 + 5 + 55 = 380ms
console.log('Expected (theoretical):');
console.log('  Warm path:  ~123ms (55 + 8 + 5 + 55)');
console.log('  Cold path:  ~380ms (55 + 265 + 5 + 55)');
console.log('');
console.log('Note: p99 should be dominated by cold starts (~10% of requests)');
