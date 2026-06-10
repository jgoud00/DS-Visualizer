import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useVisualizer } from '../../hooks/useVisualizer';
import VisualizerLayout from '../../components/VisualizerLayout/VisualizerLayout';
import { bstInsert, bstSearch, bstDelete, bstInorder, bstPreorder, bstPostorder } from '../../algorithms/bst';
import * as d3 from 'd3-hierarchy';
import './BSTVisualizer.css';

const PSEUDOCODES = {
  insert: [
    'function insert(root, value):',
    '  if tree empty:',
    '    root = Node(value); return',
    '  curr = root',
    '  while true:',
    '    if value < curr.value:',
    '      if left null: left = Node(value); return',
    '      curr = curr.left',
    '    else:',
    '      if right null: right = Node(value); return',
    '      curr = curr.right',
  ],
  search: [
    'function search(root, value):',
    '  curr = root',
    '  while curr not null:',
    '    if value == curr.value: return curr',
    '    if value < curr.value:',
    '      curr = curr.left',
    '    else:',
    '      curr = curr.right',
    '  return null',
  ],
  delete: [
    'function delete(root, value):',
    '  find node to delete',
    '  Case 1: leaf — remove',
    '  Case 2: one child — bypass',
    '  Case 3: two children:',
    '    find inorder successor',
    '    copy successor value',
    '    delete successor',
  ],
  inorder: [
    'function inorder(root):',
    '  stack = [], curr = root',
    '  while curr or stack:',
    '    while curr: push, go left',
    '    curr = pop()',
    '    visit(curr)',
    '    curr = curr.right',
  ],
  preorder: [
    'function preorder(root):',
    '  stack = [root]',
    '  while stack:',
    '    curr = pop()',
    '    visit(curr)',
    '    push right, push left',
  ],
  postorder: [
    'function postorder(root):',
    '  stack1 = [root], stack2 = []',
    '  while stack1:',
    '    move to stack2',
    '    push children to stack1',
    '  pop stack2: visit',
  ],
};

const COMPLEXITY = {
  insert: { time: 'O(log n) avg', space: 'O(1)' },
  search: { time: 'O(log n) avg', space: 'O(1)' },
  delete: { time: 'O(log n) avg', space: 'O(1)' },
  inorder: { time: 'O(n)', space: 'O(h)' },
  preorder: { time: 'O(n)', space: 'O(h)' },
  postorder: { time: 'O(n)', space: 'O(h)' },
};

function buildHierarchy(nodeMap, rootId) {
  if (!rootId || !nodeMap[rootId]) return null;
  const node = nodeMap[rootId];
  const result = { id: node.id, value: node.value, children: [] };
  if (node.left) result.children.push(buildHierarchy(nodeMap, node.left));
  if (node.right) {
    if (!node.left) result.children.push({ id: `dummy-L-${node.id}`, isDummy: true });
    result.children.push(buildHierarchy(nodeMap, node.right));
  } else if (node.left) {
    result.children.push({ id: `dummy-R-${node.id}`, isDummy: true });
  }
  return result;
}

