import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useVisualizer } from '../../hooks/useVisualizer';
import VisualizerLayout from '../../components/VisualizerLayout/VisualizerLayout';
import { graphBFS, graphDFS, graphDetectCycle, graphConnectedComponents, EXAMPLE_GRAPHS } from '../../algorithms/graph';
import * as d3Force from 'd3-force';
import './GraphVisualizer.css';

const PSEUDOCODES = {
  bfs: [
    'function BFS(graph, start):',
    '  queue = [start]',
    '  visited = {start}',
    '  while queue not empty:',
    '    curr = queue.dequeue()',
    '    process(curr)',
    '    for each neighbor:',
    '      if not visited:',
    '        visited.add(neighbor)',
    '        queue.enqueue(neighbor)',
  ],
  dfs: [
    'function DFS(graph, start):',
    '  stack = [start]',
    '  visited = {}',
    '  while stack not empty:',
    '    curr = stack.pop()',
    '    if not visited:',
    '      visited.add(curr)',
    '      process(curr)',
    '      for each neighbor:',
    '        if not visited:',
    '          stack.push(neighbor)',
  ],
  cycle: [
    'function detectCycle(graph):',
    '  for each unvisited node:',
    '    DFS with parent tracking',
    '    if visited neighbor != parent:',
    '      cycle found!',
    '  no cycle',
  ],
  components: [
    'function components(graph):',
    '  compNum = 0',
    '  for each unvisited node:',
    '    compNum++',
    '    BFS from node',
    '    assign all to compNum',
  ],
};

const COMPLEXITY = {
  bfs: { time: 'O(V + E)', space: 'O(V)' },
  dfs: { time: 'O(V + E)', space: 'O(V)' },
  cycle: { time: 'O(V + E)', space: 'O(V)' },
  components: { time: 'O(V + E)', space: 'O(V)' },
};

