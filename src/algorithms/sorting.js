export function* bubbleSort(arr) {
  if (arr.length === 0) {
    yield { data: [], comparing: [], swapping: [], sorted: [], active: [], message: 'Array is empty', pseudocodeLine: 0, phase: 'done' };
    return;
  }
  if (arr.length === 1) {
    yield { data: [...arr], comparing: [], swapping: [], sorted: [0], active: [], message: 'Array has only one element — already sorted', pseudocodeLine: 0, phase: 'done' };
    return;
  }

  const a = [...arr];
  const n = a.length;
  const sortedIndices = [];

  for (let i = 0; i < n - 1; i++) {
    let swapped = false;

    yield { data: [...a], comparing: [], swapping: [], sorted: [...sortedIndices], active: [], message: `Starting pass ${i + 1}`, pseudocodeLine: 1, phase: 'pass-start' };

    for (let j = 0; j < n - i - 1; j++) {
      yield { data: [...a], comparing: [j, j + 1], swapping: [], sorted: [...sortedIndices], active: [], message: `Comparing arr[${j}]=${a[j]?.val ?? a[j]} and arr[${j + 1}]=${a[j + 1]?.val ?? a[j + 1]}`, pseudocodeLine: 4, phase: 'compare' };

      if ((a[j]?.val ?? a[j]) > (a[j + 1]?.val ?? a[j + 1])) {
        yield { data: [...a], comparing: [], swapping: [j, j + 1], sorted: [...sortedIndices], active: [], message: `${a[j]?.val ?? a[j]} > ${a[j + 1]?.val ?? a[j + 1]} — swapping`, pseudocodeLine: 5, phase: 'swap' };
        [a[j], a[j + 1]] = [a[j + 1], a[j]];
        swapped = true;
        yield { data: [...a], comparing: [], swapping: [j, j + 1], sorted: [...sortedIndices], active: [], message: `Swapped → arr[${j}]=${a[j]?.val ?? a[j]}, arr[${j + 1}]=${a[j + 1]?.val ?? a[j + 1]}`, pseudocodeLine: 6, phase: 'swap-done' };
      }
    }

    sortedIndices.push(n - 1 - i);
    yield { data: [...a], comparing: [], swapping: [], sorted: [...sortedIndices], active: [], message: `Pass ${i + 1} complete — position ${n - 1 - i} is sorted`, pseudocodeLine: 1, phase: 'pass-end' };

    if (!swapped) {
      yield { data: [...a], comparing: [], swapping: [], sorted: [...Array(n).keys()], active: [], message: 'No swaps this pass — array is sorted!', pseudocodeLine: 7, phase: 'early-termination' };
      return;
    }
  }

  sortedIndices.push(0);
  yield { data: [...a], comparing: [], swapping: [], sorted: [...Array(n).keys()], active: [], message: 'Bubble sort complete!', pseudocodeLine: 8, phase: 'done' };
}

