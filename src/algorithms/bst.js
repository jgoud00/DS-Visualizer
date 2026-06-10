const genId = () => crypto.randomUUID?.() || Math.random().toString(36).substr(2, 9);

function cloneMap(nodes) {
  return JSON.parse(JSON.stringify(nodes));
}

function makeStep(nodeMap, rootId, overrides) {
  return {
    data: { nodes: cloneMap(nodeMap), rootId },
    active: [],
    comparing: [],
    visited: [],
    path: [],
    message: '',
    pseudocodeLine: 0,
    phase: '',
    ...overrides,
  };
}

export function* bstInsert({ nodes, rootId, value }) {
  const nodeMap = cloneMap(nodes);

  if (!rootId || Object.keys(nodeMap).length === 0) {
    const newId = genId();
    nodeMap[newId] = { id: newId, value, left: null, right: null };

    yield makeStep(nodeMap, newId, {
      active: [newId],
      path: [newId],
      message: `Tree is empty. Created root node with value ${value}`,
      pseudocodeLine: 2,
      phase: 'complete',
    });
    return;
  }

  let currId = rootId;
  const path = [];

  yield makeStep(nodeMap, rootId, {
    active: [currId],
    path: [currId],
    message: `Start at root (value ${nodeMap[currId].value}). Inserting ${value}`,
    pseudocodeLine: 3,
    phase: 'init',
  });

  while (true) {
    const curr = nodeMap[currId];
    path.push(currId);

    yield makeStep(nodeMap, rootId, {
      comparing: [currId],
      path: [...path],
      message: `Compare ${value} with node ${curr.value}`,
      pseudocodeLine: 5,
      phase: 'comparing',
    });

    if (value < curr.value) {
      yield makeStep(nodeMap, rootId, {
        active: [currId],
        path: [...path],
        message: `${value} < ${curr.value} — go left`,
        pseudocodeLine: 5,
        phase: 'go-left',
      });

      if (!curr.left) {
        const newId = genId();
        nodeMap[newId] = { id: newId, value, left: null, right: null };
        curr.left = newId;

        yield makeStep(nodeMap, rootId, {
          active: [newId],
          path: [...path, newId],
          message: `Left is empty. Inserted ${value} as left child of ${curr.value}`,
          pseudocodeLine: 7,
          phase: 'complete',
        });
        return;
      }
      currId = curr.left;
    } else {
      yield makeStep(nodeMap, rootId, {
        active: [currId],
        path: [...path],
        message: `${value} >= ${curr.value} — go right`,
        pseudocodeLine: 9,
        phase: 'go-right',
      });

      if (!curr.right) {
        const newId = genId();
        nodeMap[newId] = { id: newId, value, left: null, right: null };
        curr.right = newId;

        yield makeStep(nodeMap, rootId, {
          active: [newId],
          path: [...path, newId],
          message: `Right is empty. Inserted ${value} as right child of ${curr.value}`,
          pseudocodeLine: 11,
          phase: 'complete',
        });
        return;
      }
      currId = curr.right;
    }
  }
}

export function* bstSearch({ nodes, rootId, value }) {
  const nodeMap = cloneMap(nodes);

  if (!rootId) {
    yield makeStep(nodeMap, rootId, {
      message: 'Tree is empty — nothing to search',
      pseudocodeLine: 0,
      phase: 'error',
    });
    return;
  }

  let currId = rootId;
  const path = [];

  yield makeStep(nodeMap, rootId, {
    active: [currId],
    message: `Start search for ${value} at root (value ${nodeMap[currId].value})`,
    pseudocodeLine: 1,
    phase: 'init',
  });

  while (currId) {
    const curr = nodeMap[currId];
    path.push(currId);

    yield makeStep(nodeMap, rootId, {
      comparing: [currId],
      path: [...path],
      message: `Compare ${value} with node ${curr.value}`,
      pseudocodeLine: 3,
      phase: 'comparing',
    });

    if (value === curr.value) {
      yield makeStep(nodeMap, rootId, {
        active: [currId],
        path: [...path],
        message: `Found ${value}!`,
        pseudocodeLine: 3,
        phase: 'found',
      });
      return;
    }

    if (value < curr.value) {
      yield makeStep(nodeMap, rootId, {
        active: [currId],
        path: [...path],
        message: `${value} < ${curr.value} — go left`,
        pseudocodeLine: 4,
        phase: 'go-left',
      });
      currId = curr.left;
    } else {
      yield makeStep(nodeMap, rootId, {
        active: [currId],
        path: [...path],
        message: `${value} > ${curr.value} — go right`,
        pseudocodeLine: 6,
        phase: 'go-right',
      });
      currId = curr.right;
    }
  }

  yield makeStep(nodeMap, rootId, {
    path: [...path],
    message: `Value ${value} not found in the tree`,
    pseudocodeLine: 7,
    phase: 'not-found',
  });
}

