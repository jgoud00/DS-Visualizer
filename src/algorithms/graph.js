function makeStep(graph, overrides) {
  return {
    data: graph,
    active: [],
    comparing: [],
    visited: [],
    queue: [],
    stack: [],
    message: '',
    pseudocodeLine: 0,
    phase: '',
    components: {},
    ...overrides,
  };
}

export function* graphBFS({ graph, startId }) {
  const adj = graph.adjacencyList;

  if (!adj[startId]) {
    yield makeStep(graph, {
      message: `Error: Start node "${startId}" not found in graph`,
      phase: 'error',
    });
    return;
  }

  const visited = new Set();
  const queue = [startId];
  visited.add(startId);

  yield makeStep(graph, {
    active: [startId],
    visited: [...visited],
    queue: [...queue],
    message: `Enqueue start node "${startId}". Mark as visited`,
    pseudocodeLine: 1,
    phase: 'enqueue-start',
  });

  while (queue.length > 0) {
    const curr = queue.shift();

    yield makeStep(graph, {
      active: [curr],
      visited: [...visited],
      queue: [...queue],
      message: `Dequeue "${curr}" — processing`,
      pseudocodeLine: 4,
      phase: 'dequeue',
    });

    const neighbors = adj[curr] || [];

    for (const neighbor of neighbors) {
      yield makeStep(graph, {
        active: [curr],
        comparing: [neighbor],
        visited: [...visited],
        queue: [...queue],
        message: `Check neighbor "${neighbor}" of "${curr}"`,
        pseudocodeLine: 6,
        phase: 'check-neighbor',
      });

      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        queue.push(neighbor);

        yield makeStep(graph, {
          active: [curr],
          comparing: [neighbor],
          visited: [...visited],
          queue: [...queue],
          message: `"${neighbor}" not visited — mark visited & enqueue`,
          pseudocodeLine: 8,
          phase: 'enqueue',
        });
      } else {
        yield makeStep(graph, {
          active: [curr],
          comparing: [neighbor],
          visited: [...visited],
          queue: [...queue],
          message: `"${neighbor}" already visited — skip`,
          pseudocodeLine: 6,
          phase: 'skip',
        });
      }
    }
  }

  yield makeStep(graph, {
    visited: [...visited],
    queue: [],
    message: `BFS complete. Visited ${visited.size} nodes: [${[...visited].join(', ')}]`,
    pseudocodeLine: 8,
    phase: 'complete',
  });
}

export function* graphDFS({ graph, startId }) {
  const adj = graph.adjacencyList;

  if (!adj[startId] && !graph.nodes.find(n => n.id === startId)) {
    yield makeStep(graph, {
      message: `Error: Start node "${startId}" not found in graph`,
      phase: 'error',
    });
    return;
  }

  const visited = new Set();
  const stack = [startId];

  yield makeStep(graph, {
    active: [startId],
    visited: [],
    stack: [...stack],
    message: `Push start node "${startId}" onto stack`,
    pseudocodeLine: 1,
    phase: 'push-start',
  });

  while (stack.length > 0) {
    const curr = stack.pop();

    yield makeStep(graph, {
      active: [curr],
      visited: [...visited],
      stack: [...stack],
      message: `Pop "${curr}" from stack`,
      pseudocodeLine: 3,
      phase: 'pop',
    });

    if (visited.has(curr)) {
      yield makeStep(graph, {
        active: [curr],
        visited: [...visited],
        stack: [...stack],
        message: `"${curr}" already visited — skip`,
        pseudocodeLine: 4,
        phase: 'skip',
      });
      continue;
    }

    visited.add(curr);

    yield makeStep(graph, {
      active: [curr],
      visited: [...visited],
      stack: [...stack],
      message: `Visit "${curr}" — mark as visited`,
      pseudocodeLine: 5,
      phase: 'visit',
    });

    const neighbors = adj[curr] || [];

    for (const neighbor of neighbors) {
      yield makeStep(graph, {
        active: [curr],
        comparing: [neighbor],
        visited: [...visited],
        stack: [...stack],
        message: `Check neighbor "${neighbor}" of "${curr}"`,
        pseudocodeLine: 7,
        phase: 'check-neighbor',
      });

      if (!visited.has(neighbor)) {
        stack.push(neighbor);

        yield makeStep(graph, {
          active: [curr],
          comparing: [neighbor],
          visited: [...visited],
          stack: [...stack],
          message: `"${neighbor}" not visited — push onto stack`,
          pseudocodeLine: 8,
          phase: 'push',
        });
      } else {
        yield makeStep(graph, {
          active: [curr],
          comparing: [neighbor],
          visited: [...visited],
          stack: [...stack],
          message: `"${neighbor}" already visited — skip`,
          pseudocodeLine: 7,
          phase: 'skip',
        });
      }
    }
  }

  yield makeStep(graph, {
    visited: [...visited],
    stack: [],
    message: `DFS complete. Visited ${visited.size} nodes: [${[...visited].join(', ')}]`,
    pseudocodeLine: 8,
    phase: 'complete',
  });
}

