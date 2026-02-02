/**
 * Event types for discrete event simulation
 */
export interface SimulationEvent {
  time: number;
  type: 'ARRIVAL' | 'DEPARTURE';
  packetId: number;
}

/**
 * Priority queue (min-heap) for simulation events.
 * Events are ordered by time, with earliest events at the front.
 */
export class EventQueue {
  private heap: SimulationEvent[] = [];

  push(event: SimulationEvent): void {
    this.heap.push(event);
    this.bubbleUp(this.heap.length - 1);
  }

  pop(): SimulationEvent | undefined {
    if (this.heap.length === 0) {
      return undefined;
    }

    const min = this.heap[0];
    const last = this.heap.pop()!;

    if (this.heap.length > 0) {
      this.heap[0] = last;
      this.bubbleDown(0);
    }

    return min;
  }

  peek(): SimulationEvent | undefined {
    return this.heap[0];
  }

  isEmpty(): boolean {
    return this.heap.length === 0;
  }

  size(): number {
    return this.heap.length;
  }

  private bubbleUp(index: number): void {
    while (index > 0) {
      const parentIndex = Math.floor((index - 1) / 2);
      if (this.heap[parentIndex].time <= this.heap[index].time) {
        break;
      }
      this.swap(index, parentIndex);
      index = parentIndex;
    }
  }

  private bubbleDown(index: number): void {
    while (true) {
      const leftChild = 2 * index + 1;
      const rightChild = 2 * index + 2;
      let smallest = index;

      if (
        leftChild < this.heap.length &&
        this.heap[leftChild].time < this.heap[smallest].time
      ) {
        smallest = leftChild;
      }

      if (
        rightChild < this.heap.length &&
        this.heap[rightChild].time < this.heap[smallest].time
      ) {
        smallest = rightChild;
      }

      if (smallest === index) {
        break;
      }

      this.swap(index, smallest);
      index = smallest;
    }
  }

  private swap(i: number, j: number): void {
    [this.heap[i], this.heap[j]] = [this.heap[j], this.heap[i]];
  }
}