const GraphVisualizer = () => {
  const visualizer = useVisualizer();
  const { currentStepData, steps } = visualizer;

  const [graphType, setGraphType] = useState('undirected');
  const [startNode, setStartNode] = useState(EXAMPLE_GRAPHS['undirected'].nodes[0].id);
  
  const lastOp = useRef('bfs');

  useEffect(() => {
    setStartNode(EXAMPLE_GRAPHS[graphType].nodes[0].id);
    visualizer.reset();
  }, [graphType]);

  const handleBFS = () => {
    lastOp.current = 'bfs';
    visualizer.loadSteps(graphBFS, { graph: EXAMPLE_GRAPHS[graphType], startId: startNode });
  };

  const handleDFS = () => {
    lastOp.current = 'dfs';
    visualizer.loadSteps(graphDFS, { graph: EXAMPLE_GRAPHS[graphType], startId: startNode });
  };

  const handleDetectCycle = () => {
    lastOp.current = 'cycle';
    visualizer.loadSteps(graphDetectCycle, { graph: EXAMPLE_GRAPHS[graphType] });
  };

  const handleComponents = () => {
    lastOp.current = 'components';
    visualizer.loadSteps(graphConnectedComponents, { graph: EXAMPLE_GRAPHS[graphType] });
  };

  const graphData = currentStepData?.data ?? EXAMPLE_GRAPHS[graphType];
  const active = currentStepData?.active ?? [];
  const comparing = currentStepData?.comparing ?? [];
  const visited = currentStepData?.visited ?? [];
  const queue = currentStepData?.queue ?? [];
  const stack = currentStepData?.stack ?? [];
  const componentsMap = currentStepData?.components ?? {};

  // Compute fixed D3 Force layout synchronously based on current graphType
  const { layoutNodes, layoutEdges } = useMemo(() => {
    const width = 800;
    const height = 400;
    const g = EXAMPLE_GRAPHS[graphType];
    
    // We must clone nodes and edges because d3-force mutates them
    const nodes = g.nodes.map(n => ({ ...n }));
    const edges = g.edges.map(e => ({ ...e }));

    const simulation = d3Force.forceSimulation(nodes)
      .force("link", d3Force.forceLink(edges).id(d => d.id).distance(100))
      .force("charge", d3Force.forceManyBody().strength(-300))
      .force("center", d3Force.forceCenter(width / 2, height / 2))
      .stop();

    // Run layout synchronously
    for (let i = 0; i < 300; ++i) simulation.tick();

    return { layoutNodes: nodes, layoutEdges: edges };
  }, [graphType]);

  // Color palette for connected components
  const componentColors = [
    'var(--viz-default)', '#a855f7', '#ec4899', '#14b8a6', '#f59e0b', '#ef4444'
  ];

  const getNodeColor = (id) => {
    if (active.includes(id)) return 'var(--viz-active)';
    if (comparing.includes(id)) return 'var(--viz-comparing)';
    
    // In components mode, color by component if assigned
    if (Object.keys(componentsMap).length > 0 && componentsMap[id]) {
      const cIdx = componentsMap[id] % componentColors.length;
      return componentColors[cIdx];
    }
    
    if (visited.includes(id)) return 'var(--viz-success)';
    return 'var(--viz-default)';
  };

  const logs = steps.slice(0, visualizer.currentStep + 1).map((s) => s.message).filter(Boolean);

  return (
    <VisualizerLayout
      title="Graph Algorithms"
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
      <div className="graph-workspace">
        <div className="input-controls panel">
          <select 
            value={graphType} 
            onChange={(e) => setGraphType(e.target.value)}
            disabled={visualizer.isPlaying}
            className="viz-select"
          >
            <option value="undirected">Undirected Graph</option>
            <option value="directed">Directed Graph</option>
            <option value="disconnected">Disconnected Graph</option>
          </select>
          
          <div className="divider" />
          
          <button onClick={handleBFS} disabled={visualizer.isPlaying} className="viz-btn primary-btn">
            BFS
          </button>
          <button onClick={handleDFS} disabled={visualizer.isPlaying} className="viz-btn primary-btn">
            DFS
          </button>
          <button onClick={handleDetectCycle} disabled={visualizer.isPlaying} className="viz-btn primary-btn">
            Detect Cycle
          </button>
          <button onClick={handleComponents} disabled={visualizer.isPlaying} className="viz-btn primary-btn">
            Connected Components
          </button>
        </div>

        {currentStepData?.phase === 'error' && (
          <div className="graph-error-msg">{currentStepData.message}</div>
        )}

        <div className="graph-canvas">
          <svg className="graph-svg" viewBox="0 0 800 400" preserveAspectRatio="xMidYMid meet">
            <defs>
              <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="28" refY="3.5" orient="auto">
                <polygon points="0 0, 10 3.5, 0 7" fill="var(--panel-border)" />
              </marker>
            </defs>
            <AnimatePresence>
              {layoutEdges.map((edge, i) => (
                <motion.line
                  key={`e-${i}`}
                  x1={edge.source.x}
                  y1={edge.source.y}
                  x2={edge.target.x}
                  y2={edge.target.y}
                  stroke="var(--panel-border)"
                  strokeWidth="2"
                  markerEnd={graphType === 'directed' ? "url(#arrowhead)" : ""}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                />
              ))}

              {layoutNodes.map((node) => {
                const color = getNodeColor(node.id);
                const isComparing = comparing.includes(node.id);
                const isStart = node.id === startNode && !visualizer.isPlaying && visualizer.currentStep === -1;

                return (
                  <motion.g
                    key={node.id}
                    layout
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1, x: node.x, y: node.y }}
                    exit={{ opacity: 0, scale: 0 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                    onClick={() => {
                      if (!visualizer.isPlaying && visualizer.currentStep === -1) {
                        setStartNode(node.id);
                      }
                    }}
                    style={{ cursor: (!visualizer.isPlaying && visualizer.currentStep === -1) ? 'pointer' : 'default' }}
                  >
                    <motion.circle
                      r="20"
                      fill={color}
                      stroke={isStart ? 'white' : 'var(--panel-border)'}
                      strokeWidth={isStart ? '3' : '2'}
                      strokeDasharray={isStart ? '4' : '0'}
                      animate={{ fill: color }}
                      transition={{ duration: 0.3 }}
                    />
                    <text
                      textAnchor="middle"
                      dy=".3em"
                      fill={isComparing ? '#1c1917' : '#fff'}
                      fontWeight="bold"
                      fontSize="14px"
                      pointerEvents="none"
                    >
                      {node.label}
                    </text>
                  </motion.g>
                );
              })}
            </AnimatePresence>
          </svg>
          
          <div className="ds-state-panel">
            {queue.length > 0 && (
              <div className="ds-state">
                <strong>Queue:</strong> [{queue.join(', ')}]
              </div>
            )}
            {stack.length > 0 && (
              <div className="ds-state">
                <strong>Stack:</strong> [{stack.join(', ')}]
              </div>
            )}
          </div>
        </div>

        {currentStepData?.message && currentStepData.phase !== 'error' && (
          <div className="graph-step-msg">{currentStepData.message}</div>
        )}
      </div>
    </VisualizerLayout>
  );
};

export default GraphVisualizer;