export function* graphDetectCycle({ graph }) {
  const adj = graph.adjacencyList;
  const allNodes = graph.nodes.map(n => n.id);
  const visited = new Set();
  let cycleFound = false;

  yield makeStep(graph, {
    message: 'Start cycle detection (DFS with parent tracking)',
    pseudocodeLine: 0,
    phase: 'init',
  });

  for (const startNode of allNodes) {
    if (visited.has(startNode)) continue;

    yield makeStep(graph, {
      active: [startNode],
      visited: [...visited],
      message: `Starting DFS from unvisited node "${startNode}"`,
      pseudocodeLine: 2,
      phase: 'new-component',
    });

    // Iterative DFS with parent tracking
    const dfsStack = [{ node: startNode, parent: null }];

    while (dfsStack.length > 0) {
      const { node, parent } = dfsStack.pop();

      if (visited.has(node)) {
        // Check if this forms a cycle (visited and not parent)
        if (parent !== null && node !== parent) {
          yield makeStep(graph, {
            active: [node, parent],
            visited: [...visited],
            message: `"${node}" already visited and is not parent "${parent}" — cycle detected!`,
            pseudocodeLine: 13,
            phase: 'cycle-found',
          });
          cycleFound = true;
        }
        continue;
      }

      visited.add(node);

      yield makeStep(graph, {
        active: [node],
        comparing: parent ? [parent] : [],
        visited: [...visited],
        message: `Visit "${node}" (parent: ${parent || 'none'})`,
        pseudocodeLine: 8,
        phase: 'visit',
      });

      const neighbors = adj[node] || [];

      for (const neighbor of neighbors) {
        if (!visited.has(neighbor)) {
          dfsStack.push({ node: neighbor, parent: node });

          yield makeStep(graph, {
            active: [node],
            comparing: [neighbor],
            visited: [...visited],
            message: `"${neighbor}" not visited — push to explore (parent="${node}")`,
            pseudocodeLine: 10,
            phase: 'push-neighbor',
          });
        } else if (neighbor !== parent) {
          yield makeStep(graph, {
            active: [node, neighbor],
            visited: [...visited],
            message: `"${neighbor}" visited and not parent of "${node}" — cycle detected!`,
            pseudocodeLine: 13,
            phase: 'cycle-found',
          });
          cycleFound = true;
        } else {
          yield makeStep(graph, {
            active: [node],
            comparing: [neighbor],
            visited: [...visited],
            message: `"${neighbor}" is parent of "${node}" — skip (not a cycle)`,
            pseudocodeLine: 9,
            phase: 'skip-parent',
          });
        }
      }
    }

    if (cycleFound) break;
  }

  yield makeStep(graph, {
    visited: [...visited],
    message: cycleFound
      ? 'Cycle detection complete: cycle found in the graph'
      : 'Cycle detection complete: no cycle found',
    pseudocodeLine: cycleFound ? 5 : 6,
    phase: cycleFound ? 'cycle-confirmed' : 'no-cycle',
  });
}

