import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useVisualizer } from '../../hooks/useVisualizer';
import VisualizerLayout from '../../components/VisualizerLayout/VisualizerLayout';
import { bubbleSort, selectionSort, insertionSort, mergeSort, quickSort } from '../../algorithms/sorting';
import './SortingVisualizer.css';

const ALGORITHMS = {
  bubble: { fn: bubbleSort, label: 'Bubble Sort' },
  selection: { fn: selectionSort, label: 'Selection Sort' },
  insertion: { fn: insertionSort, label: 'Insertion Sort' },
  merge: { fn: mergeSort, label: 'Merge Sort' },
  quick: { fn: quickSort, label: 'Quick Sort' },
};

const PSEUDOCODE = {
  bubble: ['function bubbleSort(arr):', '  for i from 0 to n-1:', '    swapped = false', '    for j from 0 to n-i-2:', '      if arr[j] > arr[j+1]:', '        swap(arr[j], arr[j+1])', '        swapped = true', '    if not swapped: break', '  return arr'],
  selection: ['function selectionSort(arr):', '  for i from 0 to n-1:', '    minIndex = i', '    for j from i+1 to n-1:', '      if arr[j] < arr[minIndex]:', '        minIndex = j', '    swap(arr[i], arr[minIndex])', '  return arr'],
  insertion: ['function insertionSort(arr):', '  for i from 1 to n-1:', '    key = arr[i]', '    j = i - 1', '    while j >= 0 and arr[j] > key:', '      arr[j+1] = arr[j]', '      j = j - 1', '    arr[j+1] = key', '  return arr'],
  merge: ['function mergeSort(arr, l, r):', '  if l >= r: return', '  mid = (l + r) / 2', '  mergeSort(arr, l, mid)', '  mergeSort(arr, mid+1, r)', '  merge(arr, l, mid, r)', '', 'function merge(l, mid, r):', '  create L[], R[]', '  copy elements', '  compare L[i] and R[j]', '  place smaller into arr[k]', '  copy remaining'],
  quick: ['function quickSort(arr, lo, hi):', '  if lo < hi:', '    pi = partition(lo, hi)', '    quickSort(lo, pi-1)', '    quickSort(pi+1, hi)', '', 'function partition(lo, hi):', '  pivot = arr[hi]', '  i = lo - 1', '  for j from lo to hi-1:', '    if arr[j] <= pivot:', '      i++', '      swap(arr[i], arr[j])', '  swap(arr[i+1], arr[hi])', '  return i + 1'],
};

const COMPLEXITY = {
  bubble: { time: 'O(n²)', space: 'O(1)' },
  selection: { time: 'O(n²)', space: 'O(1)' },
  insertion: { time: 'O(n²)', space: 'O(1)' },
  merge: { time: 'O(n log n)', space: 'O(n)' },
  quick: { time: 'O(n log n) avg', space: 'O(log n)' },
};

const generateRandomArray = (size) =>
  Array.from({ length: size }, () => Math.floor(Math.random() * 90) + 10).map(val => ({ id: crypto.randomUUID?.() || Math.random().toString(36).substr(2, 9), val }));

const SortingVisualizer = () => {
  const visualizer = useVisualizer();
  const { currentStepData, steps } = visualizer;

  const [arraySize, setArraySize] = useState(20);
  const [baseArray, setBaseArray] = useState(() => generateRandomArray(20));
  const [algorithm, setAlgorithm] = useState('bubble');

  useEffect(() => {
    setBaseArray(generateRandomArray(arraySize));
  }, [arraySize]);

  const handleSort = () => {
    visualizer.loadSteps(ALGORITHMS[algorithm].fn, [...baseArray]);
  };

  const onPlay = () => {
    if (steps.length === 0) handleSort();
    visualizer.play();
  };

  const displayArray = currentStepData?.data ?? baseArray;
  const comparing = currentStepData?.comparing ?? [];
  const swapping = currentStepData?.swapping ?? [];
  const active = currentStepData?.active ?? [];
  const sorted = currentStepData?.sorted ?? [];

  const maxVal = useMemo(() => Math.max(...displayArray.map(item => item.val ?? item), 1), [displayArray]);

  const getBarColor = (idx) => {
    if (sorted.includes(idx)) return 'success';
    if (swapping.includes(idx)) return 'active';
    if (comparing.includes(idx)) return 'comparing';
    if (active.includes(idx)) return 'active';
    return 'default';
  };

  const logs = useMemo(
    () => steps.slice(0, visualizer.currentStep + 1).map((s) => s.message).filter(Boolean),
    [steps, visualizer.currentStep]
  );

  return (
    <VisualizerLayout
      title="Sorting Algorithms"
      controlsProps={{
        isPlaying: visualizer.isPlaying,
        onPlay,
        onPause: visualizer.pause,
        onStep: visualizer.stepForward,
        onStepBack: visualizer.stepBackward,
        onReset: () => { visualizer.reset(); },
        onSpeedChange: visualizer.setSpeed,
        speed: visualizer.speed,
        totalSteps: steps.length,
        currentStep: visualizer.currentStep,
      }}
      infoPanelProps={{
        pseudocode: PSEUDOCODE[algorithm],
        activeLine: currentStepData?.pseudocodeLine ?? null,
        complexity: COMPLEXITY[algorithm],
        logs,
      }}
    >
      <div className="sorting-workspace">
        <div className="input-controls panel">
          <select
            value={algorithm}
            onChange={(e) => { setAlgorithm(e.target.value); visualizer.reset(); }}
            disabled={visualizer.isPlaying}
            className="viz-select"
          >
            {Object.entries(ALGORITHMS).map(([key, { label }]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>

          <div className="size-slider">
            <label>Size: {arraySize}</label>
            <input
              type="range"
              min="5"
              max="50"
              value={arraySize}
              onChange={(e) => setArraySize(Number(e.target.value))}
              disabled={visualizer.isPlaying}
            />
          </div>

          <button
            onClick={() => { setBaseArray(generateRandomArray(arraySize)); visualizer.reset(); }}
            disabled={visualizer.isPlaying}
            className="viz-btn primary-btn"
          >
            Randomize
          </button>
        </div>

        <div className="sorting-canvas">
          <AnimatePresence>
            {displayArray.map((item, idx) => {
              const val = item.val !== undefined ? item.val : item;
              const itemId = item.id !== undefined ? item.id : `bar-${idx}`;
              const state = getBarColor(idx);
              const isSwapping = swapping.includes(idx);
              const isComparing = comparing.includes(idx);

              return (
                <motion.div
                  key={itemId}
                  layout
                  className={`sort-bar ${state}`}
                  style={{ height: `${(val / maxVal) * 100}%`, flex: 1, maxWidth: '40px' }}
                  animate={{ scale: isSwapping ? 1.05 : isComparing ? 1.02 : 1 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                >
                  {arraySize <= 25 && <span className="sort-val">{val}</span>}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>
    </VisualizerLayout>
  );
};

export default SortingVisualizer;
