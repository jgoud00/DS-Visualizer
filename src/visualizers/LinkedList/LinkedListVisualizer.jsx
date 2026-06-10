import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useVisualizer } from '../../hooks/useVisualizer';
import VisualizerLayout from '../../components/VisualizerLayout/VisualizerLayout';
import { llInsertHead, llInsertTail, llInsertAtIndex, llDeleteByValue, llSearch, llReverse } from '../../algorithms/linkedList';
import './LinkedListVisualizer.css';

const PSEUDOCODES = {
  insertHead: [
    'function insertHead(list, value):',
    '  newNode = createNode(value)',
    '  newNode.next = head',
    '  head = newNode',
    '  return list',
  ],
  insertTail: [
    'function insertTail(list, value):',
    '  newNode = createNode(value)',
    '  if head is null:',
    '    head = newNode; return',
    '  curr = head',
    '  while curr.next not null:',
    '    curr = curr.next',
    '  curr.next = newNode',
  ],
  insertAtIndex: [
    'function insertAtIndex(list, i, val):',
    '  if i out of bounds: error',
    '  if i == 0: insertHead(val)',
    '  newNode = createNode(val)',
    '  curr = head, count = 0',
    '  while count < i - 1:',
    '    curr = curr.next',
    '  newNode.next = curr.next',
    '  curr.next = newNode',
  ],
  deleteByValue: [
    'function delete(list, value):',
    '  if empty: error',
    '  if head.val == value:',
    '    head = head.next; return',
    '  prev = head, curr = head.next',
    '  while curr not null:',
    '    if curr.val == value:',
    '      prev.next = curr.next',
    '      return',
    '    prev = curr; curr = curr.next',
    '  not found',
  ],
  search: [
    'function search(list, value):',
    '  curr = head',
    '  while curr not null:',
    '    if curr.val == value:',
    '      return curr',
    '    curr = curr.next',
    '  return null',
  ],
  reverse: [
    'function reverse(list):',
    '  prev = null',
    '  curr = head',
    '  while curr not null:',
    '    next = curr.next',
    '    curr.next = prev',
    '    prev = curr',
    '    curr = next',
    '  head = prev',
  ],
};

const COMPLEXITY = {
  insertHead: { time: 'O(1)', space: 'O(1)' },
  insertTail: { time: 'O(n)', space: 'O(1)' },
  insertAtIndex: { time: 'O(n)', space: 'O(1)' },
  deleteByValue: { time: 'O(n)', space: 'O(1)' },
  search: { time: 'O(n)', space: 'O(1)' },
  reverse: { time: 'O(n)', space: 'O(1)' },
};

