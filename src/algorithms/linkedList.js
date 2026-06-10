const genId = () => crypto.randomUUID?.() || Math.random().toString(36).substr(2, 9);

function cloneNodes(nodes) {
  return nodes.map(n => ({ ...n }));
}

function getLength(nodes, headId) {
  let len = 0;
  let currId = headId;
  while (currId) {
    len++;
    const node = nodes.find(n => n.id === currId);
    currId = node ? node.next : null;
  }
  return len;
}

export function* llInsertHead({ nodes, headId, value }) {
  let list = cloneNodes(nodes);
  const newId = genId();
  const newNode = { id: newId, value, next: null };

  yield {
    data: { nodes: [...list, newNode], headId },
    active: [newId],
    comparing: [],
    message: `Create new node with value ${value}`,
    pseudocodeLine: 1,
    phase: 'create',
    pointers: { HEAD: headId, NEW: newId },
  };

  newNode.next = headId;
  list = [...list, newNode];

  yield {
    data: { nodes: cloneNodes(list), headId },
    active: [newId],
    comparing: [],
    message: `Set newNode.next → ${headId ? `HEAD (${nodes.find(n => n.id === headId)?.value})` : 'null'}`,
    pseudocodeLine: 2,
    phase: 'link',
    pointers: { HEAD: headId, NEW: newId },
  };

  const newHeadId = newId;

  yield {
    data: { nodes: cloneNodes(list), headId: newHeadId },
    active: [newId],
    comparing: [],
    message: `Update HEAD to new node (value ${value})`,
    pseudocodeLine: 3,
    phase: 'complete',
    pointers: { HEAD: newHeadId },
  };
}

export function* llInsertTail({ nodes, headId, value }) {
  let list = cloneNodes(nodes);
  const newId = genId();
  const newNode = { id: newId, value, next: null };

  yield {
    data: { nodes: [...list, newNode], headId },
    active: [newId],
    comparing: [],
    message: `Create new node with value ${value}`,
    pseudocodeLine: 1,
    phase: 'create',
    pointers: { HEAD: headId, NEW: newId },
  };

  if (!headId) {
    list = [...list, newNode];
    yield {
      data: { nodes: cloneNodes(list), headId: newId },
      active: [newId],
      comparing: [],
      message: 'List is empty — new node becomes HEAD',
      pseudocodeLine: 3,
      phase: 'complete',
      pointers: { HEAD: newId },
    };
    return;
  }

  let currId = headId;

  yield {
    data: { nodes: [...list, newNode], headId },
    active: [],
    comparing: [currId],
    message: `Start traversal at HEAD (value ${list.find(n => n.id === currId)?.value})`,
    pseudocodeLine: 4,
    phase: 'traverse',
    pointers: { HEAD: headId, CURR: currId, NEW: newId },
  };

  while (true) {
    const curr = list.find(n => n.id === currId);
    if (!curr.next) break;

    currId = curr.next;

    yield {
      data: { nodes: [...list, newNode], headId },
      active: [],
      comparing: [currId],
      message: `Move CURR to next node (value ${list.find(n => n.id === currId)?.value})`,
      pseudocodeLine: 5,
      phase: 'traverse',
      pointers: { HEAD: headId, CURR: currId, NEW: newId },
    };
  }

  const curr = list.find(n => n.id === currId);
  curr.next = newId;
  list = [...list, newNode];

  yield {
    data: { nodes: cloneNodes(list), headId },
    active: [newId],
    comparing: [],
    message: `Set CURR.next → new node (value ${value}). Insertion complete!`,
    pseudocodeLine: 6,
    phase: 'complete',
    pointers: { HEAD: headId, CURR: currId, NEW: newId },
  };
}