export function* bstDelete({ nodes, rootId, value }) {
  const nodeMap = cloneMap(nodes);

  if (!rootId) {
    yield makeStep(nodeMap, rootId, {
      message: 'Tree is empty — nothing to delete',
      pseudocodeLine: 0,
      phase: 'error',
    });
    return;
  }

  // Find node and parent
  let currId = rootId;
  let parentId = null;
  let direction = null;
  const path = [];

  while (currId) {
    const curr = nodeMap[currId];
    path.push(currId);

    yield makeStep(nodeMap, rootId, {
      comparing: [currId],
      path: [...path],
      message: `Searching: compare ${value} with node ${curr.value}`,
      pseudocodeLine: 1,
      phase: 'searching',
    });

    if (value === curr.value) break;

    parentId = currId;
    if (value < curr.value) {
      direction = 'left';
      currId = curr.left;
      yield makeStep(nodeMap, rootId, {
        active: [parentId],
        path: [...path],
        message: `${value} < ${curr.value} — go left`,
        pseudocodeLine: 1,
        phase: 'go-left',
      });
    } else {
      direction = 'right';
      currId = curr.right;
      yield makeStep(nodeMap, rootId, {
        active: [parentId],
        path: [...path],
        message: `${value} > ${curr.value} — go right`,
        pseudocodeLine: 1,
        phase: 'go-right',
      });
    }
  }

  if (!currId) {
    yield makeStep(nodeMap, rootId, {
      path: [...path],
      message: `Value ${value} not found in the tree`,
      pseudocodeLine: 1,
      phase: 'not-found',
    });
    return;
  }

  const curr = nodeMap[currId];

  // Case 1: Leaf
  if (!curr.left && !curr.right) {
    yield makeStep(nodeMap, rootId, {
      active: [currId],
      path: [...path],
      message: `Case 1: Node ${curr.value} is a leaf — remove it`,
      pseudocodeLine: 2,
      phase: 'delete-leaf',
    });

    if (!parentId) {
      delete nodeMap[currId];
      yield makeStep(nodeMap, null, {
        message: `Deleted root node. Tree is now empty`,
        pseudocodeLine: 2,
        phase: 'complete',
      });
    } else {
      nodeMap[parentId][direction] = null;
      delete nodeMap[currId];
      yield makeStep(nodeMap, rootId, {
        message: `Removed leaf node ${value}`,
        pseudocodeLine: 2,
        phase: 'complete',
      });
    }
    return;
  }

  // Case 2: One child
  if (!curr.left || !curr.right) {
    const childId = curr.left || curr.right;

    yield makeStep(nodeMap, rootId, {
      active: [currId, childId],
      path: [...path],
      message: `Case 2: Node ${curr.value} has one child (${nodeMap[childId].value}) — bypass`,
      pseudocodeLine: 3,
      phase: 'delete-one-child',
    });

    if (!parentId) {
      delete nodeMap[currId];
      yield makeStep(nodeMap, childId, {
        active: [childId],
        message: `Bypassed root. New root is ${nodeMap[childId].value}`,
        pseudocodeLine: 3,
        phase: 'complete',
      });
    } else {
      nodeMap[parentId][direction] = childId;
      delete nodeMap[currId];
      yield makeStep(nodeMap, rootId, {
        active: [childId],
        message: `Bypassed node ${value}. Parent now points to child ${nodeMap[childId].value}`,
        pseudocodeLine: 3,
        phase: 'complete',
      });
    }
    return;
  }

  // Case 3: Two children
  yield makeStep(nodeMap, rootId, {
    active: [currId],
    path: [...path],
    message: `Case 3: Node ${curr.value} has two children — find inorder successor`,
    pseudocodeLine: 4,
    phase: 'delete-two-children',
  });

  let succParentId = currId;
  let succId = curr.right;

  yield makeStep(nodeMap, rootId, {
    active: [succId],
    comparing: [currId],
    path: [...path, succId],
    message: `Go right to ${nodeMap[succId].value}, then find leftmost`,
    pseudocodeLine: 5,
    phase: 'find-successor',
  });

  while (nodeMap[succId].left) {
    succParentId = succId;
    succId = nodeMap[succId].left;

    yield makeStep(nodeMap, rootId, {
      active: [succId],
      comparing: [currId],
      path: [...path, succId],
      message: `Move left to ${nodeMap[succId].value}`,
      pseudocodeLine: 5,
      phase: 'find-successor',
    });
  }

  const succValue = nodeMap[succId].value;

  yield makeStep(nodeMap, rootId, {
    active: [succId, currId],
    path: [...path],
    message: `Inorder successor found: ${succValue}. Copy value to node ${curr.value}`,
    pseudocodeLine: 6,
    phase: 'copy-successor',
  });

  nodeMap[currId].value = succValue;

  yield makeStep(nodeMap, rootId, {
    active: [currId],
    path: [...path],
    message: `Copied ${succValue} to target node. Now delete successor`,
    pseudocodeLine: 6,
    phase: 'copy-done',
  });

  // Delete successor (has at most one right child)
  const succChild = nodeMap[succId].right;
  if (succParentId === currId) {
    nodeMap[succParentId].right = succChild;
  } else {
    nodeMap[succParentId].left = succChild;
  }
  delete nodeMap[succId];

  yield makeStep(nodeMap, rootId, {
    message: `Deleted successor node. Deletion of ${value} complete`,
    pseudocodeLine: 7,
    phase: 'complete',
  });
}

