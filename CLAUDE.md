# CLAUDE.md

## PROJECT SCOPE

Build latency prediction simulator for distributed systems.

MVP targets ONE specific route: Manila → AWS Singapore hybrid cloud.
Architecture must support adding more routes later.
Goal: Predictions within 15% of real deployment measurements.

## TECHNICAL CONSTRAINTS

### Stack
- Simulation engine: TypeScript (runs in Node.js CLI and Web Worker)
- Frontend: React 18, React Flow, Zustand, Recharts, Tailwind CSS
- Testing: Vitest for simulation, React Testing Library for UI
- Deployment: Static hosting (Vercel/Netlify)
- No backend, no database

### Core Components
- Client (request generator)
- Network (latency, jitter, packet loss)
- VPN/Direct Connect
- Firewall
- API Gateway
- Lambda (with cold starts)
- DynamoDB

## DEVELOPMENT RULES

### Vertical Development Only
Build complete features end-to-end before starting next feature.
Every feature must be demonstrable and deployable independently.

Examples:
- GOOD: "Simulate single M/M/1 queue, output p99 to console"
- BAD: "Build all simulation classes"
- GOOD: "User drags 3 nodes, clicks Run, sees p99"
- BAD: "Build entire React Flow canvas system"

### Test-Driven Development

Follow the Golden Rule of Assertions: Test behavior, not implementation.

ALWAYS test:
- Mathematical formulas (M/M/1 calculations)
- Simulation engine outputs (given inputs → expected percentiles)
- Percentile extraction from arrays
- Calibration data loading and parsing
- Edge cases: zero traffic, negative inputs, 100% utilization

SOMETIMES test:
- Complex component interactions
- Non-trivial data transformations
- Business logic in state management

NEVER test:
- Private methods or internal state
- Implementation details that change during refactor
- Third-party library wrappers
- Pure presentational components

Test pattern:
```typescript
// CORRECT - tests observable behavior
test('M/M/1 queue with λ=800, μ=1000 gives ρ=0.8', () => {
  const result = calculateUtilization(800, 1000);
  expect(result).toBeCloseTo(0.8, 2);
});

test('simulation returns p50 within 10% of theory', () => {
  const sim = simulate({ arrivalRate: 800, serviceRate: 1000, packets: 1000 });
  expect(sim.p50).toBeCloseTo(4, 0.4); // 4ms ± 10%
});

// WRONG - tests implementation
test('EventQueue uses min-heap internally', () => {
  const queue = new EventQueue();
  expect(queue._heap).toBeDefined(); // Testing internals
});
```

### Quality Gates

Each gate must pass before proceeding to next phase.

Gate 1: Math Validation
- All M/M/1 formulas match textbook examples within 1%
- Calculator outputs verified by hand

Gate 2: CLI Simulation Works
- Simulation of 1000 packets completes without errors
- Output p50/p95/p99 matches theoretical M/M/1 within 10%
- Percentile calculation is correct

Gate 3: Realism Added
- Network jitter working (normal distribution)
- Cold starts working (probabilistic)
- Packet loss working (retry mechanism)
- Multi-node topology working

Gate 4: Real-World Validation (CRITICAL - BLOCKS UI WORK)
- Actual AWS deployment created
- 1000+ real requests fired from Manila
- Measured actual p50/p95/p99
- Simulated predictions within 15% of actual
- If this fails, tune models and re-test before building UI

Gate 5: UI Integration Works
- Web Worker doesn't block main thread
- UI simulation matches CLI simulation exactly
- Results render correctly

Gate 6: Production Ready
- Input validation prevents crashes
- Error messages are clear
- Cross-browser tested
- Performance acceptable (<5 sec for 10k packets)

## CALIBRATION DATA

Must collect real measurements for Manila → AWS Singapore route.

Required measurements:
- Network: 1000 pings (mean, stddev, packet loss %)
- Lambda cold starts: 100+ measurements with 15min intervals
- Lambda warm execution: 1000+ measurements
- DynamoDB GetItem: 1000+ measurements from CloudWatch
- VPN/Direct Connect latency if applicable

Output format:
```json
{
  "route": "manila-aws-singapore",
  "network": {
    "meanLatency": 110,
    "stddev": 6,
    "packetLoss": 0.001
  },
  "lambda": {
    "coldStartP50": 265,
    "coldStartP95": 420,
    "coldStartP99": 580,
    "warmP50": 8,
    "warmP95": 12,
    "warmP99": 18,
    "coldStartProbability": 0.10
  },
  "dynamodb": {
    "getItemP50": 5,
    "getItemP95": 12,
    "getItemP99": 25
  }
}
```

Time estimate: 4-6 hours per route.

Post-MVP: Architecture supports multiple calibration files.
Users can add their own routes by collecting data and contributing calibration files.