export function* llInsertAtIndex({ nodes, headId, index, value }) {
  const len = getLength(nodes, headId);

  if (index < 0 || index > len) {
    yield {
      data: { nodes: cloneNodes(nodes), headId },
      active: [],
      comparing: [],
      message: `Error: Index ${index} out of bounds (valid range: 0 to ${len})`,
      pseudocodeLine: 1,
      phase: 'error',
      pointers: { HEAD: headId },
    };
    return;
  }

  if (index === 0) {
    yield* llInsertHead({ nodes, headId, value });
    return;
  }

  let list = cloneNodes(nodes);
  const newId = genId();
  const newNode = { id: newId, value, next: null };

  yield {
    data: { nodes: [...list, newNode], headId },
    active: [newId],
    comparing: [],
    message: `Create new node with value ${value}, inserting at index ${index}`,
    pseudocodeLine: 3,
    phase: 'create',
    pointers: { HEAD: headId, NEW: newId },
  };

  let currId = headId;
  let count = 0;

  yield {
    data: { nodes: [...list, newNode], headId },
    active: [],
    comparing: [currId],
    message: `Start at HEAD (value ${list.find(n => n.id === currId)?.value}), count = 0`,
    pseudocodeLine: 4,
    phase: 'traverse',
    pointers: { HEAD: headId, CURR: currId, NEW: newId },
  };

  while (count < index - 1) {
    const curr = list.find(n => n.id === currId);
    currId = curr.next;
    count++;

    yield {
      data: { nodes: [...list, newNode], headId },
      active: [],
      comparing: [currId],
      message: `Move CURR to index ${count} (value ${list.find(n => n.id === currId)?.value})`,
      pseudocodeLine: 5,
      phase: 'traverse',
      pointers: { HEAD: headId, CURR: currId, NEW: newId },
    };
  }

  const curr = list.find(n => n.id === currId);
  newNode.next = curr.next;

  yield {
    data: { nodes: [...list, newNode], headId },
    active: [newId],
    comparing: [currId],
    message: `Set newNode.next → ${curr.next ? `node at index ${index}` : 'null'}`,
    pseudocodeLine: 7,
    phase: 'link',
    pointers: { HEAD: headId, CURR: currId, NEW: newId },
  };

  curr.next = newId;
  list = [...list, newNode];

  yield {
    data: { nodes: cloneNodes(list), headId },
    active: [newId],
    comparing: [],
    message: `Set CURR.next → new node. Inserted value ${value} at index ${index}!`,
    pseudocodeLine: 8,
    phase: 'complete',
    pointers: { HEAD: headId, CURR: currId, NEW: newId },
  };
}

export function* llDeleteByValue({ nodes, headId, value }) {
  let list = cloneNodes(nodes);

  if (!headId) {
    yield {
      data: { nodes: list, headId },
      active: [],
      comparing: [],
      message: 'Error: Cannot delete from an empty list',
      pseudocodeLine: 1,
      phase: 'error',
      pointers: {},
    };
    return;
  }

  const headNode = list.find(n => n.id === headId);

  yield {
    data: { nodes: cloneNodes(list), headId },
    active: [],
    comparing: [headId],
    message: `Check HEAD node (value ${headNode.value}) against target ${value}`,
    pseudocodeLine: 2,
    phase: 'comparing',
    pointers: { HEAD: headId, CURR: headId },
  };

  if (headNode.value === value) {
    const newHeadId = headNode.next;
    list = list.filter(n => n.id !== headId);

    yield {
      data: { nodes: cloneNodes(list), headId: newHeadId },
      active: [],
      comparing: [],
      message: `HEAD matches! Update HEAD → ${newHeadId ? `next node` : 'null'}. Deleted value ${value}`,
      pseudocodeLine: 3,
      phase: 'complete',
      pointers: { HEAD: newHeadId },
    };
    return;
  }

  let prevId = headId;
  let currId = headNode.next;

  yield {
    data: { nodes: cloneNodes(list), headId },
    active: [],
    comparing: [],
    message: `HEAD doesn't match. Set PREV = HEAD, CURR = HEAD.next`,
    pseudocodeLine: 4,
    phase: 'setup',
    pointers: { HEAD: headId, PREV: prevId, CURR: currId },
  };

  while (currId) {
    const currNode = list.find(n => n.id === currId);

    yield {
      data: { nodes: cloneNodes(list), headId },
      active: [],
      comparing: [currId],
      message: `Compare CURR (value ${currNode.value}) with target ${value}`,
      pseudocodeLine: 6,
      phase: 'comparing',
      pointers: { HEAD: headId, PREV: prevId, CURR: currId },
    };

    if (currNode.value === value) {
      const prevNode = list.find(n => n.id === prevId);
      prevNode.next = currNode.next;
      list = list.filter(n => n.id !== currId);

      yield {
        data: { nodes: cloneNodes(list), headId },
        active: [],
        comparing: [],
        message: `Found! Bypass: PREV.next → CURR.next. Deleted value ${value}`,
        pseudocodeLine: 7,
        phase: 'complete',
        pointers: { HEAD: headId, PREV: prevId },
      };
      return;
    }

    prevId = currId;
    currId = currNode.next;

    yield {
      data: { nodes: cloneNodes(list), headId },
      active: [],
      comparing: [],
      message: `No match. Advance PREV and CURR`,
      pseudocodeLine: 9,
      phase: 'traverse',
      pointers: { HEAD: headId, PREV: prevId, CURR: currId },
    };
  }

  yield {
    data: { nodes: cloneNodes(list), headId },
    active: [],
    comparing: [],
    message: `Value ${value} not found in the list`,
    pseudocodeLine: 10,
    phase: 'not-found',
    pointers: { HEAD: headId },
  };
}

