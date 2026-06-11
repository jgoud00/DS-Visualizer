import { TILE } from '../components/CityPathfinding/CityMap';

export const TILE_COST = {
  [TILE.ROAD]: 1,
  [TILE.INTERSECTION]: 1,
  [TILE.LANDMARK]: 1,
  [TILE.PARK]: 2,
  [TILE.TRAFFIC]: 4,
  [TILE.BUILDING]: Infinity,
  [TILE.WATER]: Infinity,
  [TILE.BRIDGE]: 2,
};

function getNeighbors(node, grid) {
  const neighbors = [];
  const { row, col } = node;
  const numRows = grid.length;
  const numCols = grid[0].length;

  if (row > 0) neighbors.push(grid[row - 1][col]);
  if (row < numRows - 1) neighbors.push(grid[row + 1][col]);
  if (col > 0) neighbors.push(grid[row][col - 1]);
  if (col < numCols - 1) neighbors.push(grid[row][col + 1]);

  return neighbors.filter((neighbor) => TILE_COST[neighbor.tileType] !== Infinity);
}

// Transform the simple string grid into a node grid
export function createNodeGrid(cityMap) {
  const grid = [];
  for (let r = 0; r < cityMap.length; r++) {
    const currentRow = [];
    for (let c = 0; c < cityMap[0].length; c++) {
      currentRow.push({
        row: r,
        col: c,
        tileType: cityMap[r][c],
        distance: Infinity,
        heuristicDistance: 0,
        isVisited: false,
        previousNode: null,
      });
    }
    grid.push(currentRow);
  }
  return grid;
}

class MinHeap {
  constructor(compareFunc) {
    this.heap = [];
    this.compare = compareFunc;
  }

  insert(node) {
    this.heap.push(node);
    this.bubbleUp(this.heap.length - 1);
  }

  extractMin() {
    if (this.heap.length === 0) return null;
    if (this.heap.length === 1) return this.heap.pop();
    const min = this.heap[0];
    this.heap[0] = this.heap.pop();
    this.sinkDown(0);
    return min;
  }

  isEmpty() {
    return this.heap.length === 0;
  }

  bubbleUp(index) {
    let curr = index;
    while (curr > 0) {
      let parent = Math.floor((curr - 1) / 2);
      if (this.compare(this.heap[curr], this.heap[parent]) < 0) {
        [this.heap[curr], this.heap[parent]] = [this.heap[parent], this.heap[curr]];
        curr = parent;
      } else {
        break;
      }
    }
  }

  sinkDown(index) {
    let curr = index;
    const length = this.heap.length;
    while (true) {
      let left = 2 * curr + 1;
      let right = 2 * curr + 2;
      let smallest = curr;

      if (left < length && this.compare(this.heap[left], this.heap[smallest]) < 0) {
        smallest = left;
      }
      if (right < length && this.compare(this.heap[right], this.heap[smallest]) < 0) {
        smallest = right;
      }
      if (smallest !== curr) {
        [this.heap[curr], this.heap[smallest]] = [this.heap[smallest], this.heap[curr]];
        curr = smallest;
      } else {
        break;
      }
    }
  }
}

export function dijkstra(grid, startNode, endNode) {
  const visitedInOrder = [];
  startNode.distance = 0;
  
  const pq = new MinHeap((a, b) => a.distance - b.distance);
  pq.insert(startNode);

  while (!pq.isEmpty()) {
    const closestNode = pq.extractMin();

    if (closestNode.isVisited) continue;
    if (closestNode.distance === Infinity) return { visitedInOrder, shortestPath: [], totalCost: 0 };

    closestNode.isVisited = true;
    visitedInOrder.push(closestNode);

    if (closestNode === endNode) {
      const shortestPath = getShortestPath(endNode);
      const totalCost = endNode.distance;
      return { visitedInOrder, shortestPath, totalCost };
    }

    updateUnvisitedNeighbors(closestNode, grid, pq);
  }

  return { visitedInOrder, shortestPath: [], totalCost: 0 };
}

export function astar(grid, startNode, endNode) {
  const visitedInOrder = [];
  startNode.distance = 0;
  startNode.heuristicDistance = getManhattanDistance(startNode, endNode);
  
  const pq = new MinHeap((a, b) => {
    const fA = a.distance + a.heuristicDistance;
    const fB = b.distance + b.heuristicDistance;
    if (fA === fB) return a.heuristicDistance - b.heuristicDistance; // Tie breaker
    return fA - fB;
  });
  
  pq.insert(startNode);

  while (!pq.isEmpty()) {
    const closestNode = pq.extractMin();

    if (closestNode.isVisited) continue;
    if (closestNode.distance === Infinity) return { visitedInOrder, shortestPath: [], totalCost: 0 };

    closestNode.isVisited = true;
    visitedInOrder.push(closestNode);

    if (closestNode === endNode) {
      const shortestPath = getShortestPath(endNode);
      const totalCost = endNode.distance;
      return { visitedInOrder, shortestPath, totalCost };
    }

    updateUnvisitedNeighborsAstar(closestNode, grid, endNode, pq);
  }

  return { visitedInOrder, shortestPath: [], totalCost: 0 };
}

function updateUnvisitedNeighbors(node, grid, pq) {
  const unvisitedNeighbors = getNeighbors(node, grid).filter(n => !n.isVisited);
  for (const neighbor of unvisitedNeighbors) {
    const cost = TILE_COST[neighbor.tileType];
    if (node.distance + cost < neighbor.distance) {
      neighbor.distance = node.distance + cost;
      neighbor.previousNode = node;
      pq.insert(neighbor);
    }
  }
}

function updateUnvisitedNeighborsAstar(node, grid, endNode, pq) {
  const unvisitedNeighbors = getNeighbors(node, grid).filter(n => !n.isVisited);
  for (const neighbor of unvisitedNeighbors) {
    const cost = TILE_COST[neighbor.tileType];
    if (node.distance + cost < neighbor.distance) {
      neighbor.distance = node.distance + cost;
      neighbor.heuristicDistance = getManhattanDistance(neighbor, endNode);
      neighbor.previousNode = node;
      pq.insert(neighbor);
    }
  }
}

function getManhattanDistance(nodeA, nodeB) {
  return Math.abs(nodeA.row - nodeB.row) + Math.abs(nodeA.col - nodeB.col);
}


function getShortestPath(endNode) {
  const shortestPath = [];
  let currentNode = endNode;
  while (currentNode !== null) {
    shortestPath.unshift(currentNode);
    currentNode = currentNode.previousNode;
  }
  return shortestPath;
}