const LinkedListVisualizer = () => {
  const visualizer = useVisualizer();
  const { currentStepData, steps } = visualizer;

  const initialNodes = [
    { id: 'n1', value: 10, next: 'n2' },
    { id: 'n2', value: 20, next: 'n3' },
    { id: 'n3', value: 30, next: null }
  ];
  const initialHeadId = 'n1';

  const [baseNodes, setBaseNodes] = useState(initialNodes);
  const [baseHeadId, setBaseHeadId] = useState(initialHeadId);
  
  const [inputValue, setInputValue] = useState('');
  const [inputIndex, setInputIndex] = useState('');
  const lastOp = useRef('insertTail');

  useEffect(() => {
    if (!visualizer.isPlaying && steps.length > 0 && visualizer.currentStep === steps.length - 1) {
      if (currentStepData?.data) {
        setBaseNodes(currentStepData.data.nodes);
        setBaseHeadId(currentStepData.data.headId);
      }
    }
  }, [visualizer.isPlaying, visualizer.currentStep, steps, currentStepData]);

  const handleInsertHead = () => {
    const val = parseInt(inputValue);
    if (isNaN(val)) return;
    lastOp.current = 'insertHead';
    visualizer.loadSteps(llInsertHead, { nodes: baseNodes, headId: baseHeadId, value: val });
  };

  const handleInsertTail = () => {
    const val = parseInt(inputValue);
    if (isNaN(val)) return;
    lastOp.current = 'insertTail';
    visualizer.loadSteps(llInsertTail, { nodes: baseNodes, headId: baseHeadId, value: val });
  };

  const handleInsertAtIndex = () => {
    const val = parseInt(inputValue);
    const idx = parseInt(inputIndex);
    if (isNaN(val) || isNaN(idx)) return;
    lastOp.current = 'insertAtIndex';
    visualizer.loadSteps(llInsertAtIndex, { nodes: baseNodes, headId: baseHeadId, index: idx, value: val });
  };

  const handleDelete = () => {
    const val = parseInt(inputValue);
    if (isNaN(val)) return;
    lastOp.current = 'deleteByValue';
    visualizer.loadSteps(llDeleteByValue, { nodes: baseNodes, headId: baseHeadId, value: val });
  };

  const handleSearch = () => {
    const val = parseInt(inputValue);
    if (isNaN(val)) return;
    lastOp.current = 'search';
    visualizer.loadSteps(llSearch, { nodes: baseNodes, headId: baseHeadId, value: val });
  };

  const handleReverse = () => {
    lastOp.current = 'reverse';
    visualizer.loadSteps(llReverse, { nodes: baseNodes, headId: baseHeadId });
  };

  const displayNodes = currentStepData?.data?.nodes ?? baseNodes;
  const displayHeadId = currentStepData?.data?.headId ?? baseHeadId;
  const active = currentStepData?.active ?? [];
  const comparing = currentStepData?.comparing ?? [];
  const pointers = currentStepData?.pointers ?? {};

  // Sort nodes starting from head to get correct visual order
  const orderedNodes = [];
  const unlinkedNodes = [];
  
  let currId = displayHeadId;
  const visited = new Set();
  
  while (currId && !visited.has(currId)) {
    visited.add(currId);
    const node = displayNodes.find(n => n.id === currId);
    if (node) {
      orderedNodes.push(node);
      currId = node.next;
    } else {
      break;
    }
  }

  // Any nodes not in the main chain (e.g. newly created before linking)
  displayNodes.forEach(node => {
    if (!visited.has(node.id)) {
      unlinkedNodes.push(node);
    }
  });

  const allDisplayNodes = [...orderedNodes, ...unlinkedNodes];

  const getNodeClass = (id) => {
    if (active.includes(id)) return 'active';
    if (comparing.includes(id)) return 'comparing';
    return 'default';
  };

  const logs = steps.slice(0, visualizer.currentStep + 1).map((s) => s.message).filter(Boolean);

  return (
    <VisualizerLayout
      title="Linked List"
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
      <div className="ll-workspace">
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
          <button onClick={handleInsertHead} disabled={visualizer.isPlaying} className="viz-btn primary-btn">
            Insert Head
          </button>
          <button onClick={handleInsertTail} disabled={visualizer.isPlaying} className="viz-btn primary-btn">
            Insert Tail
          </button>
          <button onClick={handleInsertAtIndex} disabled={visualizer.isPlaying} className="viz-btn primary-btn">
            Insert @ Index
          </button>
          <button onClick={handleDelete} disabled={visualizer.isPlaying} className="viz-btn primary-btn">
            Delete
          </button>
          <button onClick={handleSearch} disabled={visualizer.isPlaying} className="viz-btn primary-btn">
            Search
          </button>
          <button onClick={handleReverse} disabled={visualizer.isPlaying} className="viz-btn primary-btn">
            Reverse
          </button>
        </div>

        {currentStepData?.phase === 'error' && (
          <div className="ll-error-msg">{currentStepData.message}</div>
        )}

        <div className="ll-canvas">
          <div className="ll-container">
            <AnimatePresence>
              {allDisplayNodes.map((node, index) => {
                const nodePointers = Object.entries(pointers)
                  .filter(([, id]) => id === node.id)
                  .map(([key]) => key);

                return (
                  <motion.div
                    key={node.id}
                    layout
                    initial={{ opacity: 0, scale: 0.8, y: -20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.8, y: 20 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                    className="ll-node-wrapper"
                  >
                    {nodePointers.length > 0 && (
                      <div className="ll-pointer-labels">
                        {nodePointers.map(p => <span key={p} className="ll-pointer-tag">{p}</span>)}
                        <span className="pointer-arrow">↓</span>
                      </div>
                    )}
                    
                    <div className={`ll-node ${getNodeClass(node.id)}`}>
                      <div className="ll-node-value">{node.value}</div>
                      <div className="ll-node-next">
                        <div className="ll-dot"></div>
                      </div>
                    </div>

                    {node.next && (
                      <motion.svg 
                        className="ll-arrow" 
                        width="40" 
                        height="20"
                        initial={{ opacity: 0, scaleX: 0 }}
                        animate={{ opacity: 1, scaleX: 1 }}
                        exit={{ opacity: 0, scaleX: 0 }}
                        transition={{ duration: 0.3, type: 'spring' }}
                        style={{ originX: 0 }}
                      >
                        <defs>
                          <marker id={`arrowhead-${node.id}`} markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                            <polygon points="0 0, 10 3.5, 0 7" fill="var(--text-secondary)" />
                          </marker>
                        </defs>
                        <motion.line 
                          x1="0" y1="10" x2="35" y2="10" 
                          stroke="var(--text-secondary)" 
                          strokeWidth="2" 
                          markerEnd={`url(#arrowhead-${node.id})`}
                          initial={{ pathLength: 0 }}
                          animate={{ pathLength: 1 }}
                          transition={{ duration: 0.3, delay: 0.1 }}
                        />
                      </motion.svg>
                    )}

                    {!node.next && orderedNodes.includes(node) && (
                      <div className="ll-null">NULL</div>
                    )}
                  </motion.div>
                );
              })}
            </AnimatePresence>
            {allDisplayNodes.length === 0 && <div className="empty-ll-text">List is Empty</div>}
          </div>
        </div>

        {currentStepData?.message && currentStepData.phase !== 'error' && (
          <div className="ll-step-msg">{currentStepData.message}</div>
        )}
      </div>
    </VisualizerLayout>
  );
};

export default LinkedListVisualizer;
