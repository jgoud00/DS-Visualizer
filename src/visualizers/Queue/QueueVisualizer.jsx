import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useVisualizer } from '../../hooks/useVisualizer';
import VisualizerLayout from '../../components/VisualizerLayout/VisualizerLayout';
import { queueEnqueue, queueDequeue, queuePeekFront, QUEUE_MAX_SIZE } from '../../algorithms/queue';
import './QueueVisualizer.css';

const PSEUDOCODES = {
  enqueue: [
    'function enqueue(queue, value):',
    '  if queue is full: error (overflow)',
    '  queue[rear + 1] = value',
    '  rear = rear + 1',
    '  return queue',
  ],
  dequeue: [
    'function dequeue(queue):',
    '  if queue is empty: error (underflow)',
    '  value = queue[front]',
    '  remove front element',
    '  front = front + 1',
    '  return value',
  ],
  peek: [
    'function peekFront(queue):',
    '  if queue is empty: error (underflow)',
    '  return queue[front]  // no modification',
  ],
};

const COMPLEXITY = {
  enqueue: { time: 'O(1)', space: 'O(1)' },
  dequeue: { time: 'O(1)', space: 'O(1)' },
  peek: { time: 'O(1)', space: 'O(1)' },
};

const QueueVisualizer = () => {
  const visualizer = useVisualizer();
  const { currentStepData, steps } = visualizer;

  const [baseQueue, setBaseQueue] = useState([10, 20, 30]);
  const [inputValue, setInputValue] = useState('');
  const lastOp = useRef('enqueue');

  useEffect(() => {
    if (!visualizer.isPlaying && steps.length > 0 && visualizer.currentStep === steps.length - 1) {
      if (currentStepData?.data) {
        setBaseQueue(currentStepData.data);
      }
    }
  }, [visualizer.isPlaying, visualizer.currentStep, steps, currentStepData]);

  const handleEnqueue = () => {
    const val = parseInt(inputValue);
    if (isNaN(val)) return;
    lastOp.current = 'enqueue';
    visualizer.loadSteps(queueEnqueue, { queue: baseQueue, value: val });
  };

  const handleDequeue = () => {
    lastOp.current = 'dequeue';
    visualizer.loadSteps(queueDequeue, { queue: baseQueue });
  };

  const handlePeek = () => {
    lastOp.current = 'peek';
    visualizer.loadSteps(queuePeekFront, { queue: baseQueue });
  };

  const displayQueue = currentStepData?.data ?? baseQueue;
  const active = currentStepData?.active ?? [];
  const pointers = currentStepData?.pointers ?? {};

  const getBoxClass = (idx) => {
    if (active.includes(idx)) return 'active';
    return 'default';
  };

  const logs = steps.slice(0, visualizer.currentStep + 1).map((s) => s.message).filter(Boolean);

  return (
    <VisualizerLayout
      title="Queue"
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
      <div className="queue-workspace">
        <div className="input-controls panel">
          <input
            type="number"
            placeholder="Value"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="viz-input"
            disabled={visualizer.isPlaying}
          />
          <button onClick={handleEnqueue} disabled={visualizer.isPlaying} className="viz-btn primary-btn">
            Enqueue
          </button>
          <button onClick={handleDequeue} disabled={visualizer.isPlaying} className="viz-btn primary-btn">
            Dequeue
          </button>
          <button onClick={handlePeek} disabled={visualizer.isPlaying} className="viz-btn primary-btn">
            Peek Front
          </button>
        </div>

        {currentStepData?.phase === 'Error' && (
          <div className="queue-error-msg">{currentStepData.message}</div>
        )}

        <div className="queue-canvas">
          <div className="queue-container panel">
            <AnimatePresence mode="popLayout">
              {displayQueue.map((val, idx) => {
                const isFront = pointers.FRONT === idx;
                const isRear = pointers.REAR === idx;

                return (
                  <motion.div
                    key={`${idx}-${val}`}
                    layout
                    initial={{ opacity: 0, x: 60 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -60, transition: { duration: 0.2 } }}
                    className={`queue-box ${getBoxClass(idx)}`}
                    transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                  >
                    <div className="queue-value">{val}</div>
                    {(isFront || isRear) && (
                      <div className="queue-pointer">
                        <span className="pointer-arrow">↑</span>
                        {isFront && 'FRONT'}
                        {isFront && isRear && ', '}
                        {isRear && 'REAR'}
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </AnimatePresence>
            {displayQueue.length === 0 && <div className="empty-queue-text">Queue is Empty</div>}
          </div>
        </div>

        {currentStepData?.message && currentStepData.phase !== 'Error' && (
          <div className="queue-step-msg">{currentStepData.message}</div>
        )}
      </div>
    </VisualizerLayout>
  );
};

export default QueueVisualizer;
