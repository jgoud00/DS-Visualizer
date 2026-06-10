export const QUEUE_MAX_SIZE = 10;

const ENQUEUE_PSEUDOCODE = [
  'function enqueue(queue, value):',
  '  if queue is full: error (overflow)',
  '  queue[rear + 1] = value',
  '  rear = rear + 1',
  '  return queue',
];

const DEQUEUE_PSEUDOCODE = [
  'function dequeue(queue):',
  '  if queue is empty: error (underflow)',
  '  value = queue[front]',
  '  remove front element',
  '  front = front + 1',
  '  return value',
];

const PEEK_PSEUDOCODE = [
  'function peekFront(queue):',
  '  if queue is empty: error (underflow)',
  '  return queue[front]  // no modification',
];

export function* queueEnqueue({ queue, value }) {
  const q = [...queue];

  if (q.length >= QUEUE_MAX_SIZE) {
    yield {
      data: [...q],
      message: 'Queue Overflow! Cannot enqueue — queue is full (max 10 elements).',
      pseudocodeLine: 1,
      phase: 'Error',
      pointers: { FRONT: 0, REAR: q.length - 1 },
    };
    return;
  }

  yield {
    data: [...q],
    active: [q.length],
    message: `Enqueuing value ${value} at rear (index ${q.length}).`,
    pseudocodeLine: 2,
    phase: 'Enqueue',
    pointers: q.length > 0 ? { FRONT: 0, REAR: q.length - 1 } : {},
  };

  q.push(value);

  yield {
    data: [...q],
    active: [q.length - 1],
    message: `Enqueued ${value}. New rear is index ${q.length - 1}.`,
    pseudocodeLine: 3,
    phase: 'Enqueue',
    pointers: { FRONT: 0, REAR: q.length - 1 },
  };

  yield {
    data: [...q],
    message: `Enqueue complete. Queue size = ${q.length}.`,
    pseudocodeLine: 4,
    phase: 'Complete',
    pointers: { FRONT: 0, REAR: q.length - 1 },
  };
}

export function* queueDequeue({ queue }) {
  const q = [...queue];

  if (q.length === 0) {
    yield {
      data: [],
      message: 'Queue Underflow! Cannot dequeue — queue is empty.',
      pseudocodeLine: 1,
      phase: 'Error',
    };
    return;
  }

  const value = q[0];

  yield {
    data: [...q],
    active: [0],
    message: `Front element is queue[0] = ${value}.`,
    pseudocodeLine: 2,
    phase: 'Target',
    pointers: { FRONT: 0, REAR: q.length - 1 },
  };

  q.shift();

  yield {
    data: [...q],
    message: `Dequeued value ${value} from the front.`,
    pseudocodeLine: 3,
    phase: 'Remove',
    pointers: q.length > 0 ? { FRONT: 0, REAR: q.length - 1 } : {},
  };

  yield {
    data: [...q],
    message: `Dequeue complete. Queue size = ${q.length}.${q.length > 0 ? ` New front is ${q[0]}.` : ' Queue is now empty.'}`,
    pseudocodeLine: 5,
    phase: 'Complete',
    pointers: q.length > 0 ? { FRONT: 0, REAR: q.length - 1 } : {},
  };
}

export function* queuePeekFront({ queue }) {
  const q = [...queue];

  if (q.length === 0) {
    yield {
      data: [],
      message: 'Queue Underflow! Cannot peek — queue is empty.',
      pseudocodeLine: 1,
      phase: 'Error',
    };
    return;
  }

  yield {
    data: [...q],
    active: [0],
    message: `Front element is queue[0] = ${q[0]}. Queue unchanged.`,
    pseudocodeLine: 2,
    phase: 'Peek',
    pointers: { FRONT: 0, REAR: q.length - 1 },
  };
}