const BSTVisualizer = () => {
  const visualizer = useVisualizer();
  const { currentStepData, steps } = visualizer;

  const [nodeMap, setNodeMap] = useState({});
  const [rootId, setRootId] = useState(null);
  
  const [inputValue, setInputValue] = useState('');
  const lastOp = useRef('insert');

  useEffect(() => {
    if (!visualizer.isPlaying && steps.length > 0 && visualizer.currentStep === steps.length - 1) {
      if (currentStepData?.data) {
        setNodeMap(currentStepData.data.nodes);
        setRootId(currentStepData.data.rootId);
      }
    }
  }, [visualizer.isPlaying, visualizer.currentStep, steps, currentStepData]);

  const handleInsert = () => {
    const val = parseInt(inputValue);
    if (isNaN(val)) return;
    lastOp.current = 'insert';
    visualizer.loadSteps(bstInsert, { nodes: nodeMap, rootId, value: val });
  };

  const handleSearch = () => {
    const val = parseInt(inputValue);
    if (isNaN(val)) return;
    lastOp.current = 'search';
    visualizer.loadSteps(bstSearch, { nodes: nodeMap, rootId, value: val });
  };

  const handleDelete = () => {
    const val = parseInt(inputValue);
    if (isNaN(val)) return;
    lastOp.current = 'delete';
    visualizer.loadSteps(bstDelete, { nodes: nodeMap, rootId, value: val });
  };

  const handleInorder = () => {
    lastOp.current = 'inorder';
    visualizer.loadSteps(bstInorder, { nodes: nodeMap, rootId });
  };

  const handlePreorder = () => {
    lastOp.current = 'preorder';
    visualizer.loadSteps(bstPreorder, { nodes: nodeMap, rootId });
  };

  const handlePostorder = () => {
    lastOp.current = 'postorder';
    visualizer.loadSteps(bstPostorder, { nodes: nodeMap, rootId });
  };

  const displayMap = currentStepData?.data?.nodes ?? nodeMap;
  const displayRoot = currentStepData?.data?.rootId ?? rootId;
  const active = currentStepData?.active ?? [];
  const comparing = currentStepData?.comparing ?? [];
  const visited = currentStepData?.visited ?? [];
  const path = currentStepData?.path ?? [];

  const { treeNodes, treeEdges } = useMemo(() => {
    const hierarchyData = buildHierarchy(displayMap, displayRoot);
    if (!hierarchyData) return { treeNodes: [], treeEdges: [] };

    const width = 800;
    const height = 400;

    const root = d3.hierarchy(hierarchyData);
    const treeLayout = d3.tree().size([width - 100, height - 100]);
    treeLayout(root);

    const nodes = root.descendants().filter(n => !n.data.isDummy);
    const edges = root.links().filter(l => !l.source.data.isDummy && !l.target.data.isDummy);

    return { treeNodes: nodes, treeEdges: edges };
  }, [displayMap, displayRoot]);

  const getNodeClass = (id) => {
    if (active.includes(id)) return 'active';
    if (comparing.includes(id)) return 'comparing';
    if (visited.includes(id)) return 'success';
    if (path.includes(id)) return 'path';
    return 'default';
  };

  const logs = steps.slice(0, visualizer.currentStep + 1).map((s) => s.message).filter(Boolean);

  return (
    <VisualizerLayout
      title="Binary Search Tree"
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
      <div className="bst-workspace">
        <div className="input-controls panel">
          <input
            type="number"
            placeholder="Value"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="viz-input"
            disabled={visualizer.isPlaying}
          />
          <button onClick={handleInsert} disabled={visualizer.isPlaying} className="viz-btn primary-btn">
            Insert
          </button>
          <button onClick={handleSearch} disabled={visualizer.isPlaying} className="viz-btn primary-btn">
            Search
          </button>
          <button onClick={handleDelete} disabled={visualizer.isPlaying} className="viz-btn primary-btn">
            Delete
          </button>
          <div className="divider" />
          <button onClick={handleInorder} disabled={visualizer.isPlaying} className="viz-btn primary-btn">
            Inorder
          </button>
          <button onClick={handlePreorder} disabled={visualizer.isPlaying} className="viz-btn primary-btn">
            Preorder
          </button>
          <button onClick={handlePostorder} disabled={visualizer.isPlaying} className="viz-btn primary-btn">
            Postorder
          </button>
        </div>

        {currentStepData?.phase === 'error' && (
          <div className="bst-error-msg">{currentStepData.message}</div>
        )}

        <div className="bst-canvas">
          <svg className="bst-svg" viewBox="-50 -50 900 500" preserveAspectRatio="xMidYMid meet">
            <AnimatePresence>
              {treeEdges.map((edge) => (
                <motion.line
                  key={`${edge.source.data.id}-${edge.target.data.id}`}
                  x1={edge.source.x}
                  y1={edge.source.y}
                  x2={edge.target.x}
                  y2={edge.target.y}
                  stroke="var(--panel-border)"
                  strokeWidth="2"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5, ease: 'easeInOut' }}
                />
              ))}

              {treeNodes.map((node) => {
                const nodeClass = getNodeClass(node.data.id);
                const colorMap = {
                  active: 'var(--viz-active)',
                  comparing: 'var(--viz-comparing)',
                  success: 'var(--viz-success)',
                  path: 'var(--viz-comparing)', // Using comparing color for path visualization
                  default: 'var(--viz-default)'
                };

                return (
                  <motion.g
                    key={node.data.id}
                    layout
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1, x: node.x, y: node.y }}
                    exit={{ opacity: 0, scale: 0 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                  >
                    <motion.circle
                      r="20"
                      fill={colorMap[nodeClass]}
                      stroke="var(--panel-border)"
                      strokeWidth="2"
                      animate={{ fill: colorMap[nodeClass] }}
                      transition={{ duration: 0.3 }}
                    />
                    <text
                      textAnchor="middle"
                      dy=".3em"
                      fill={nodeClass === 'comparing' || nodeClass === 'path' ? '#1c1917' : '#fff'}
                      fontWeight="bold"
                      fontSize="14px"
                    >
                      {node.data.value}
                    </text>
                  </motion.g>
                );
              })}
            </AnimatePresence>
          </svg>
          {treeNodes.length === 0 && <div className="empty-bst-text">Tree is Empty</div>}
        </div>

        {currentStepData?.message && currentStepData.phase !== 'error' && (
          <div className="bst-step-msg">{currentStepData.message}</div>
        )}
      </div>
    </VisualizerLayout>
  );
};

export default BSTVisualizer;
