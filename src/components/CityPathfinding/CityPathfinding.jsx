import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { Play, RotateCcw, ArrowRightLeft } from 'lucide-react';
import { getInitialCityMap, LANDMARKS, TILE, ROWS, COLS } from './CityMap';
import { createNodeGrid, dijkstra, astar, TILE_COST } from '../../algorithms/cityPathfinding';
import './CityPathfinding.css';

const BUILDING_COLORS = ['#6b7280', '#374151', '#4b5563', '#1f2937'];

const SPEED_PRESETS = {
  slow: { visitDelay: 25, pathDelay: 60 },
  normal: { visitDelay: 8, pathDelay: 25 },
  fast: { visitDelay: 2, pathDelay: 10 },
  instant: { visitDelay: 0, pathDelay: 0 }
};

export default function CityPathfinding() {
  const [algo, setAlgo] = useState('dijkstra');
  const [speed, setSpeed] = useState('normal');
  const [fromId, setFromId] = useState('hospital');
  const [toId, setToId] = useState('station');
  const [isAnimating, setIsAnimating] = useState(false);
  const [hasRun, setHasRun] = useState(false);

  const [stats, setStats] = useState({
    distance: 0,
    cost: 0,
    explored: 0,
    timeMs: 0,
    status: 'Idle',
    breakdown: { ROAD: 0, PARK: 0, TRAFFIC: 0 }
  });

  const cityMap = useMemo(() => getInitialCityMap(), []);
  const animationTimeoutsRef = useRef([]);
  const pathNodesRef = useRef([]);

  const clearTimeouts = () => {
    animationTimeoutsRef.current.forEach(clearTimeout);
    animationTimeoutsRef.current = [];
  };

  useEffect(() => {
    return () => clearTimeouts();
  }, []);

  const getLandmark = (id) => LANDMARKS.find(l => l.id === id);

  const clearRouteDOM = useCallback(() => {
    clearTimeouts();
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const el = document.getElementById(`tile-${r}-${c}`);
        if (el) {
          el.classList.remove('tile-visited', 'tile-path');
        }
      }
    }
    pathNodesRef.current = [];
    setHasRun(false);
    setStats({
      distance: 0, cost: 0, explored: 0, timeMs: 0, status: 'Idle', breakdown: { ROAD: 0, PARK: 0, TRAFFIC: 0 }
    });
  }, []);

  const visualizeAlgorithm = useCallback(() => {
    if (fromId === toId) return;
    clearRouteDOM();
    setIsAnimating(true);

    const grid = createNodeGrid(cityMap);
    const fromLm = getLandmark(fromId);
    const toLm = getLandmark(toId);
    
    const startNode = grid[fromLm.row][fromLm.col];
    const endNode = grid[toLm.row][toLm.col];

    const t0 = performance.now();
    let result;
    if (algo === 'dijkstra') {
      result = dijkstra(grid, startNode, endNode);
    } else {
      result = astar(grid, startNode, endNode);
    }
    const t1 = performance.now();
    const computeTime = Math.round(t1 - t0);

    const { visitedInOrder, shortestPath, totalCost } = result;
    pathNodesRef.current = shortestPath;

    if (shortestPath.length === 0) {
      setStats(s => ({ ...s, status: 'No Route Found!', timeMs: computeTime }));
      setIsAnimating(false);
      setHasRun(true);
      return;
    }

    const sPreset = SPEED_PRESETS[speed];

    if (speed === 'instant') {
      visitedInOrder.forEach(node => {
        document.getElementById(`tile-${node.row}-${node.col}`).classList.add('tile-visited');
      });
      shortestPath.forEach(node => {
        document.getElementById(`tile-${node.row}-${node.col}`).classList.add('tile-path');
      });
      finalizeStats(shortestPath, visitedInOrder.length, totalCost, computeTime);
      setIsAnimating(false);
      setHasRun(true);
      return;
    }

    // Phase 1: Exploration
    for (let i = 0; i < visitedInOrder.length; i++) {
      const node = visitedInOrder[i];
      const tid = setTimeout(() => {
        const el = document.getElementById(`tile-${node.row}-${node.col}`);
        if (el) el.classList.add('tile-visited');
        setStats(s => ({ ...s, explored: i + 1, status: 'Searching...' }));
      }, sPreset.visitDelay * i);
      animationTimeoutsRef.current.push(tid);
    }

    // Phase 2: Path Highlight
    const startPathTime = sPreset.visitDelay * visitedInOrder.length;
    for (let i = 0; i < shortestPath.length; i++) {
      const node = shortestPath[i];
      const tid = setTimeout(() => {
        const el = document.getElementById(`tile-${node.row}-${node.col}`);
        if (el) el.classList.add('tile-path');
      }, startPathTime + sPreset.pathDelay * i);
      animationTimeoutsRef.current.push(tid);
    }

    // Phase 3: Finish
    const finishTime = startPathTime + sPreset.pathDelay * shortestPath.length;
    const tid = setTimeout(() => {
      finalizeStats(shortestPath, visitedInOrder.length, totalCost, computeTime);
      setIsAnimating(false);
      setHasRun(true);
    }, finishTime);
    animationTimeoutsRef.current.push(tid);

  }, [algo, speed, fromId, toId, cityMap, clearRouteDOM]);

  const finalizeStats = (path, explored, cost, time) => {
    let roads = 0, parks = 0, traffic = 0;
    path.forEach(n => {
      if (n.tileType === TILE.ROAD || n.tileType === TILE.INTERSECTION || n.tileType === TILE.LANDMARK) roads++;
      if (n.tileType === TILE.PARK) parks++;
      if (n.tileType === TILE.TRAFFIC) traffic++;
    });

    setStats({
      distance: path.length,
      cost,
      explored,
      timeMs: time,
      status: '✅ Route Found',
      breakdown: { ROAD: roads, PARK: parks, TRAFFIC: traffic }
    });
  };

  const handleSwap = () => {
    const temp = fromId;
    setFromId(toId);
    setToId(temp);
    if (hasRun) {
      // Re-run instantly or wait? Usually better to just wait for user to click play again
      clearRouteDOM();
    }
  };

  // SVG Path generation
  const cellSize = window.innerWidth < 768 ? 16 : 20;
  const generatePolyline = () => {
    if (!hasRun || pathNodesRef.current.length === 0) return '';
    return pathNodesRef.current.map(node => {
      const x = node.col * cellSize + (cellSize / 2);
      const y = node.row * cellSize + (cellSize / 2);
      return `${x},${y}`;
    }).join(' ');
  };

  const renderGrid = () => {
    return cityMap.map((row, rIdx) => (
      row.map((tileType, cIdx) => {
        const isHoriz = [2, 8, 14, 20, 26].includes(rIdx);
        const isVert = [4, 10, 18, 24, 28, 34, 40, 44].includes(cIdx);
        
        let bgColor = '';
        if (tileType === TILE.BUILDING) {
          bgColor = BUILDING_COLORS[(rIdx * COLS + cIdx) % BUILDING_COLORS.length];
        }

        const lm = LANDMARKS.find(l => l.row === rIdx && l.col === cIdx);

        let carOverlay = null;
        if (tileType === TILE.ROAD || tileType === TILE.BRIDGE) {
          if (isHoriz && cIdx % 8 === 0) {
            carOverlay = <div className={`car-overlay car-horiz ${(rIdx * COLS + cIdx) % 2 === 0 ? 'reverse' : ''}`} />;
          } else if (isVert && rIdx % 8 === 0) {
            carOverlay = <div className={`car-overlay car-vert ${(rIdx * COLS + cIdx) % 2 === 0 ? 'reverse' : ''}`} />;
          }
        }

        return (
          <div
            key={`${rIdx}-${cIdx}`}
            id={`tile-${rIdx}-${cIdx}`}
            className={`city-tile tile-${tileType}`}
            data-horiz={isHoriz}
            data-vert={isVert}
            data-pattern={(rIdx * COLS + cIdx) % 3 === 0}
            style={bgColor ? { backgroundColor: bgColor } : {}}
          >
            {tileType === TILE.TRAFFIC && <div className="tile-traffic-overlay" />}
            {carOverlay}
            {lm && (
              <>
                {(fromId === lm.id || toId === lm.id) && <div className="landmark-pulse" />}
                <span className="landmark-icon">{lm.icon}</span>
              </>
            )}
          </div>
        );
      })
    ));
  };

  return (
    <div className="city-pathfinding-container">
      <div className="city-toolbar">
        <div className="toolbar-section">
          <span>From:</span>
          <select className="city-select" value={fromId} onChange={(e) => setFromId(e.target.value)} disabled={isAnimating}>
            {LANDMARKS.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
          </select>
          <button className="swap-btn" onClick={handleSwap} disabled={isAnimating} title="Swap Locations">
            <ArrowRightLeft size={18} />
          </button>
          <span>To:</span>
          <select className="city-select" value={toId} onChange={(e) => setToId(e.target.value)} disabled={isAnimating}>
            {LANDMARKS.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
          </select>
        </div>

        <div className="toolbar-section">
          <button className="btn-primary" onClick={visualizeAlgorithm} disabled={isAnimating || fromId === toId}>
            <Play size={16} /> {isAnimating ? 'Finding...' : 'Find Route'}
          </button>
          
          <div className="algo-toggle">
            <button className={`algo-btn ${algo === 'dijkstra' ? 'active' : ''}`} onClick={() => setAlgo('dijkstra')} disabled={isAnimating} title="Explores more area, guarantees cheapest route">Dijkstra</button>
            <button className={`algo-btn ${algo === 'astar' ? 'active' : ''}`} onClick={() => setAlgo('astar')} disabled={isAnimating} title="Smarter search, faster on open maps, still optimal">A*</button>
          </div>
        </div>

        <div className="toolbar-section">
          <span>Speed:</span>
          <select className="city-select" value={speed} onChange={(e) => setSpeed(e.target.value)} disabled={isAnimating}>
            <option value="slow">Slow</option>
            <option value="normal">Normal</option>
            <option value="fast">Fast</option>
            <option value="instant">Instant</option>
          </select>
          <button className="btn-secondary" onClick={clearRouteDOM} disabled={isAnimating}>
            <RotateCcw size={16} style={{ verticalAlign: 'middle', marginRight: '5px' }} /> Clear
          </button>
        </div>
      </div>

      {fromId === toId && <div style={{ color: '#ef4444', fontWeight: 'bold' }}>Please choose two different landmarks!</div>}

      <div className="main-content-layout">
        <div className="map-container-wrapper">
          <div className="city-grid">
            {renderGrid()}
          </div>
          {hasRun && speed !== 'instant' && (
            <svg className="path-svg-overlay">
              <polyline className="path-line" points={generatePolyline()} />
            </svg>
          )}
        </div>

        <div className="stats-panel">
          <h3>🗺️ Route Summary</h3>
          <div className="stats-grid">
            <div className="stat-row"><span>From:</span> <span>{getLandmark(fromId)?.icon} {getLandmark(fromId)?.name}</span></div>
            <div className="stat-row"><span>To:</span> <span>{getLandmark(toId)?.icon} {getLandmark(toId)?.name}</span></div>
            <br/>
            <div className="stat-row"><span>Distance:</span> <span>{stats.distance} tiles</span></div>
            <div className="stat-row"><span>Route Cost:</span> <span>{stats.cost}</span></div>
            {stats.distance > 0 && (
              <>
                <div className="stat-row sub"><span>Roads/Intersections:</span> <span>{stats.breakdown.ROAD} × 1 = {stats.breakdown.ROAD}</span></div>
                <div className="stat-row sub"><span>Parks:</span> <span>{stats.breakdown.PARK} × 2 = {stats.breakdown.PARK * 2}</span></div>
                <div className="stat-row sub"><span>Traffic:</span> <span>{stats.breakdown.TRAFFIC} × 4 = {stats.breakdown.TRAFFIC * 4}</span></div>
              </>
            )}
            <br/>
            <div className="stat-row"><span>Tiles Explored:</span> <span>{stats.explored}</span></div>
            <div className="stat-row"><span>Algorithm:</span> <span>{algo === 'dijkstra' ? 'Dijkstra' : 'A*'}</span></div>
            <div className="stat-row"><span>Compute Time:</span> <span>{stats.timeMs} ms</span></div>
            <div className="stat-row total"><span>Status:</span> <span>{stats.status}</span></div>
          </div>
        </div>
      </div>

      <div className="map-legend">
        <div className="legend-item"><div className="legend-swatch" style={{background: '#4a4a5a'}}></div> Road (cost 1)</div>
        <div className="legend-item"><div className="legend-swatch" style={{background: '#3d3d4a'}}></div> Intersection (cost 1)</div>
        <div className="legend-item"><div className="legend-swatch" style={{background: '#6b7280', borderLeft: '2px solid #374151', borderRight: '2px solid #374151'}}></div> Bridge (cost 2)</div>
        <div className="legend-item"><div className="legend-swatch" style={{background: '#374151'}}></div> Building (wall)</div>
        <div className="legend-item"><div className="legend-swatch" style={{background: '#166534'}}></div> Park (cost 2)</div>
        <div className="legend-item"><div className="legend-swatch" style={{background: '#92400e'}}></div> Traffic Zone (cost 4)</div>
        <div className="legend-item"><div className="legend-swatch" style={{background: '#0284c7'}}></div> Water (impassable)</div>
        <div className="legend-item"><div className="legend-swatch" style={{border: '2px solid #3b82f6'}}></div> Visited</div>
        <div className="legend-item"><div className="legend-swatch" style={{background: '#fbbf24'}}></div> Shortest Path</div>
      </div>
    </div>
  );
}