export function* llSearch({ nodes, headId, value }) {
  const list = cloneNodes(nodes);

  if (!headId) {
    yield {
      data: { nodes: list, headId },
      active: [],
      comparing: [],
      message: 'List is empty — nothing to search',
      pseudocodeLine: 0,
      phase: 'error',
      pointers: {},
    };
    return;
  }

  let currId = headId;

  yield {
    data: { nodes: list, headId },
    active: [],
    comparing: [],
    message: `Start search for value ${value}. Set CURR = HEAD`,
    pseudocodeLine: 1,
    phase: 'init',
    pointers: { HEAD: headId, CURR: currId },
  };

  while (currId) {
    const currNode = list.find(n => n.id === currId);

    yield {
      data: { nodes: list, headId },
      active: [],
      comparing: [currId],
      message: `Compare CURR (value ${currNode.value}) with target ${value}`,
      pseudocodeLine: 3,
      phase: 'comparing',
      pointers: { HEAD: headId, CURR: currId },
    };

    if (currNode.value === value) {
      yield {
        data: { nodes: list, headId },
        active: [currId],
        comparing: [],
        message: `Found value ${value}!`,
        pseudocodeLine: 4,
        phase: 'found',
        pointers: { HEAD: headId, CURR: currId },
      };
      return;
    }

    currId = currNode.next;

    yield {
      data: { nodes: list, headId },
      active: [],
      comparing: [],
      message: `No match. Move CURR to next node`,
      pseudocodeLine: 5,
      phase: 'traverse',
      pointers: { HEAD: headId, CURR: currId },
    };
  }

  yield {
    data: { nodes: list, headId },
    active: [],
    comparing: [],
    message: `Value ${value} not found in the list`,
    pseudocodeLine: 6,
    phase: 'not-found',
    pointers: { HEAD: headId },
  };
}

export function* llReverse({ nodes, headId }) {
  let list = cloneNodes(nodes);

  if (!headId) {
    yield {
      data: { nodes: list, headId },
      active: [],
      comparing: [],
      message: 'List is empty — nothing to reverse',
      pseudocodeLine: 0,
      phase: 'error',
      pointers: {},
    };
    return;
  }

  let prevId = null;
  let currId = headId;

  yield {
    data: { nodes: cloneNodes(list), headId },
    active: [],
    comparing: [],
    message: 'Initialize: PREV = null, CURR = HEAD',
    pseudocodeLine: 1,
    phase: 'init',
    pointers: { HEAD: headId, PREV: prevId, CURR: currId },
  };

  while (currId) {
    const currNode = list.find(n => n.id === currId);
    const nextId = currNode.next;

    yield {
      data: { nodes: cloneNodes(list), headId },
      active: [currId],
      comparing: [],
      message: `Save NEXT = CURR.next${nextId ? ` (value ${list.find(n => n.id === nextId)?.value})` : ' (null)'}`,
      pseudocodeLine: 4,
      phase: 'save-next',
      pointers: { HEAD: headId, PREV: prevId, CURR: currId, NEXT: nextId },
    };

    currNode.next = prevId;

    yield {
      data: { nodes: cloneNodes(list), headId },
      active: [currId],
      comparing: [],
      message: `Reverse pointer: CURR.next → PREV${prevId ? ` (value ${list.find(n => n.id === prevId)?.value})` : ' (null)'}`,
      pseudocodeLine: 5,
      phase: 'reverse-pointer',
      pointers: { HEAD: headId, PREV: prevId, CURR: currId, NEXT: nextId },
    };

    prevId = currId;

    yield {
      data: { nodes: cloneNodes(list), headId },
      active: [],
      comparing: [],
      message: `Advance PREV to CURR (value ${currNode.value})`,
      pseudocodeLine: 6,
      phase: 'advance-prev',
      pointers: { HEAD: headId, PREV: prevId, CURR: currId, NEXT: nextId },
    };

    currId = nextId;

    yield {
      data: { nodes: cloneNodes(list), headId },
      active: [],
      comparing: [],
      message: `Advance CURR to NEXT${currId ? ` (value ${list.find(n => n.id === currId)?.value})` : ' (null)'}`,
      pseudocodeLine: 7,
      phase: 'advance-curr',
      pointers: { HEAD: headId, PREV: prevId, CURR: currId },
    };
  }

  yield {
    data: { nodes: cloneNodes(list), headId: prevId },
    active: [],
    comparing: [],
    message: `Reversal complete! HEAD is now node with value ${list.find(n => n.id === prevId)?.value}`,
    pseudocodeLine: 8,
    phase: 'complete',
    pointers: { HEAD: prevId },
  };
}
