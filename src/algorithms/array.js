const INSERT_PSEUDOCODE = [
  'function insert(arr, index, value):',
  '  if index < 0 or index > length: error',
  '  for i from length-1 down to index:',
  '    arr[i+1] = arr[i]  // shift right',
  '  arr[index] = value',
  '  return arr',
];

const DELETE_PSEUDOCODE = [
  'function delete(arr, index):',
  '  if index < 0 or index >= length: error',
  '  target = arr[index]',
  '  for i from index to length-2:',
  '    arr[i] = arr[i+1]  // shift left',
  '  remove last element',
  '  return arr',
];

const SEARCH_PSEUDOCODE = [
  'function linearSearch(arr, target):',
  '  for i from 0 to length-1:',
  '    if arr[i] == target:',
  '      return i  // found!',
  '  return -1  // not found',
];

export function* arrayInsert({ arr, index, value }) {
  const a = [...arr];

  if (index < 0 || index > a.length) {
    yield {
      data: [...a],
      message: `Error: index ${index} is out of bounds (valid range: 0–${a.length}).`,
      pseudocodeLine: 1,
      phase: 'Error',
    };
    return;
  }

  yield {
    data: [...a],
    active: [index],
    message: `Inserting value ${value} at index ${index}. Array length = ${a.length}.`,
    pseudocodeLine: 0,
    phase: 'Validate',
    pointers: { target: index },
  };

  for (let i = a.length - 1; i >= index; i--) {
    a[i + 1] = a[i];
    yield {
      data: [...a],
      swapping: [i, i + 1],
      message: `Shift arr[${i}] (${a[i + 1]}) → arr[${i + 1}].`,
      pseudocodeLine: 3,
      phase: 'Shift Right',
    };
  }

  a[index] = value;
  yield {
    data: [...a],
    active: [index],
    message: `Placed value ${value} at index ${index}.`,
    pseudocodeLine: 4,
    phase: 'Place',
  };

  yield {
    data: [...a],
    message: `Insert complete. New array length = ${a.length}.`,
    pseudocodeLine: 5,
    phase: 'Complete',
  };
}

export function* arrayDelete({ arr, index }) {
  const a = [...arr];

  if (index < 0 || index >= a.length) {
    yield {
      data: [...a],
      message: `Error: index ${index} is out of bounds (valid range: 0–${a.length - 1}).`,
      pseudocodeLine: 1,
      phase: 'Error',
    };
    return;
  }

  const target = a[index];

  yield {
    data: [...a],
    active: [index],
    message: `Targeting element arr[${index}] = ${target} for deletion.`,
    pseudocodeLine: 2,
    phase: 'Target',
    pointers: { target: index },
  };

  for (let i = index; i < a.length - 1; i++) {
    a[i] = a[i + 1];
    yield {
      data: [...a],
      swapping: [i, i + 1],
      message: `Shift arr[${i + 1}] (${a[i]}) → arr[${i}].`,
      pseudocodeLine: 4,
      phase: 'Shift Left',
    };
  }

  a.pop();
  yield {
    data: [...a],
    message: `Removed duplicate last element. Value ${target} deleted.`,
    pseudocodeLine: 5,
    phase: 'Remove',
  };

  yield {
    data: [...a],
    message: `Delete complete. New array length = ${a.length}.`,
    pseudocodeLine: 6,
    phase: 'Complete',
  };
}

export function* arrayLinearSearch({ arr, target }) {
  const a = [...arr];

  if (a.length === 0) {
    yield {
      data: [],
      message: 'Array is empty.',
      pseudocodeLine: 0,
      phase: 'Error',
    };
    return;
  }

  for (let i = 0; i < a.length; i++) {
    yield {
      data: [...a],
      comparing: [i],
      message: `Comparing arr[${i}] = ${a[i]} with target ${target}.`,
      pseudocodeLine: 2,
      phase: 'Search',
      pointers: { i },
    };

    if (a[i] === target) {
      yield {
        data: [...a],
        active: [i],
        message: `Found target ${target} at index ${i}!`,
        pseudocodeLine: 3,
        phase: 'Found',
      };
      return;
    }
  }

  yield {
    data: [...a],
    message: `Target ${target} not found in the array.`,
    pseudocodeLine: 4,
    phase: 'Not Found',
  };
}
