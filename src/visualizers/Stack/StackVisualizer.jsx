import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useVisualizer } from '../../hooks/useVisualizer';
import VisualizerLayout from '../../components/VisualizerLayout/VisualizerLayout';
import { stackPush, stackPop, stackPeek, STACK_MAX_SIZE } from '../../algorithms/stack';
import './StackVisualizer.css';

const PSEUDOCODES = {
  push: [
    'function push(stack, value):',
    '  if stack is full: error (overflow)',
    '  stack[top + 1] = value',
    '  top = top + 1',
    '  return stack',
  ],
  pop: [
    'function pop(stack):',
    '  if stack is empty: error (underflow)',
    '  value = stack[top]',
    '  top = top - 1',
    '  return value',
  ],
  peek: [
    'function peek(stack):',
    '  if stack is empty: error (underflow)',
    '  return stack[top]  // no modification',
  ],
};

const COMPLEXITY = {
  push: { time: 'O(1)', space: 'O(1)' },
  pop: { time: 'O(1)', space: 'O(1)' },
  peek: { time: 'O(1)', space: 'O(1)' },
};

const StackVisualizer = () => {
  const visualizer = useVisualizer();
  const { currentStepData, steps } = visualizer;

  const [baseStack, setBaseStack] = useState([10, 20, 30]);
  const [inputValue, setInputValue] = useState('');
  const lastOp = useRef('push');

  useEffect(() => {
    if (!visualizer.isPlaying && steps.length > 0 && visualizer.currentStep === steps.length - 1) {
      if (currentStepData?.data) {
        setBaseStack(currentStepData.data);
      }
    }
  }, [visualizer.isPlaying, visualizer.currentStep, steps, currentStepData]);

  const handlePush = () => {
    const val = parseInt(inputValue);
    if (isNaN(val)) return;
    lastOp.current = 'push';
    visualizer.loadSteps(stackPush, { stack: baseStack, value: val });
  };

  const handlePop = () => {
    lastOp.current = 'pop';
    visualizer.loadSteps(stackPop, { stack: baseStack });
  };

  const handlePeek = () => {
    lastOp.current = 'peek';
    visualizer.loadSteps(stackPeek, { stack: baseStack });
  };

  const displayStack = currentStepData?.data ?? baseStack;
  const active = currentStepData?.active ?? [];
  const pointers = currentStepData?.pointers ?? {};

  const getBoxClass = (idx) => {
    if (active.includes(idx)) return 'active';
    return 'default';
  };

  const logs = steps.slice(0, visualizer.currentStep + 1).map((s) => s.message).filter(Boolean);

  return (
    <VisualizerLayout
      title="Stack"
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
        logs,
      }}
    >
      <div className="stack-workspace">
        <div className="input-controls panel">
          <input
            type="number"
            placeholder="Value"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="viz-input"
            disabled={visualizer.isPlaying}
          />
          <button onClick={handlePush} disabled={visualizer.isPlaying} className="viz-btn primary-btn">
            Push
          </button>
          <button onClick={handlePop} disabled={visualizer.isPlaying} className="viz-btn primary-btn">
            Pop
          </button>
          <button onClick={handlePeek} disabled={visualizer.isPlaying} className="viz-btn primary-btn">
            Peek
          </button>
        </div>

        {currentStepData?.phase === 'Error' && (
          <div className="stack-error-msg">{currentStepData.message}</div>
        )}

        <div className="stack-canvas">
          <div className="stack-container panel">
            <div className="stack-base">
              <AnimatePresence mode="popLayout">
                {displayStack.slice().reverse().map((val, idx) => {
                  const originalIndex = displayStack.length - 1 - idx;
                  const isTop = pointers.TOP === originalIndex;

                  return (
                    <motion.div
                      key={`${originalIndex}-${val}`}
                      layout
                      initial={{ opacity: 0, y: -40 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -40, transition: { duration: 0.2 } }}
                      className={`stack-box ${getBoxClass(originalIndex)}`}
                      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                    >
                      <div className="stack-value">{val}</div>
                      {isTop && (
                        <div className="stack-pointer">
                          <span className="pointer-arrow">←</span>
                          TOP
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </AnimatePresence>
              {displayStack.length === 0 && <div className="empty-stack-text">Stack is Empty</div>}
            </div>
          </div>
        </div>

        {currentStepData?.message && currentStepData.phase !== 'Error' && (
          <div className="stack-step-msg">{currentStepData.message}</div>
        )}
      </div>
    </VisualizerLayout>
  );
};

export default StackVisualizer;
