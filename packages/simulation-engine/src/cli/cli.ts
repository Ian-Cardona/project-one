#!/usr/bin/env node
import { simulate } from '../core/Simulator';
import { calculatePercentileLatency } from '../models/QueueingModel';

const config = {
  arrivalRate: 800,
  serviceRate: 1000,
  packetCount: 5000,
};

console.log('M/M/1 Queue Simulation');
console.log('======================');
console.log(`λ (arrival rate):  ${config.arrivalRate}/sec`);
console.log(`μ (service rate):  ${config.serviceRate}/sec`);
console.log(`Packets:           ${config.packetCount}`);
console.log('');

const result = simulate(config);

console.log('Results');
console.log('-------');
console.log(`Utilization (ρ):   ${(result.utilization * 100).toFixed(1)}%`);
console.log('');
console.log('Latency (simulated vs theoretical):');
console.log(`  p50: ${(result.p50 * 1000).toFixed(2)}ms (theory: ${(calculatePercentileLatency(config.arrivalRate, config.serviceRate, 0.5) * 1000).toFixed(2)}ms)`);
console.log(`  p95: ${(result.p95 * 1000).toFixed(2)}ms (theory: ${(calculatePercentileLatency(config.arrivalRate, config.serviceRate, 0.95) * 1000).toFixed(2)}ms)`);
console.log(`  p99: ${(result.p99 * 1000).toFixed(2)}ms (theory: ${(calculatePercentileLatency(config.arrivalRate, config.serviceRate, 0.99) * 1000).toFixed(2)}ms)`);
