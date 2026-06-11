import React, { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';

// Lazy loading visualizer pages
const ArrayVisualizer = lazy(() => import('./visualizers/Array/ArrayVisualizer'));
const StackVisualizer = lazy(() => import('./visualizers/Stack/StackVisualizer'));
const QueueVisualizer = lazy(() => import('./visualizers/Queue/QueueVisualizer'));
const SortingVisualizer = lazy(() => import('./visualizers/Sorting/SortingVisualizer'));
const SearchingVisualizer = lazy(() => import('./visualizers/Searching/SearchingVisualizer'));
const LinkedListVisualizer = lazy(() => import('./visualizers/LinkedList/LinkedListVisualizer'));
const BSTVisualizer = lazy(() => import('./visualizers/BST/BSTVisualizer'));
const GraphVisualizer = lazy(() => import('./visualizers/Graph/GraphVisualizer'));
const CityPathfinding = lazy(() => import('./components/CityPathfinding/CityPathfinding'));

function App() {
  return (
    <Suspense fallback={<div className="flex-center" style={{ height: '100vh', color: 'var(--text-secondary)' }}>Loading...</div>}>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="array" element={<ArrayVisualizer />} />
          <Route path="linked-list" element={<LinkedListVisualizer />} />
          <Route path="stack" element={<StackVisualizer />} />
          <Route path="queue" element={<QueueVisualizer />} />
          <Route path="bst" element={<BSTVisualizer />} />
          <Route path="graph" element={<GraphVisualizer />} />
          <Route path="sorting" element={<SortingVisualizer />} />
          <Route path="searching" element={<SearchingVisualizer />} />
          <Route path="city-pathfinding" element={<CityPathfinding />} />
        </Route>
      </Routes>
    </Suspense>
  );
}

export default App;
