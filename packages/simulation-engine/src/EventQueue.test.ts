import { describe, test, expect } from 'vitest';
import { EventQueue, SimulationEvent } from './EventQueue';

describe('EventQueue', () => {
  describe('basic operations', () => {
    test('new queue is empty', () => {
      const queue = new EventQueue();
      expect(queue.isEmpty()).toBe(true);
      expect(queue.size()).toBe(0);
    });

    test('push increases size', () => {
      const queue = new EventQueue();
      queue.push({ time: 1, type: 'ARRIVAL', packetId: 0 });
      expect(queue.isEmpty()).toBe(false);
      expect(queue.size()).toBe(1);
    });

    test('pop returns and removes earliest event', () => {
      const queue = new EventQueue();
      queue.push({ time: 5, type: 'ARRIVAL', packetId: 0 });
      queue.push({ time: 2, type: 'ARRIVAL', packetId: 1 });
      queue.push({ time: 8, type: 'ARRIVAL', packetId: 2 });

      const first = queue.pop();
      expect(first?.time).toBe(2);
      expect(queue.size()).toBe(2);

      const second = queue.pop();
      expect(second?.time).toBe(5);

      const third = queue.pop();
      expect(third?.time).toBe(8);

      expect(queue.isEmpty()).toBe(true);
    });

    test('peek returns earliest without removing', () => {
      const queue = new EventQueue();
      queue.push({ time: 5, type: 'ARRIVAL', packetId: 0 });
      queue.push({ time: 2, type: 'ARRIVAL', packetId: 1 });

      expect(queue.peek()?.time).toBe(2);
      expect(queue.size()).toBe(2);
      expect(queue.peek()?.time).toBe(2);
    });

    test('pop on empty queue returns undefined', () => {
      const queue = new EventQueue();
      expect(queue.pop()).toBeUndefined();
    });

    test('peek on empty queue returns undefined', () => {
      const queue = new EventQueue();
      expect(queue.peek()).toBeUndefined();
    });
  });

  describe('heap ordering', () => {
    test('maintains min-heap property with many insertions', () => {
      const queue = new EventQueue();
      const times = [50, 30, 70, 10, 40, 60, 20, 80, 5, 90];

      times.forEach((time, i) => {
        queue.push({ time, type: 'ARRIVAL', packetId: i });
      });

      const sorted: number[] = [];
      while (!queue.isEmpty()) {
        sorted.push(queue.pop()!.time);
      }

      expect(sorted).toEqual([5, 10, 20, 30, 40, 50, 60, 70, 80, 90]);
    });

    test('handles duplicate times', () => {
      const queue = new EventQueue();
      queue.push({ time: 5, type: 'ARRIVAL', packetId: 0 });
      queue.push({ time: 5, type: 'DEPARTURE', packetId: 1 });
      queue.push({ time: 5, type: 'ARRIVAL', packetId: 2 });

      expect(queue.size()).toBe(3);
      expect(queue.pop()?.time).toBe(5);
      expect(queue.pop()?.time).toBe(5);
      expect(queue.pop()?.time).toBe(5);
      expect(queue.isEmpty()).toBe(true);
    });
  });

  describe('event types', () => {
    test('preserves event data through push/pop', () => {
      const queue = new EventQueue();
      const event: SimulationEvent = {
        time: 10,
        type: 'DEPARTURE',
        packetId: 42,
      };

      queue.push(event);
      const popped = queue.pop();

      expect(popped).toEqual(event);
    });
  });
});
