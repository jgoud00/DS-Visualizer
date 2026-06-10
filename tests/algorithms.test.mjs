// Comprehensive algorithm tests for DS-Visualizer
// Tests all sorting and searching generators end-to-end

let passed = 0;
let failed = 0;

function assert(condition, msg) {
  if (condition) {
    passed++;
    console.log(`  ✅ ${msg}`);
  } else {
    failed++;
    console.error(`  ❌ ${msg}`);
  }
}

function getVals(arr) {
  return arr.map(item => item?.val !== undefined ? item.val : item);
}

function makeWrapped(arr) {
  return arr.map((val, i) => ({ id: `id-${i}`, val }));
}

async function runTests() {
  const sorting = await import('../src/algorithms/sorting.js');
  const searching = await import('../src/algorithms/searching.js');

  // ─── Helper to collect all steps from a generator ───
  function collectSteps(gen) {
    const steps = [];
    let result = gen.next();
    while (!result.done) {
      steps.push(result.value);
      result = gen.next();
    }
    return steps;
  }

  // ═══════════════════════════════════════════
  // SORTING TESTS
  // ═══════════════════════════════════════════
  console.log('\n── Bubble Sort ──');
  {
    const arr = makeWrapped([5, 3, 8, 1, 9, 2]);
    const steps = collectSteps(sorting.bubbleSort(arr));
    assert(steps.length > 0, `Produces steps (${steps.length})`);
    const finalData = steps[steps.length - 1].data;
    const finalVals = getVals(finalData);
    assert(JSON.stringify(finalVals) === JSON.stringify([1,2,3,5,8,9]), `Sorts correctly: [${finalVals}]`);
    assert(steps[steps.length - 1].phase === 'done' || steps[steps.length - 1].phase === 'early-termination', `Ends with done/early-termination phase`);
    assert(steps.every(s => s.data && Array.isArray(s.comparing)), 'All steps have data and comparing arrays');
  }
  {
    const arr = makeWrapped([1]);
    const steps = collectSteps(sorting.bubbleSort(arr));
    assert(steps.length === 1, 'Single element: 1 step');
  }
  {
    const arr = makeWrapped([]);
    const steps = collectSteps(sorting.bubbleSort(arr));
    assert(steps.length === 1, 'Empty array: 1 step');
  }
  {
    const arr = makeWrapped([1,2,3,4,5]);
    const steps = collectSteps(sorting.bubbleSort(arr));
    const finalVals = getVals(steps[steps.length - 1].data);
    assert(JSON.stringify(finalVals) === JSON.stringify([1,2,3,4,5]), 'Already sorted array stays sorted');
  }

  console.log('\n── Selection Sort ──');
  {
    const arr = makeWrapped([64, 25, 12, 22, 11]);
    const steps = collectSteps(sorting.selectionSort(arr));
    assert(steps.length > 0, `Produces steps (${steps.length})`);
    const finalVals = getVals(steps[steps.length - 1].data);
    assert(JSON.stringify(finalVals) === JSON.stringify([11,12,22,25,64]), `Sorts correctly: [${finalVals}]`);
  }

  console.log('\n── Insertion Sort ──');
  {
    const arr = makeWrapped([12, 11, 13, 5, 6]);
    const steps = collectSteps(sorting.insertionSort(arr));
    assert(steps.length > 0, `Produces steps (${steps.length})`);
    const finalVals = getVals(steps[steps.length - 1].data);
    assert(JSON.stringify(finalVals) === JSON.stringify([5,6,11,12,13]), `Sorts correctly: [${finalVals}]`);
  }

  console.log('\n── Merge Sort ──');
  {
    const arr = makeWrapped([38, 27, 43, 3, 9, 82, 10]);
    const steps = collectSteps(sorting.mergeSort(arr));
    assert(steps.length > 0, `Produces steps (${steps.length})`);
    const finalVals = getVals(steps[steps.length - 1].data);
    assert(JSON.stringify(finalVals) === JSON.stringify([3,9,10,27,38,43,82]), `Sorts correctly: [${finalVals}]`);
  }

  console.log('\n── Quick Sort ──');
  {
    const arr = makeWrapped([10, 80, 30, 90, 40, 50, 70]);
    const steps = collectSteps(sorting.quickSort(arr));
    assert(steps.length > 0, `Produces steps (${steps.length})`);
    const finalVals = getVals(steps[steps.length - 1].data);
    assert(JSON.stringify(finalVals) === JSON.stringify([10,30,40,50,70,80,90]), `Sorts correctly: [${finalVals}]`);
  }

  // ═══════════════════════════════════════════
  // SEARCHING TESTS
  // ═══════════════════════════════════════════
  console.log('\n── Linear Search ──');
  {
    const arr = makeWrapped([10, 20, 30, 40, 50]);
    const steps = collectSteps(searching.linearSearch({ arr, target: 30 }));
    assert(steps.length > 0, `Produces steps (${steps.length})`);
    const lastStep = steps[steps.length - 1];
    assert(lastStep.phase === 'found', 'Finds existing target');
    assert(lastStep.active.includes(2), 'Correct index for target 30');
  }
  {
    const arr = makeWrapped([10, 20, 30, 40, 50]);
    const steps = collectSteps(searching.linearSearch({ arr, target: 99 }));
    const lastStep = steps[steps.length - 1];
    assert(lastStep.phase === 'not-found', 'Reports not-found for missing target');
  }
  {
    const steps = collectSteps(searching.linearSearch({ arr: [], target: 5 }));
    assert(steps.length === 1 && steps[0].phase === 'error', 'Empty array returns error');
  }

  console.log('\n── Binary Search ──');
  {
    const arr = makeWrapped([10, 20, 30, 40, 50, 60, 70]);
    const steps = collectSteps(searching.binarySearch({ arr, target: 40 }));
    assert(steps.length > 0, `Produces steps (${steps.length})`);
    const lastStep = steps[steps.length - 1];
    assert(lastStep.phase === 'found', 'Finds existing target');
    assert(lastStep.active.includes(3), 'Correct index for target 40');
  }
  {
    const arr = makeWrapped([10, 20, 30, 40, 50]);
    const steps = collectSteps(searching.binarySearch({ arr, target: 35 }));
    const lastStep = steps[steps.length - 1];
    assert(lastStep.phase === 'not-found', 'Reports not-found for missing target');
  }
  {
    const arr = makeWrapped([10, 20, 30, 40, 50]);
    const steps = collectSteps(searching.binarySearch({ arr, target: 10 }));
    const lastStep = steps[steps.length - 1];
    assert(lastStep.phase === 'found', 'Finds first element');
  }
  {
    const arr = makeWrapped([10, 20, 30, 40, 50]);
    const steps = collectSteps(searching.binarySearch({ arr, target: 50 }));
    const lastStep = steps[steps.length - 1];
    assert(lastStep.phase === 'found', 'Finds last element');
  }

  // ═══════════════════════════════════════════
  // STEP DATA INTEGRITY TESTS
  // ═══════════════════════════════════════════
  console.log('\n── Step Data Integrity ──');
  {
    const arr = makeWrapped([5, 3, 8, 1]);
    const steps = collectSteps(sorting.bubbleSort(arr));
    const allValid = steps.every(s =>
      Array.isArray(s.data) &&
      Array.isArray(s.comparing) &&
      Array.isArray(s.swapping) &&
      Array.isArray(s.sorted) &&
      Array.isArray(s.active) &&
      typeof s.message === 'string' &&
      typeof s.pseudocodeLine === 'number' &&
      typeof s.phase === 'string'
    );
    assert(allValid, 'All bubble sort steps have required fields');
  }
  {
    const arr = makeWrapped([10, 20, 30]);
    const steps = collectSteps(searching.linearSearch({ arr, target: 20 }));
    const allValid = steps.every(s =>
      Array.isArray(s.data) &&
      Array.isArray(s.comparing) &&
      Array.isArray(s.active) &&
      typeof s.message === 'string' &&
      typeof s.phase === 'string'
    );
    assert(allValid, 'All linear search steps have required fields');
  }
  {
    const arr = makeWrapped([10, 20, 30]);
    const steps = collectSteps(searching.binarySearch({ arr, target: 20 }));
    const allValid = steps.every(s =>
      s.pointers !== undefined &&
      Array.isArray(s.data)
    );
    assert(allValid, 'All binary search steps have pointers');
  }

  // ═══════════════════════════════════════════
  // LARGE ARRAY STRESS TESTS
  // ═══════════════════════════════════════════
  console.log('\n── Stress Tests ──');
  {
    const arr = makeWrapped(Array.from({ length: 50 }, () => Math.floor(Math.random() * 100)));
    const steps = collectSteps(sorting.bubbleSort([...arr]));
    const finalVals = getVals(steps[steps.length - 1].data);
    const isSorted = finalVals.every((v, i) => i === 0 || v >= finalVals[i - 1]);
    assert(isSorted, `Bubble sort 50 elements: sorted correctly`);
  }
  {
    const arr = makeWrapped(Array.from({ length: 50 }, () => Math.floor(Math.random() * 100)));
    const steps = collectSteps(sorting.mergeSort([...arr]));
    const finalVals = getVals(steps[steps.length - 1].data);
    const isSorted = finalVals.every((v, i) => i === 0 || v >= finalVals[i - 1]);
    assert(isSorted, `Merge sort 50 elements: sorted correctly`);
  }
  {
    const arr = makeWrapped(Array.from({ length: 50 }, () => Math.floor(Math.random() * 100)));
    const steps = collectSteps(sorting.quickSort([...arr]));
    const finalVals = getVals(steps[steps.length - 1].data);
    const isSorted = finalVals.every((v, i) => i === 0 || v >= finalVals[i - 1]);
    assert(isSorted, `Quick sort 50 elements: sorted correctly`);
  }

  // ═══════════════════════════════════════════
  // SUMMARY
  // ═══════════════════════════════════════════
  console.log('\n══════════════════════════════════');
  console.log(`  Total: ${passed + failed} | ✅ Passed: ${passed} | ❌ Failed: ${failed}`);
  console.log('══════════════════════════════════\n');

  if (failed > 0) process.exit(1);
}

runTests().catch(err => {
  console.error('Test runner error:', err);
  process.exit(1);
});