export function* selectionSort(arr) {
  if (arr.length === 0) {
    yield { data: [], comparing: [], swapping: [], sorted: [], active: [], message: 'Array is empty', pseudocodeLine: 0, phase: 'done' };
    return;
  }
  if (arr.length === 1) {
    yield { data: [...arr], comparing: [], swapping: [], sorted: [0], active: [], message: 'Array has only one element — already sorted', pseudocodeLine: 0, phase: 'done' };
    return;
  }

  const a = [...arr];
  const n = a.length;
  const sortedIndices = [];

  for (let i = 0; i < n - 1; i++) {
    let minIndex = i;

    yield { data: [...a], comparing: [], swapping: [], sorted: [...sortedIndices], active: [minIndex], message: `Pass ${i + 1}: assuming arr[${i}]=${a[i]?.val ?? a[i]} is the minimum`, pseudocodeLine: 2, phase: 'set-min' };

    for (let j = i + 1; j < n; j++) {
      yield { data: [...a], comparing: [j], swapping: [], sorted: [...sortedIndices], active: [minIndex], message: `Comparing arr[${j}]=${a[j]?.val ?? a[j]} with current min arr[${minIndex}]=${a[minIndex]?.val ?? a[minIndex]}`, pseudocodeLine: 3, phase: 'compare' };

      if ((a[j]?.val ?? a[j]) < (a[minIndex]?.val ?? a[minIndex])) {
        minIndex = j;
        yield { data: [...a], comparing: [], swapping: [], sorted: [...sortedIndices], active: [minIndex], message: `New minimum found: arr[${minIndex}]=${a[minIndex]?.val ?? a[minIndex]}`, pseudocodeLine: 5, phase: 'new-min' };
      }
    }

    if (minIndex !== i) {
      yield { data: [...a], comparing: [], swapping: [i, minIndex], sorted: [...sortedIndices], active: [], message: `Swapping arr[${i}]=${a[i]?.val ?? a[i]} with arr[${minIndex}]=${a[minIndex]?.val ?? a[minIndex]}`, pseudocodeLine: 6, phase: 'swap' };
      [a[i], a[minIndex]] = [a[minIndex], a[i]];
      yield { data: [...a], comparing: [], swapping: [i, minIndex], sorted: [...sortedIndices], active: [], message: `Swapped → arr[${i}]=${a[i]?.val ?? a[i]}`, pseudocodeLine: 6, phase: 'swap-done' };
    }

    sortedIndices.push(i);
    yield { data: [...a], comparing: [], swapping: [], sorted: [...sortedIndices], active: [], message: `Position ${i} is now sorted with value ${a[i]?.val ?? a[i]}`, pseudocodeLine: 6, phase: 'mark-sorted' };
  }

  sortedIndices.push(n - 1);
  yield { data: [...a], comparing: [], swapping: [], sorted: [...sortedIndices], active: [], message: 'Selection sort complete!', pseudocodeLine: 7, phase: 'done' };
}

export function* insertionSort(arr) {
  if (arr.length === 0) {
    yield { data: [], comparing: [], swapping: [], sorted: [], active: [], message: 'Array is empty', pseudocodeLine: 0, phase: 'done' };
    return;
  }
  if (arr.length === 1) {
    yield { data: [...arr], comparing: [], swapping: [], sorted: [0], active: [], message: 'Array has only one element — already sorted', pseudocodeLine: 0, phase: 'done' };
    return;
  }

  const a = [...arr];
  const n = a.length;

  yield { data: [...a], comparing: [], swapping: [], sorted: [0], active: [], message: 'First element is trivially sorted', pseudocodeLine: 0, phase: 'init' };

  for (let i = 1; i < n; i++) {
    const key = a[i];
    let j = i - 1;

    yield { data: [...a], comparing: [], swapping: [], sorted: [...Array(i).keys()], active: [i], message: `Picking key = arr[${i}] = ${key}`, pseudocodeLine: 2, phase: 'pick-key' };

    while (j >= 0 && a[j] > key) {
      yield { data: [...a], comparing: [j], swapping: [], sorted: [...Array(i).keys()], active: [i], message: `arr[${j}]=${a[j]?.val ?? a[j]} > key=${key} — shifting arr[${j}] right`, pseudocodeLine: 4, phase: 'compare-shift' };

      a[j + 1] = a[j];
      yield { data: [...a], comparing: [], swapping: [j, j + 1], sorted: [...Array(i).keys()], active: [], message: `Shifted arr[${j}]=${a[j]?.val ?? a[j]} to position ${j + 1}`, pseudocodeLine: 5, phase: 'shift' };

      j--;
    }

    a[j + 1] = key;
    yield { data: [...a], comparing: [], swapping: [], sorted: [...Array(i + 1).keys()], active: [j + 1], message: `Placed key=${key} at position ${j + 1}`, pseudocodeLine: 7, phase: 'place-key' };
  }

  yield { data: [...a], comparing: [], swapping: [], sorted: [...Array(n).keys()], active: [], message: 'Insertion sort complete!', pseudocodeLine: 8, phase: 'done' };
}