export function* bstInorder({ nodes, rootId }) {
  const nodeMap = cloneMap(nodes);

  if (!rootId) {
    yield makeStep(nodeMap, rootId, {
      message: 'Tree is empty',
      pseudocodeLine: 0,
      phase: 'error',
    });
    return;
  }

  const stack = [];
  let currId = rootId;
  const visited = [];

  yield makeStep(nodeMap, rootId, {
    message: 'Start inorder traversal (Left → Node → Right)',
    pseudocodeLine: 1,
    phase: 'init',
  });

  while (currId || stack.length > 0) {
    while (currId) {
      stack.push(currId);

      yield makeStep(nodeMap, rootId, {
        active: [currId],
        visited: [...visited],
        message: `Push ${nodeMap[currId].value} onto stack. Go left`,
        pseudocodeLine: 4,
        phase: 'push',
      });

      currId = nodeMap[currId].left;
    }

    currId = stack.pop();

    yield makeStep(nodeMap, rootId, {
      active: [currId],
      visited: [...visited],
      message: `Pop ${nodeMap[currId].value} from stack`,
      pseudocodeLine: 5,
      phase: 'pop',
    });

    visited.push(currId);

    yield makeStep(nodeMap, rootId, {
      active: [currId],
      visited: [...visited],
      message: `Visit ${nodeMap[currId].value} [${visited.map(id => nodeMap[id].value).join(', ')}]`,
      pseudocodeLine: 6,
      phase: 'visit',
    });

    currId = nodeMap[currId].right;
  }

  yield makeStep(nodeMap, rootId, {
    visited: [...visited],
    message: `Inorder traversal complete: [${visited.map(id => nodeMap[id].value).join(', ')}]`,
    pseudocodeLine: 7,
    phase: 'complete',
  });
}