## CORE ALGORITHMS

### M/M/1 Queueing Model

Utilization: ρ = λ / μ
Average wait time: W = 1 / (μ - λ)
Average queue length: L = ρ / (1 - ρ)
Little's Law: L = λ × W

Where:
- λ = arrival rate (requests/second)
- μ = service rate (requests/second)
- ρ = utilization (0 to 1)

Critical insight: Latency grows exponentially near 100% utilization.
- 50% util → 1ms wait
- 90% util → 9ms wait
- 95% util → 19ms wait
- 99% util → 99ms wait

### Discrete Event Simulation

Event types:
- PACKET_ARRIVAL: New request enters system
- PACKET_DEPARTURE: Request leaves component
- SERVICE_START: Component begins processing
- SERVICE_COMPLETE: Component finishes processing

Data structure: Priority queue (min-heap) ordered by event timestamp.

Simulation loop:
1. Pop earliest event from queue
2. Process event (update state, record metrics)
3. Generate future events based on current event
4. Push future events to queue
5. Repeat until queue empty or time limit reached

### Percentile Calculation

1. Collect all latency measurements in array
2. Sort array ascending
3. p50 = array[length * 0.50]
4. p95 = array[length * 0.95]
5. p99 = array[length * 0.99]

Handle edge cases: empty array, single element, even/odd length.

### Probabilistic Modeling

Network jitter: Sample from normal distribution N(mean, stddev)
```typescript
// Box-Muller transform
const u1 = Math.random();
const u2 = Math.random();
const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
const sample = mean + z * stddev;
```

Cold starts: Random boolean with probability p
```typescript
const isColdStart = Math.random() < coldStartProbability;
const latency = isColdStart ? sampleColdStart() : sampleWarm();
```

Packet loss: Random drop with probability p
```typescript
const isDropped = Math.random() < packetLossRate;
if (isDropped) {
  // Schedule retransmission
}
```

## FILE STRUCTURE

```
packages/simulation-engine/
  src/
    core/
      EventQueue.ts          # Priority queue (min-heap)
      Simulator.ts           # Main simulation loop
      Statistics.ts          # Percentile calculation
    components/
      Client.ts              # Request generator
      Network.ts             # Latency, jitter, packet loss
      Server.ts              # Service processing
      Database.ts            # Database operations
    models/
      QueueingModel.ts       # M/M/1 formulas
      ProbabilityModel.ts    # Random sampling
    calibration/
      manila-aws-singapore.json

apps/web/
  src/
    components/
      Canvas.tsx             # React Flow canvas
      NodeLibrary.tsx        # Draggable node palette
      PropertyPanel.tsx      # Edit node properties
      ResultsPanel.tsx       # Display p50/p95/p99
    workers/
      simulation.worker.ts   # Web Worker wrapper
    stores/
      topology.ts            # Zustand state
```

## VALIDATION REQUIREMENTS

Phase 1 validation:
- CLI simulation outputs match theoretical M/M/1 within 10%
- Test case: λ=800, μ=1000 should give p50≈4ms, ρ=0.8

Phase 4 validation (CRITICAL):
- Deploy actual AWS stack: API Gateway → Lambda → DynamoDB
- Run simulation with exact configuration
- Fire 1000+ real requests from Manila
- Measure actual latencies
- Compare: |simulated - actual| / actual < 0.15 for all percentiles
- If validation fails: tune models, re-test, do NOT proceed to UI

Performance validation:
- 10,000 packets simulate in <5 seconds
- Web Worker doesn't freeze UI
- Memory usage <500MB

## EXPANSION RULES

Post-MVP features (not in scope for MVP):
- Multiple calibration profiles (other routes)
- Calibration selector in UI
- Community calibration repository
- Calibration wizard (help users collect data)
- More component types (Redis, Kafka, etc.)

Each new route requires:
- 4-6 hours data collection
- 2 hours validation testing
- 1 hour documentation

Architecture decisions must support expansion without major refactor.

## ANTI-PATTERNS

Do NOT:
- Build entire class hierarchy upfront
- Create abstractions before second use case
- Skip validation gates
- Guess calibration values
- Test implementation details
- Use mocks excessively (prefer real objects)
- Build UI before simulation accuracy proven
- Add features before MVP validates

## SUCCESS CRITERIA

Technical:
- Simulated p99 within 15% of real deployment
- Simulation completes in <5 seconds for 10k packets
- No crashes on valid inputs
- Memory efficient

User experience:
- Non-technical users can build topologies
- Results are understandable
- Bottlenecks clearly identified
- Users trust the predictions

Validation:
- At least one end-to-end validation passing (<15% error)
- Multiple test topologies validated
- Edge cases handled correctly