export function* mergeSort(arr) {
  if (arr.length === 0) {
    yield { data: [], comparing: [], swapping: [], sorted: [], active: [], message: 'Array is empty', pseudocodeLine: 0, phase: 'done' };
    return;
  }
  if (arr.length === 1) {
    yield { data: [...arr], comparing: [], swapping: [], sorted: [0], active: [], message: 'Array has only one element — already sorted', pseudocodeLine: 0, phase: 'done' };
    return;
  }

  const a = [...arr];
  const n = a.length;
  const sortedIndices = new Set();

  function* mergeSortHelper(left, right) {
    if (left >= right) {
      yield { data: [...a], comparing: [], swapping: [], sorted: [...sortedIndices], active: [left], message: `Base case: subarray [${left}] has one element (${a[left]?.val ?? a[left]})`, pseudocodeLine: 1, phase: 'base-case' };
      return;
    }

    const mid = Math.floor((left + right) / 2);

    yield { data: [...a], comparing: [], swapping: [], sorted: [...sortedIndices], active: Array.from({ length: right - left + 1 }, (_, k) => left + k), message: `Splitting [${left}..${right}] into [${left}..${mid}] and [${mid + 1}..${right}]`, pseudocodeLine: 2, phase: 'split' };

    yield* mergeSortHelper(left, mid);
    yield* mergeSortHelper(mid + 1, right);

    yield { data: [...a], comparing: [], swapping: [], sorted: [...sortedIndices], active: Array.from({ length: right - left + 1 }, (_, k) => left + k), message: `Merging [${left}..${mid}] and [${mid + 1}..${right}]`, pseudocodeLine: 5, phase: 'merge-start' };

    yield* merge(left, mid, right);
  }

  function* merge(left, mid, right) {
    const L = a.slice(left, mid + 1);
    const R = a.slice(mid + 1, right + 1);

    yield { data: [...a], comparing: [], swapping: [], sorted: [...sortedIndices], active: Array.from({ length: right - left + 1 }, (_, k) => left + k), message: `Temp arrays: L=[${L}], R=[${R}]`, pseudocodeLine: 9, phase: 'copy-temp' };

    let i = 0, j = 0, k = left;

    while (i < L.length && j < R.length) {
      yield { data: [...a], comparing: [left + i, mid + 1 + j], swapping: [], sorted: [...sortedIndices], active: [k], message: `Comparing L[${i}]=${L[i]?.val ?? L[i]} with R[${j}]=${R[j]?.val ?? R[j]}`, pseudocodeLine: 10, phase: 'merge-compare' };

      if ((L[i]?.val ?? L[i]) <= (R[j]?.val ?? R[j])) {
        a[k] = L[i];
        yield { data: [...a], comparing: [], swapping: [], sorted: [...sortedIndices], active: [k], message: `Placing ${L[i]?.val ?? L[i]} at position ${k}`, pseudocodeLine: 11, phase: 'merge-place' };
        i++;
      } else {
        a[k] = R[j];
        yield { data: [...a], comparing: [], swapping: [], sorted: [...sortedIndices], active: [k], message: `Placing ${R[j]?.val ?? R[j]} at position ${k}`, pseudocodeLine: 11, phase: 'merge-place' };
        j++;
      }
      k++;
    }

    while (i < L.length) {
      a[k] = L[i];
      yield { data: [...a], comparing: [], swapping: [], sorted: [...sortedIndices], active: [k], message: `Copying remaining L[${i}]=${L[i]?.val ?? L[i]} to position ${k}`, pseudocodeLine: 12, phase: 'merge-copy-remaining' };
      i++;
      k++;
    }

    while (j < R.length) {
      a[k] = R[j];
      yield { data: [...a], comparing: [], swapping: [], sorted: [...sortedIndices], active: [k], message: `Copying remaining R[${j}]=${R[j]?.val ?? R[j]} to position ${k}`, pseudocodeLine: 12, phase: 'merge-copy-remaining' };
      j++;
      k++;
    }

    if (left === 0 && right === n - 1) {
      for (let idx = left; idx <= right; idx++) sortedIndices.add(idx);
    }

    yield { data: [...a], comparing: [], swapping: [], sorted: [...sortedIndices], active: Array.from({ length: right - left + 1 }, (_, k) => left + k), message: `Merged [${left}..${right}] → [${a.slice(left, right + 1)}]`, pseudocodeLine: 5, phase: 'merge-end' };
  }

  yield* mergeSortHelper(0, n - 1);

  yield { data: [...a], comparing: [], swapping: [], sorted: [...Array(n).keys()], active: [], message: 'Merge sort complete!', pseudocodeLine: 0, phase: 'done' };
}