export function* bstPreorder({ nodes, rootId }) {
  const nodeMap = cloneMap(nodes);

  if (!rootId) {
    yield makeStep(nodeMap, rootId, {
      message: 'Tree is empty',
      pseudocodeLine: 0,
      phase: 'error',
    });
    return;
  }

  const stack = [rootId];
  const visited = [];

  yield makeStep(nodeMap, rootId, {
    active: [rootId],
    message: 'Start preorder traversal (Node → Left → Right). Push root',
    pseudocodeLine: 2,
    phase: 'init',
  });

  while (stack.length > 0) {
    const currId = stack.pop();

    yield makeStep(nodeMap, rootId, {
      active: [currId],
      visited: [...visited],
      message: `Pop ${nodeMap[currId].value} from stack`,
      pseudocodeLine: 3,
      phase: 'pop',
    });

    visited.push(currId);

    yield makeStep(nodeMap, rootId, {
      active: [currId],
      visited: [...visited],
      message: `Visit ${nodeMap[currId].value} [${visited.map(id => nodeMap[id].value).join(', ')}]`,
      pseudocodeLine: 4,
      phase: 'visit',
    });

    const curr = nodeMap[currId];

    if (curr.right) {
      stack.push(curr.right);
      yield makeStep(nodeMap, rootId, {
        active: [curr.right],
        visited: [...visited],
        message: `Push right child ${nodeMap[curr.right].value}`,
        pseudocodeLine: 5,
        phase: 'push-right',
      });
    }

    if (curr.left) {
      stack.push(curr.left);
      yield makeStep(nodeMap, rootId, {
        active: [curr.left],
        visited: [...visited],
        message: `Push left child ${nodeMap[curr.left].value}`,
        pseudocodeLine: 6,
        phase: 'push-left',
      });
    }
  }

  yield makeStep(nodeMap, rootId, {
    visited: [...visited],
    message: `Preorder traversal complete: [${visited.map(id => nodeMap[id].value).join(', ')}]`,
    pseudocodeLine: 6,
    phase: 'complete',
  });
}

export function* bstPostorder({ nodes, rootId }) {
  const nodeMap = cloneMap(nodes);

  if (!rootId) {
    yield makeStep(nodeMap, rootId, {
      message: 'Tree is empty',
      pseudocodeLine: 0,
      phase: 'error',
    });
    return;
  }

  const stack1 = [rootId];
  const stack2 = [];
  const visited = [];

  yield makeStep(nodeMap, rootId, {
    active: [rootId],
    message: 'Start postorder traversal (Left → Right → Node). Push root to stack1',
    pseudocodeLine: 2,
    phase: 'init',
  });

  while (stack1.length > 0) {
    const currId = stack1.pop();
    stack2.push(currId);
    const curr = nodeMap[currId];

    yield makeStep(nodeMap, rootId, {
      active: [currId],
      visited: [...visited],
      message: `Move ${curr.value} from stack1 to stack2`,
      pseudocodeLine: 4,
      phase: 'move-to-stack2',
    });

    if (curr.left) {
      stack1.push(curr.left);
      yield makeStep(nodeMap, rootId, {
        active: [curr.left],
        visited: [...visited],
        message: `Push left child ${nodeMap[curr.left].value} to stack1`,
        pseudocodeLine: 6,
        phase: 'push-left',
      });
    }

    if (curr.right) {
      stack1.push(curr.right);
      yield makeStep(nodeMap, rootId, {
        active: [curr.right],
        visited: [...visited],
        message: `Push right child ${nodeMap[curr.right].value} to stack1`,
        pseudocodeLine: 7,
        phase: 'push-right',
      });
    }
  }

  while (stack2.length > 0) {
    const currId = stack2.pop();
    visited.push(currId);

    yield makeStep(nodeMap, rootId, {
      active: [currId],
      visited: [...visited],
      message: `Visit ${nodeMap[currId].value} [${visited.map(id => nodeMap[id].value).join(', ')}]`,
      pseudocodeLine: 8,
      phase: 'visit',
    });
  }

  yield makeStep(nodeMap, rootId, {
    visited: [...visited],
    message: `Postorder traversal complete: [${visited.map(id => nodeMap[id].value).join(', ')}]`,
    pseudocodeLine: 9,
    phase: 'complete',
  });
}
