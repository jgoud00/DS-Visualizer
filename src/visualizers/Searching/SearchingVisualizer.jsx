import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useVisualizer } from '../../hooks/useVisualizer';
import VisualizerLayout from '../../components/VisualizerLayout/VisualizerLayout';
import { linearSearch, binarySearch } from '../../algorithms/searching';
import './SearchingVisualizer.css';

const PSEUDOCODE = {
  linear: [
    'function linearSearch(arr, target):',
    '  for i from 0 to length-1:',
    '    if arr[i] == target:',
    '      return i  // found!',
    '  return -1  // not found',
  ],
  binary: [
    'function binarySearch(arr, target):',
    '  low = 0, high = length-1',
    '  while low <= high:',
    '    mid = floor((low+high)/2)',
    '    if arr[mid] == target:',
    '      return mid',
    '    else if arr[mid] < target:',
    '      low = mid + 1',
    '    else:',
    '      high = mid - 1',
    '  return -1  // not found',
  ],
};

const COMPLEXITY = {
  linear: { time: 'O(n)', space: 'O(1)' },
  binary: { time: 'O(log n)', space: 'O(1)' },
};

const generateArray = (sorted = false) => {
  const arr = Array.from({ length: 15 }, () => Math.floor(Math.random() * 90) + 10);
  if (sorted) arr.sort((a, b) => a - b);
  return arr.map(val => ({ id: crypto.randomUUID?.() || Math.random().toString(36).substr(2, 9), val }));
};

const SearchingVisualizer = () => {
  const visualizer = useVisualizer();
  const { currentStepData, steps } = visualizer;

  const [baseArray, setBaseArray] = useState(() => generateArray());
  const [target, setTarget] = useState('');
  const [algorithm, setAlgorithm] = useState('linear');

  useEffect(() => {
    setBaseArray(generateArray(algorithm === 'binary'));
    visualizer.reset();
  }, [algorithm]);

  const handleNewArray = () => {
    setBaseArray(generateArray(algorithm === 'binary'));
    visualizer.reset();
  };

  const handleSearch = () => {
    const val = parseInt(target);
    if (isNaN(val)) {
      alert('Please enter a target number to search for.');
      return;
    }
    const fn = algorithm === 'linear' ? linearSearch : binarySearch;
    visualizer.loadSteps(fn, { arr: [...baseArray], target: val });
    visualizer.play();
  };

  const displayArray = currentStepData?.data ?? baseArray;
  const comparing = currentStepData?.comparing ?? [];
  const active = currentStepData?.active ?? [];
  const eliminated = currentStepData?.eliminated ?? [];
  const pointers = currentStepData?.pointers ?? {};

  const logs = useMemo(
    () => steps.slice(0, visualizer.currentStep + 1).map((s) => s.message).filter(Boolean),
    [steps, visualizer.currentStep]
  );

  const getBoxState = (idx) => {
    if (active.includes(idx)) return 'success';
    if (comparing.includes(idx)) return 'comparing';
    return 'default';
  };

  const pointerLabels = useMemo(() => {
    const labels = {};
    if (pointers.LOW !== undefined) labels[pointers.LOW] = [...(labels[pointers.LOW] || []), 'L'];
    if (pointers.HIGH !== undefined) labels[pointers.HIGH] = [...(labels[pointers.HIGH] || []), 'H'];
    if (pointers.MID !== undefined) labels[pointers.MID] = [...(labels[pointers.MID] || []), 'M'];
    return labels;
  }, [pointers]);

  return (
    <VisualizerLayout
      title="Searching Algorithms"
      controlsProps={{
        isPlaying: visualizer.isPlaying,
        onPlay: handleSearch,
        onPause: visualizer.pause,
        onStep: visualizer.stepForward,
        onStepBack: visualizer.stepBackward,
        onReset: visualizer.reset,
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
      <div className="search-workspace">
        <div className="input-controls panel">
          <select
            value={algorithm}
            onChange={(e) => setAlgorithm(e.target.value)}
            disabled={visualizer.isPlaying}
            className="viz-select"
          >
            <option value="linear">Linear Search</option>
            <option value="binary">Binary Search</option>
          </select>

          <input
            type="number"
            placeholder="Target"
            value={target}
            onChange={(e) => setTarget(e.target.value)}
            className="viz-input"
          />

          <button onClick={handleSearch} disabled={visualizer.isPlaying} className="viz-btn primary-btn">
            Search
          </button>
          <button onClick={handleNewArray} disabled={visualizer.isPlaying} className="viz-btn primary-btn">
            New Array
          </button>
        </div>

        <div className="search-canvas">
          <div className="search-array-wrapper">
            <div className="search-boxes-container">
              {displayArray.map((item, idx) => {
                const val = item.val !== undefined ? item.val : item;
                const itemId = item.id !== undefined ? item.id : idx;
                const state = getBoxState(idx);
                const isEliminated = eliminated.includes(idx);
                const labels = pointerLabels[idx];

                return (
                  <motion.div
                    key={itemId}
                    className={`search-box ${state}`}
                    style={{ opacity: isEliminated ? 0.3 : 1 }}
                    layout
                    transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                  >
                    {labels && (
                      <div className="pointer-labels-top">
                        {labels.map((l) => (
                          <span key={l} className="pointer-tag">{l}</span>
                        ))}
                      </div>
                    )}
                    {val}
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </VisualizerLayout>
  );
};

export default SearchingVisualizer;
