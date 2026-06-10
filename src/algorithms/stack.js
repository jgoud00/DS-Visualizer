export const STACK_MAX_SIZE = 10;

const PUSH_PSEUDOCODE = [
  'function push(stack, value):',
  '  if stack is full: error (overflow)',
  '  stack[top + 1] = value',
  '  top = top + 1',
  '  return stack',
];

const POP_PSEUDOCODE = [
  'function pop(stack):',
  '  if stack is empty: error (underflow)',
  '  value = stack[top]',
  '  top = top - 1',
  '  return value',
];

const PEEK_PSEUDOCODE = [
  'function peek(stack):',
  '  if stack is empty: error (underflow)',
  '  return stack[top]  // no modification',
];

export function* stackPush({ stack, value }) {
  const s = [...stack];

  if (s.length >= STACK_MAX_SIZE) {
    yield {
      data: [...s],
      message: 'Stack Overflow! Cannot push — stack is full (max 10 elements).',
      pseudocodeLine: 1,
      phase: 'Error',
      pointers: { TOP: s.length - 1 },
    };
    return;
  }

  yield {
    data: [...s],
    message: `Pushing value ${value} onto the stack at index ${s.length}.`,
    pseudocodeLine: 2,
    phase: 'Push',
    active: [s.length],
    pointers: { TOP: s.length - 1 },
  };

  s.push(value);

  yield {
    data: [...s],
    active: [s.length - 1],
    message: `Pushed ${value}. New top is index ${s.length - 1}.`,
    pseudocodeLine: 3,
    phase: 'Push',
    pointers: { TOP: s.length - 1 },
  };

  yield {
    data: [...s],
    message: `Push complete. Stack size = ${s.length}.`,
    pseudocodeLine: 4,
    phase: 'Complete',
    pointers: { TOP: s.length - 1 },
  };
}

export function* stackPop({ stack }) {
  const s = [...stack];

  if (s.length === 0) {
    yield {
      data: [],
      message: 'Stack Underflow! Cannot pop — stack is empty.',
      pseudocodeLine: 1,
      phase: 'Error',
    };
    return;
  }

  const topIndex = s.length - 1;
  const value = s[topIndex];

  yield {
    data: [...s],
    active: [topIndex],
    message: `Top element is arr[${topIndex}] = ${value}.`,
    pseudocodeLine: 2,
    phase: 'Target',
    pointers: { TOP: topIndex },
  };

  s.pop();

  yield {
    data: [...s],
    message: `Popped value ${value} from the stack.`,
    pseudocodeLine: 3,
    phase: 'Remove',
    pointers: s.length > 0 ? { TOP: s.length - 1 } : {},
  };

  yield {
    data: [...s],
    message: `Pop complete. Stack size = ${s.length}.${s.length > 0 ? ` New top is index ${s.length - 1}.` : ' Stack is now empty.'}`,
    pseudocodeLine: 4,
    phase: 'Complete',
    pointers: s.length > 0 ? { TOP: s.length - 1 } : {},
  };
}

export function* stackPeek({ stack }) {
  const s = [...stack];

  if (s.length === 0) {
    yield {
      data: [],
      message: 'Stack Underflow! Cannot peek — stack is empty.',
      pseudocodeLine: 1,
      phase: 'Error',
    };
    return;
  }

  const topIndex = s.length - 1;

  yield {
    data: [...s],
    active: [topIndex],
    message: `Top element is stack[${topIndex}] = ${s[topIndex]}. Stack unchanged.`,
    pseudocodeLine: 2,
    phase: 'Peek',
    pointers: { TOP: topIndex },
  };
}
