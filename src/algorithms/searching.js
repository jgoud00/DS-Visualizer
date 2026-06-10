export function* linearSearch({ arr, target }) {
  if (!arr || arr.length === 0) {
    yield {
      data: [],
      comparing: [],
      active: [],
      sorted: [],
      message: 'Error: Array is empty',
      pseudocodeLine: 0,
      phase: 'error',
      pointers: {},
    };
    return;
  }

  yield {
    data: [...arr],
    comparing: [],
    active: [],
    sorted: [],
    message: `Starting linear search for target ${target} in array of ${arr.length} elements`,
    pseudocodeLine: 0,
    phase: 'start',
    pointers: {},
  };

  for (let i = 0; i < arr.length; i++) {
    yield {
      data: [...arr],
      comparing: [i],
      active: [],
      sorted: [],
      message: `Comparing arr[${i}] = ${arr[i]?.val ?? arr[i]} with target ${target}`,
      pseudocodeLine: 2,
      phase: 'comparing',
      pointers: {},
    };

    if ((arr[i]?.val ?? arr[i]) === target) {
      yield {
        data: [...arr],
        comparing: [],
        active: [i],
        sorted: [],
        message: `Found target ${target} at index ${i}!`,
        pseudocodeLine: 3,
        phase: 'found',
        pointers: {},
      };
      return;
    }
  }

  yield {
    data: [...arr],
    comparing: [],
    active: [],
    sorted: [],
    message: `Target ${target} not found — exhausted all ${arr.length} elements`,
    pseudocodeLine: 4,
    phase: 'not-found',
    pointers: {},
  };
}

export function* binarySearch({ arr, target }) {
  if (!arr || arr.length === 0) {
    yield {
      data: [],
      comparing: [],
      active: [],
      sorted: [],
      message: 'Error: Array is empty',
      pseudocodeLine: 0,
      phase: 'error',
      pointers: {},
    };
    return;
  }

  let low = 0;
  let high = arr.length - 1;
  const eliminated = new Set();

  yield {
    data: [...arr],
    comparing: [],
    active: [],
    sorted: [],
    message: `Starting binary search for target ${target}. Setting LOW=0, HIGH=${high}`,
    pseudocodeLine: 1,
    phase: 'init',
    pointers: { LOW: low, HIGH: high },
    eliminated: [],
  };

  while (low <= high) {
    const mid = Math.floor((low + high) / 2);

    yield {
      data: [...arr],
      comparing: [],
      active: [mid],
      sorted: [],
      message: `Calculate MID = floor((${low} + ${high}) / 2) = ${mid}`,
      pseudocodeLine: 3,
      phase: 'calculate-mid',
      pointers: { LOW: low, MID: mid, HIGH: high },
      eliminated: [...eliminated],
    };

    yield {
      data: [...arr],
      comparing: [mid],
      active: [],
      sorted: [],
      message: `Comparing arr[${mid}] = ${arr[mid]?.val ?? arr[mid]} with target ${target}`,
      pseudocodeLine: 4,
      phase: 'comparing',
      pointers: { LOW: low, MID: mid, HIGH: high },
      eliminated: [...eliminated],
    };

    if ((arr[mid]?.val ?? arr[mid]) === target) {
      yield {
        data: [...arr],
        comparing: [],
        active: [mid],
        sorted: [],
        message: `Found target ${target} at index ${mid}!`,
        pseudocodeLine: 5,
        phase: 'found',
        pointers: { LOW: low, MID: mid, HIGH: high },
        eliminated: [...eliminated],
      };
      return;
    } else if ((arr[mid]?.val ?? arr[mid]) < target) {
      for (let e = low; e <= mid; e++) eliminated.add(e);
      low = mid + 1;

      yield {
        data: [...arr],
        comparing: [],
        active: [],
        sorted: [],
        message: `arr[${mid}] = ${arr[mid]?.val ?? arr[mid]} < ${target} — eliminate left half, set LOW = ${low}`,
        pseudocodeLine: 6,
        phase: 'eliminate-left',
        pointers: { LOW: low, HIGH: high },
        eliminated: [...eliminated],
      };
    } else {
      for (let e = mid; e <= high; e++) eliminated.add(e);
      high = mid - 1;

      yield {
        data: [...arr],
        comparing: [],
        active: [],
        sorted: [],
        message: `arr[${mid}] = ${arr[mid]?.val ?? arr[mid]} > ${target} — eliminate right half, set HIGH = ${high}`,
        pseudocodeLine: 8,
        phase: 'eliminate-right',
        pointers: { LOW: low, HIGH: high },
        eliminated: [...eliminated],
      };
    }
  }

  yield {
    data: [...arr],
    comparing: [],
    active: [],
    sorted: [],
    message: `Target ${target} not found — LOW (${low}) > HIGH (${high}), search space exhausted`,
    pseudocodeLine: 9,
    phase: 'not-found',
    pointers: { LOW: low, HIGH: high },
    eliminated: [...eliminated],
  };
}