export function* quickSort(arr) {
  if (arr.length === 0) {
    yield { data: [], comparing: [], swapping: [], sorted: [], active: [], message: 'Array is empty', pseudocodeLine: 0, phase: 'done' };
    return;
  }
  if (arr.length === 1) {
    yield { data: [...arr], comparing: [], swapping: [], sorted: [0], active: [], message: 'Array has only one element — already sorted', pseudocodeLine: 0, phase: 'done' };
    return;
  }

  const a = [...arr];
  const n = a.length;
  const sortedIndices = new Set();

  function* partition(low, high) {
    const pivot = a[high];

    yield { data: [...a], comparing: [], swapping: [], sorted: [...sortedIndices], active: [high], message: `Pivot selected: arr[${high}]=${pivot?.val ?? pivot}`, pseudocodeLine: 7, phase: 'pivot-select' };

    let i = low - 1;

    for (let j = low; j < high; j++) {
      yield { data: [...a], comparing: [j, high], swapping: [], sorted: [...sortedIndices], active: [high], message: `Comparing arr[${j}]=${a[j]?.val ?? a[j]} with pivot=${pivot?.val ?? pivot}`, pseudocodeLine: 9, phase: 'partition-compare' };

      if ((a[j]?.val ?? a[j]) <= (pivot?.val ?? pivot)) {
        i++;
        if (i !== j) {
          yield { data: [...a], comparing: [], swapping: [i, j], sorted: [...sortedIndices], active: [high], message: `${a[j]?.val ?? a[j]} ≤ ${pivot?.val ?? pivot} — swapping arr[${i}]=${a[i]?.val ?? a[i]} and arr[${j}]=${a[j]?.val ?? a[j]}`, pseudocodeLine: 11, phase: 'partition-swap' };
          [a[i], a[j]] = [a[j], a[i]];
          yield { data: [...a], comparing: [], swapping: [i, j], sorted: [...sortedIndices], active: [high], message: `Swapped → arr[${i}]=${a[i]?.val ?? a[i]}, arr[${j}]=${a[j]?.val ?? a[j]}`, pseudocodeLine: 11, phase: 'partition-swap-done' };
        } else {
          yield { data: [...a], comparing: [], swapping: [], sorted: [...sortedIndices], active: [high], message: `${a[j]?.val ?? a[j]} ≤ ${pivot?.val ?? pivot} — already in place`, pseudocodeLine: 10, phase: 'partition-no-swap' };
        }
      }
    }

    const pivotPos = i + 1;
    if (pivotPos !== high) {
      yield { data: [...a], comparing: [], swapping: [pivotPos, high], sorted: [...sortedIndices], active: [], message: `Placing pivot ${pivot?.val ?? pivot} at position ${pivotPos}`, pseudocodeLine: 12, phase: 'pivot-place' };
      [a[pivotPos], a[high]] = [a[high], a[pivotPos]];
    }

    sortedIndices.add(pivotPos);
    yield { data: [...a], comparing: [], swapping: [], sorted: [...sortedIndices], active: [pivotPos], message: `Pivot ${pivot?.val ?? pivot} is now at its final position ${pivotPos}`, pseudocodeLine: 13, phase: 'pivot-final' };

    return pivotPos;
  }

  function* qs(low, high) {
    if (low < high) {
      const pi = yield* partition(low, high);

      yield { data: [...a], comparing: [], swapping: [], sorted: [...sortedIndices], active: Array.from({ length: high - low + 1 }, (_, k) => low + k), message: `Recursing into left [${low}..${pi - 1}] and right [${pi + 1}..${high}]`, pseudocodeLine: 2, phase: 'recurse' };

      yield* qs(low, pi - 1);
      yield* qs(pi + 1, high);
    } else if (low === high) {
      sortedIndices.add(low);
      yield { data: [...a], comparing: [], swapping: [], sorted: [...sortedIndices], active: [low], message: `Single element arr[${low}]=${a[low]?.val ?? a[low]} is in its final position`, pseudocodeLine: 1, phase: 'base-case' };
    }
  }

  yield* qs(0, n - 1);

  yield { data: [...a], comparing: [], swapping: [], sorted: [...Array(n).keys()], active: [], message: 'Quick sort complete!', pseudocodeLine: 0, phase: 'done' };
}
