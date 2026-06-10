import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useVisualizer } from '../../hooks/useVisualizer';
import VisualizerLayout from '../../components/VisualizerLayout/VisualizerLayout';
import { arrayInsert, arrayDelete, arrayLinearSearch } from '../../algorithms/array';
import './ArrayVisualizer.css';

const PSEUDOCODES = {
  insert: [
    'function insert(arr, index, value):',
    '  if index < 0 or index > length: error',
    '  for i from length-1 down to index:',
    '    arr[i+1] = arr[i]  // shift right',
    '  arr[index] = value',
    '  return arr',
  ],
  delete: [
    'function delete(arr, index):',
    '  if index < 0 or index >= length: error',
    '  target = arr[index]',
    '  for i from index to length-2:',
    '    arr[i] = arr[i+1]  // shift left',
    '  remove last element',
    '  return arr',
  ],
  search: [
    'function linearSearch(arr, target):',
    '  for i from 0 to length-1:',
    '    if arr[i] == target:',
    '      return i  // found!',
    '  return -1  // not found',
  ],
};

const COMPLEXITY = {
  insert: { time: 'O(n)', space: 'O(1)' },
  delete: { time: 'O(n)', space: 'O(1)' },
  search: { time: 'O(n)', space: 'O(1)' },
};

const ArrayVisualizer = () => {
  const visualizer = useVisualizer();
  const { currentStepData, steps } = visualizer;

  const [baseArray, setBaseArray] = useState(() => [5, 12, 8, 20, 3, 15].map(val => ({ id: crypto.randomUUID?.() || Math.random().toString(36).substr(2, 9), val })));
  const [inputValue, setInputValue] = useState('');
  const [inputIndex, setInputIndex] = useState('');
  const lastOp = useRef('insert');

  useEffect(() => {
    if (!visualizer.isPlaying && steps.length > 0 && visualizer.currentStep === steps.length - 1) {
      if (currentStepData?.data) {
        setBaseArray(currentStepData.data);
      }
    }
  }, [visualizer.isPlaying, visualizer.currentStep, steps, currentStepData]);

  const handleInsert = () => {
    const val = parseInt(inputValue);
    const idx = parseInt(inputIndex);
    if (isNaN(val) || isNaN(idx) || idx < 0 || idx > baseArray.length) return;
    lastOp.current = 'insert';
    visualizer.loadSteps(arrayInsert, { arr: baseArray, index: idx, item: { id: crypto.randomUUID?.() || Math.random().toString(36).substr(2, 9), val } });
  };

  const handleDelete = () => {
    const idx = parseInt(inputIndex);
    if (isNaN(idx) || idx < 0 || idx >= baseArray.length) return;
    lastOp.current = 'delete';
    visualizer.loadSteps(arrayDelete, { arr: baseArray, index: idx });
  };

  const handleSearch = () => {
    const val = parseInt(inputValue);
    if (isNaN(val)) return;
    lastOp.current = 'search';
    visualizer.loadSteps(arrayLinearSearch, { arr: baseArray, target: val });
  };

  const displayArray = currentStepData?.data ?? baseArray;
  const comparing = currentStepData?.comparing ?? [];
  const swapping = currentStepData?.swapping ?? [];
  const active = currentStepData?.active ?? [];
  const sorted = currentStepData?.sorted ?? [];
  const pointers = currentStepData?.pointers ?? {};

  const getBoxClass = (idx) => {
    if (comparing.includes(idx)) return 'comparing';
    if (swapping.includes(idx)) return 'active';
    if (active.includes(idx)) return 'success';
    if (sorted.includes(idx)) return 'default';
    return 'default';
  };

  return (
    <VisualizerLayout
      title="Array"
      controlsProps={{
        isPlaying: visualizer.isPlaying,
        onPlay: visualizer.play,
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
        pseudocode: PSEUDOCODES[lastOp.current],
        activeLine: currentStepData?.pseudocodeLine ?? null,
        complexity: COMPLEXITY[lastOp.current],
        logs: steps.slice(0, visualizer.currentStep + 1).map(s => s.message).filter(Boolean),
      }}
    >
      <div className="array-workspace">
        <div className="input-controls panel">
          <input
            type="number"
            placeholder="Value"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="viz-input"
            disabled={visualizer.isPlaying}
          />
          <input
            type="number"
            placeholder="Index"
            value={inputIndex}
            onChange={(e) => setInputIndex(e.target.value)}
            className="viz-input"
            disabled={visualizer.isPlaying}
          />
          <button onClick={handleInsert} disabled={visualizer.isPlaying} className="viz-btn primary-btn">Insert</button>
          <button onClick={handleDelete} disabled={visualizer.isPlaying} className="viz-btn primary-btn">Delete</button>
          <button onClick={handleSearch} disabled={visualizer.isPlaying} className="viz-btn primary-btn">Search</button>
        </div>

        {currentStepData?.phase === 'Error' && (
          <div className="array-error-msg">{currentStepData.message}</div>
        )}

        <div className="array-canvas">
          <AnimatePresence>
            {displayArray.map((item, idx) => {
              const val = item.val !== undefined ? item.val : item;
              const itemId = item.id !== undefined ? item.id : `${idx}-${val}`;
              
              const pointerLabels = Object.entries(pointers)
                .filter(([, v]) => v === idx)
                .map(([k]) => k);

              return (
                <motion.div
                  key={itemId}
                  layout
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  className={`array-box ${getBoxClass(idx)}`}
                  transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                >
                  {pointerLabels.length > 0 && (
                    <div className="array-pointer">
                      {pointerLabels.join(', ')}
                      <span className="pointer-arrow">↓</span>
                    </div>
                  )}
                  <div className="array-value">{val}</div>
                  <div className="array-index">{idx}</div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {currentStepData?.message && currentStepData.phase !== 'Error' && (
          <div className="array-step-msg">{currentStepData.message}</div>
        )}
      </div>
    </VisualizerLayout>
  );
};

export default ArrayVisualizer;