export function* graphConnectedComponents({ graph }) {
  const adj = graph.adjacencyList;
  const allNodes = graph.nodes.map(n => n.id);
  const visited = new Set();
  const components = {};
  let componentNum = 0;

  yield makeStep(graph, {
    message: 'Start finding connected components',
    pseudocodeLine: 0,
    phase: 'init',
    components: {},
  });

  for (const startNode of allNodes) {
    if (visited.has(startNode)) continue;

    componentNum++;

    yield makeStep(graph, {
      active: [startNode],
      visited: [...visited],
      message: `Found unvisited node "${startNode}" — start component ${componentNum}`,
      pseudocodeLine: 3,
      phase: 'new-component',
      components: { ...components },
    });

    // BFS to find all nodes in this component
    const queue = [startNode];
    visited.add(startNode);
    components[startNode] = componentNum;

    yield makeStep(graph, {
      active: [startNode],
      visited: [...visited],
      queue: [...queue],
      message: `Assign "${startNode}" to component ${componentNum}`,
      pseudocodeLine: 5,
      phase: 'assign',
      components: { ...components },
    });

    while (queue.length > 0) {
      const curr = queue.shift();

      yield makeStep(graph, {
        active: [curr],
        visited: [...visited],
        queue: [...queue],
        message: `Process "${curr}" from component ${componentNum}`,
        pseudocodeLine: 5,
        phase: 'process',
        components: { ...components },
      });

      const neighbors = adj[curr] || [];

      for (const neighbor of neighbors) {
        if (!visited.has(neighbor)) {
          visited.add(neighbor);
          components[neighbor] = componentNum;
          queue.push(neighbor);

          yield makeStep(graph, {
            active: [curr],
            comparing: [neighbor],
            visited: [...visited],
            queue: [...queue],
            message: `Assign "${neighbor}" to component ${componentNum}`,
            pseudocodeLine: 5,
            phase: 'assign',
            components: { ...components },
          });
        }
      }
    }
  }

  yield makeStep(graph, {
    visited: [...visited],
    message: `Found ${componentNum} connected component${componentNum !== 1 ? 's' : ''}`,
    pseudocodeLine: 5,
    phase: 'complete',
    components: { ...components },
  });
}

export const EXAMPLE_GRAPHS = {
  undirected: {
    nodes: [
      { id: 'A', label: 'A' }, { id: 'B', label: 'B' }, { id: 'C', label: 'C' },
      { id: 'D', label: 'D' }, { id: 'E', label: 'E' }, { id: 'F', label: 'F' },
    ],
    edges: [
      { id: 'e1', source: 'A', target: 'B' }, { id: 'e2', source: 'A', target: 'C' },
      { id: 'e3', source: 'B', target: 'D' }, { id: 'e4', source: 'C', target: 'D' },
      { id: 'e5', source: 'C', target: 'E' }, { id: 'e6', source: 'D', target: 'F' },
      { id: 'e7', source: 'E', target: 'F' },
    ],
    adjacencyList: {
      A: ['B', 'C'], B: ['A', 'D'], C: ['A', 'D', 'E'],
      D: ['B', 'C', 'F'], E: ['C', 'F'], F: ['D', 'E'],
    },
  },
  directed: {
    nodes: [
      { id: '1', label: '1' }, { id: '2', label: '2' }, { id: '3', label: '3' },
      { id: '4', label: '4' }, { id: '5', label: '5' },
    ],
    edges: [
      { id: 'e1', source: '1', target: '2' }, { id: 'e2', source: '2', target: '3' },
      { id: 'e3', source: '3', target: '4' }, { id: 'e4', source: '4', target: '2' },
      { id: 'e5', source: '1', target: '5' }, { id: 'e6', source: '5', target: '3' },
    ],
    adjacencyList: {
      1: ['2', '5'], 2: ['3'], 3: ['4'], 4: ['2'], 5: ['3'],
    },
  },
  disconnected: {
    nodes: [
      { id: 'a', label: 'a' }, { id: 'b', label: 'b' }, { id: 'c', label: 'c' },
      { id: 'd', label: 'd' }, { id: 'e', label: 'e' }, { id: 'f', label: 'f' },
      { id: 'g', label: 'g' },
    ],
    edges: [
      { id: 'e1', source: 'a', target: 'b' }, { id: 'e2', source: 'b', target: 'c' },
      { id: 'e3', source: 'a', target: 'c' },
      { id: 'e4', source: 'd', target: 'e' }, { id: 'e5', source: 'e', target: 'f' },
    ],
    adjacencyList: {
      a: ['b', 'c'], b: ['a', 'c'], c: ['a', 'b'],
      d: ['e'], e: ['d', 'f'], f: ['e'],
      g: [],
    },
  },
};
