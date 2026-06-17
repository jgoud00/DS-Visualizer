from fastapi import FastAPI
from pydantic import BaseModel
from typing import Dict, List
import heapq
import math

app = FastAPI()

class Edge(BaseModel):
    node: str
    weight: int = 1

class NodeData(BaseModel):
    x: float
    y: float

class GraphRequest(BaseModel):
    graph: Dict[str, List[Edge]]
    positions: Dict[str, NodeData]
    start: str
    end: str

def heuristic(a: str, b: str, positions: Dict[str, NodeData]) -> float:
    if a not in positions or b not in positions:
        return 0.0
    p1 = positions[a]
    p2 = positions[b]
    return math.hypot(p1.x - p2.x, p1.y - p2.y) / 20.0

@app.post("/api/astar")
def astar(req: GraphRequest):
    graph = req.graph
    positions = req.positions
    start = req.start
    end = req.end

    if start not in graph:
        return {"found":False,"path":[],"steps":[],"nodes_explored":0,
                "complexity_time":"O((V+E) log V)","complexity_space":"O(V)",
                "message":f"Start node '{start}' not in graph"}

    open_set = []
    heapq.heappush(open_set, (heuristic(start, end, positions), 0, start))
    came_from: Dict[str, str] = {}
    g_score: Dict[str, float] = {start: 0}
    
    closed_set = set()
    open_set_hash = {start}
    steps = []

    while open_set:
        f, g, current = heapq.heappop(open_set)
        if current in closed_set:
            continue
        open_set_hash.discard(current)

        steps.append({
            "current": current,
            "open": list(open_set_hash),
            "closed": list(closed_set),
            "g": g,
            "f": f,
            "came_from": came_from.copy()
        })

        if current == end:
            path = []
            node = current
            while node in came_from:
                path.append(node)
                node = came_from[node]
            path.append(start)
            path.reverse()
            
            steps.append({
                "current": current,
                "open": list(open_set_hash),
                "closed": list(closed_set) + [current],
                "g": g,
                "f": f,
                "came_from": came_from.copy()
            })
            
            return {"found":True,"path":path,"steps":steps,
                    "path_length":round(g, 2),"nodes_explored":len(closed_set)+1,
                    "complexity_time":"O((V+E) log V)","complexity_space":"O(V)",
                    "message":f"Path found: {' → '.join(path)} (Cost: {round(g, 2)}) | Explored {len(closed_set)+1} nodes"}

        closed_set.add(current)

        for edge in graph.get(current, []):
            neighbor = edge.node
            weight = edge.weight
            if neighbor in closed_set:
                continue
                
            tg = g_score[current] + weight
            if neighbor not in g_score or tg < g_score[neighbor]:
                came_from[neighbor] = current
                g_score[neighbor] = tg
                f_score = tg + heuristic(neighbor, end, positions)
                open_set_hash.add(neighbor)
                heapq.heappush(open_set, (f_score, tg, neighbor))

    return {"found":False,"path":[],"steps":steps,
            "path_length":0,"nodes_explored":len(closed_set),
            "complexity_time":"O((V+E) log V)","complexity_space":"O(V)",
            "message":f"No path from '{start}' to '{end}'. Explored {len(closed_set)} nodes."}

@app.post("/api/idastar")
def idastar(req: GraphRequest):
    graph = req.graph
    positions = req.positions
    start = req.start
    end = req.end

    if start not in graph:
        return {"found":False,"path":[],"steps":[],"nodes_explored":0,
                "complexity_time":"O(b^d)","complexity_space":"O(d)",
                "message":f"Start node '{start}' not in graph"}

    steps = []
    nodes_explored = [0]

    def search(path, g, bound):
        node = path[-1]
        f = g + heuristic(node, end, positions)
        
        steps.append({
            "current": node,
            "path": list(path),
            "bound": bound,
            "g": g,
            "f": f
        })

        if f > bound:
            return f, None
        if node == end:
            return -1, list(path)
            
        minimum = float('inf')
        nodes_explored[0] += 1
            
        for edge in graph.get(node, []):
            neighbor = edge.node
            weight = edge.weight
            if neighbor not in path:
                path.append(neighbor)
                t, result = search(path, g + weight, bound)
                if t == -1:
                    return -1, result
                if t < minimum:
                    minimum = t
                path.pop()
        return minimum, None

    bound = heuristic(start, end, positions)
    path = [start]

    for _ in range(500):
        t, result = search(path, 0, bound)
        if t == -1:
            cost = 0
            for i in range(len(result)-1):
                curr = result[i]
                nxt = result[i+1]
                for e in graph[curr]:
                    if e.node == nxt:
                        cost += e.weight
                        break
                        
            return {"found":True,"path":result,"steps":steps,
                    "path_length":round(cost, 2),"nodes_explored":nodes_explored[0],
                    "complexity_time":"O(b^d) per iteration","complexity_space":"O(d)  ← linear space advantage",
                    "message":f"Path found: {' → '.join(result)} (Cost: {round(cost, 2)}) | Explored {nodes_explored[0]} nodes"}
        if t == float('inf'):
            break
        bound = t

    return {"found":False,"path":[],"steps":steps,
            "path_length":0,"nodes_explored":nodes_explored[0],
            "complexity_time":"O(b^d) per iteration","complexity_space":"O(d)",
            "message":f"No path from '{start}' to '{end}'."}

@app.post("/api/bfs")
def bfs(req: GraphRequest):
    graph = req.graph
    start = req.start
    end = req.end

    if start not in graph:
        return {"found":False,"path":[],"steps":[],"nodes_explored":0,
                "complexity_time":"O(V+E)","complexity_space":"O(V)",
                "message":f"Start node '{start}' not in graph"}

    queue = [start]
    visited = set([start])
    came_from = {}
    steps = []

    while queue:
        current = queue.pop(0)

        steps.append({
            "current": current,
            "open": list(queue),
            "closed": list(visited),
            "g": 0, "f": 0,
            "came_from": came_from.copy()
        })

        if current == end:
            path = []
            node = current
            while node in came_from:
                path.append(node)
                node = came_from[node]
            path.append(start)
            path.reverse()
            
            steps.append({
                "current": current,
                "open": list(queue),
                "closed": list(visited),
                "g": 0, "f": 0,
                "came_from": came_from.copy()
            })
            
            return {"found":True,"path":path,"steps":steps,
                    "path_length":len(path)-1,"nodes_explored":len(visited),
                    "complexity_time":"O(V+E)","complexity_space":"O(V)",
                    "message":f"Path found: {' → '.join(path)} (Edges: {len(path)-1}) | Explored {len(visited)} nodes"}

        for edge in graph.get(current, []):
            neighbor = edge.node
            if neighbor not in visited:
                visited.add(neighbor)
                came_from[neighbor] = current
                queue.append(neighbor)

    return {"found":False,"path":[],"steps":steps,
            "path_length":0,"nodes_explored":len(visited),
            "complexity_time":"O(V+E)","complexity_space":"O(V)",
            "message":f"No path from '{start}' to '{end}'. Explored {len(visited)} nodes."}

@app.post("/api/dfs")
def dfs(req: GraphRequest):
    graph = req.graph
    start = req.start
    end = req.end

    if start not in graph:
        return {"found":False,"path":[],"steps":[],"nodes_explored":0,
                "complexity_time":"O(V+E)","complexity_space":"O(V)",
                "message":f"Start node '{start}' not in graph"}

    stack = [start]
    visited = set()
    came_from = {}
    steps = []

    while stack:
        current = stack.pop()
        
        if current not in visited:
            visited.add(current)
            
            steps.append({
                "current": current,
                "open": list(stack),
                "closed": list(visited),
                "g": 0, "f": 0,
                "came_from": came_from.copy()
            })

            if current == end:
                path = []
                node = current
                while node in came_from:
                    path.append(node)
                    node = came_from[node]
                path.append(start)
                path.reverse()
                
                steps.append({
                    "current": current,
                    "open": list(stack),
                    "closed": list(visited),
                    "g": 0, "f": 0,
                    "came_from": came_from.copy()
                })
                
                return {"found":True,"path":path,"steps":steps,
                        "path_length":len(path)-1,"nodes_explored":len(visited),
                        "complexity_time":"O(V+E)","complexity_space":"O(V)",
                        "message":f"Path found: {' → '.join(path)} (Edges: {len(path)-1}) | Explored {len(visited)} nodes"}

            # Reverse the neighbors so the first declared neighbor is popped first from stack
            neighbors = graph.get(current, [])
            for edge in reversed(neighbors):
                neighbor = edge.node
                if neighbor not in visited:
                    came_from[neighbor] = current
                    stack.append(neighbor)

    return {"found":False,"path":[],"steps":steps,
            "path_length":0,"nodes_explored":len(visited),
            "complexity_time":"O(V+E)","complexity_space":"O(V)",
            "message":f"No path from '{start}' to '{end}'. Explored {len(visited)} nodes."}

# ===========================================================
#  TASK 2 — TREE ENDPOINTS
# ===========================================================
from typing import Optional

class TreeRequest(BaseModel):
    values: List[int]
    operation: str          # insert | delete | search | pop
    target: Optional[int] = None
    width: float = 700.0
    height: float = 500.0

# ---- shared layout helper ----
def _tree_layout(root_id, children_map, width: float, height: float):
    """Return {id -> (x, y)} positions using a simple recursive x-counter."""
    positions = {}
    counter = [0]

    def _assign(node_id, depth):
        if node_id is None:
            return
        left, right = children_map.get(node_id, (None, None))
        _assign(left, depth + 1)
        positions[node_id] = (counter[0], depth)
        counter[0] += 1
        _assign(right, depth + 1)

    _assign(root_id, 0)

    n = counter[0]
    max_depth = max((d for _, d in positions.values()), default=0) + 1
    col_w = width / max(n, 1)
    row_h = height / max(max_depth + 1, 2)
    return {nid: (col * col_w + col_w / 2, depth * row_h + 40)
            for nid, (col, depth) in positions.items()}


def _make_step(values_map, parent_map, children_map, root_id, width, height,
               highlights=None, rotation=None, message=""):
    pos = _tree_layout(root_id, children_map, width, height)
    nodes = [{"id": nid, "val": val, "x": round(pos[nid][0], 1), "y": round(pos[nid][1], 1),
              "color": "rgba(148,163,184,0.5)"}
             for nid, val in values_map.items() if nid in pos]
    edges = []
    for nid, (left, right) in children_map.items():
        if left is not None:
            edges.append({"from": nid, "to": left})
        if right is not None:
            edges.append({"from": nid, "to": right})
    return {"nodes": nodes, "edges": edges,
            "highlights": highlights or [], "rotation": rotation, "message": message}


# ---- BST ----
class _BSTNode:
    _counter = 0
    def __init__(self, val):
        _BSTNode._counter += 1
        self.id  = _BSTNode._counter
        self.val = val
        self.left = None
        self.right = None

def _bst_build(values):
    _BSTNode._counter = 0
    root = None
    nodes_map, parent_map, children_map = {}, {}, {}

    def _insert(r, val):
        if r is None:
            n = _BSTNode(val)
            nodes_map[n.id] = n.val
            children_map[n.id] = (None, None)
            return n
        if val < r.val:
            r.left = _insert(r.left, val)
            if r.left:
                parent_map[r.left.id] = r.id
        elif val > r.val:
            r.right = _insert(r.right, val)
            if r.right:
                parent_map[r.right.id] = r.id
        children_map[r.id] = (r.left.id if r.left else None,
                               r.right.id if r.right else None)
        return r

    for v in values:
        root = _insert(root, v)
    return root, nodes_map, parent_map, children_map

def _bst_snapshot(root, nodes_map, children_map, w, h, hl=None, msg=""):
    if root is None:
        return {"nodes": [], "edges": [], "highlights": [], "rotation": None, "message": msg}
    return _make_step(nodes_map, {}, children_map, root.id, w, h, hl, None, msg)

@app.post("/api/bst")
def bst_endpoint(req: TreeRequest):
    _BSTNode._counter = 0
    w, h = req.width, req.height
    root, nodes_map, parent_map, children_map = _bst_build(req.values)
    steps = []

    if req.operation == "insert" and req.target is not None:
        val = req.target
        # Animate traversal
        cur = root
        while cur:
            steps.append(_bst_snapshot(root, nodes_map, children_map, w, h,
                                        hl=[cur.id], msg=f"Compare {val} with {cur.val}"))
            if val < cur.val:
                cur = cur.left
            elif val > cur.val:
                cur = cur.right
            else:
                return {"found": True, "steps": steps, "nodes": [], "edges": [],
                        "message": f"{val} already exists in the BST."}
        # Actually insert
        _BSTNode._counter = 0
        root, nodes_map, parent_map, children_map = _bst_build(req.values + [val])
        # Find newly inserted node
        new_node = next((nid for nid, v in nodes_map.items() if v == val), None)
        steps.append(_bst_snapshot(root, nodes_map, children_map, w, h,
                                    hl=[new_node] if new_node else [],
                                    msg=f"Inserted {val}"))
        return {"found": True, "steps": steps, "nodes": [], "edges": [],
                "message": f"Inserted {val} into the BST."}

    elif req.operation == "search" and req.target is not None:
        val = req.target
        cur = root
        while cur:
            steps.append(_bst_snapshot(root, nodes_map, children_map, w, h,
                                        hl=[cur.id], msg=f"Searching: compare {val} with {cur.val}"))
            if val == cur.val:
                return {"found": True, "steps": steps, "nodes": [], "edges": [],
                        "message": f"Found {val} in the BST!"}
            elif val < cur.val:
                cur = cur.left
            else:
                cur = cur.right
        steps.append(_bst_snapshot(root, nodes_map, children_map, w, h,
                                    msg=f"{val} not found in the BST."))
        return {"found": False, "steps": steps, "nodes": [], "edges": [],
                "message": f"{val} not found in the BST."}

    elif req.operation == "delete" and req.target is not None:
        val = req.target
        new_vals = [v for v in req.values if v != val]
        # Show deletion highlight then rebuild
        cur = root
        while cur:
            steps.append(_bst_snapshot(root, nodes_map, children_map, w, h,
                                        hl=[cur.id], msg=f"Searching for {val} to delete"))
            if val == cur.val:
                steps.append(_bst_snapshot(root, nodes_map, children_map, w, h,
                                            hl=[cur.id], msg=f"Deleting node {val}"))
                break
            elif val < cur.val:
                cur = cur.left
            else:
                cur = cur.right
        _BSTNode._counter = 0
        root2, nm2, pm2, cm2 = _bst_build(new_vals)
        steps.append(_bst_snapshot(root2, nm2, cm2, w, h, msg=f"Deleted {val}"))
        return {"found": True, "steps": steps, "nodes": [], "edges": [],
                "message": f"Deleted {val} from the BST."}

    # Fallback: just return current tree
    snap = _bst_snapshot(root, nodes_map, children_map, w, h)
    return {"found": True, "steps": [snap], "nodes": snap["nodes"], "edges": snap["edges"],
            "message": "BST ready."}


# ---- AVL ----
class _AVLNode:
    _counter = 0
    def __init__(self, val):
        _AVLNode._counter += 1
        self.id = _AVLNode._counter
        self.val = val
        self.left = None
        self.right = None
        self.height = 1

def _avl_height(n): return n.height if n else 0
def _avl_bf(n): return (_avl_height(n.left) - _avl_height(n.right)) if n else 0
def _avl_update_h(n):
    if n: n.height = 1 + max(_avl_height(n.left), _avl_height(n.right))

def _avl_collect(root):
    vm, cm = {}, {}
    def _walk(n):
        if not n: return
        vm[n.id] = n.val
        cm[n.id] = (n.left.id if n.left else None, n.right.id if n.right else None)
        _walk(n.left); _walk(n.right)
    _walk(root)
    return vm, cm

def _avl_snap(root, w, h, hl=None, rotation=None, msg=""):
    if root is None:
        return {"nodes": [], "edges": [], "highlights": [], "rotation": rotation, "message": msg}
    vm, cm = _avl_collect(root)
    return _make_step(vm, {}, cm, root.id, w, h, hl, rotation, msg)

def _avl_rot_right(y, steps, w, h):
    x = y.left; T2 = x.right
    steps.append(_avl_snap(y, w, h, hl=[y.id, x.id], rotation="LL (Right Rotation)",
                             msg=f"LL Rotation: pivot={y.val}, new root={x.val}"))
    x.right = y; y.left = T2
    _avl_update_h(y); _avl_update_h(x)
    return x

def _avl_rot_left(x, steps, w, h):
    y = x.right; T2 = y.left
    steps.append(_avl_snap(x, w, h, hl=[x.id, y.id], rotation="RR (Left Rotation)",
                             msg=f"RR Rotation: pivot={x.val}, new root={y.val}"))
    y.left = x; x.right = T2
    _avl_update_h(x); _avl_update_h(y)
    return y

def _avl_insert(node, val, steps, w, h):
    if node is None:
        n = _AVLNode(val)
        return n
    steps.append(_avl_snap(node, w, h, hl=[node.id], msg=f"Compare {val} with {node.val}"))
    if val < node.val:
        node.left = _avl_insert(node.left, val, steps, w, h)
    elif val > node.val:
        node.right = _avl_insert(node.right, val, steps, w, h)
    else:
        return node
    _avl_update_h(node)
    bf = _avl_bf(node)
    if bf > 1 and val < node.left.val:
        return _avl_rot_right(node, steps, w, h)
    if bf < -1 and val > node.right.val:
        return _avl_rot_left(node, steps, w, h)
    if bf > 1 and val > node.left.val:
        steps.append(_avl_snap(node, w, h, hl=[node.id, node.left.id],
                                rotation="LR (Left-Right Rotation)", msg="LR: first rotate left on left child"))
        node.left = _avl_rot_left(node.left, steps, w, h)
        return _avl_rot_right(node, steps, w, h)
    if bf < -1 and val < node.right.val:
        steps.append(_avl_snap(node, w, h, hl=[node.id, node.right.id],
                                rotation="RL (Right-Left Rotation)", msg="RL: first rotate right on right child"))
        node.right = _avl_rot_right(node.right, steps, w, h)
        return _avl_rot_left(node, steps, w, h)
    return node

def _avl_min_node(n):
    while n.left:
        n = n.left
    return n

def _avl_delete(node, val, steps, w, h):
    if not node:
        return node
    steps.append(_avl_snap(node, w, h, hl=[node.id], msg=f"Search to delete {val}: at {node.val}"))
    if val < node.val:
        node.left = _avl_delete(node.left, val, steps, w, h)
    elif val > node.val:
        node.right = _avl_delete(node.right, val, steps, w, h)
    else:
        if not node.left or not node.right:
            node = node.left or node.right
        else:
            successor = _avl_min_node(node.right)
            node.val = successor.val
            node.right = _avl_delete(node.right, successor.val, steps, w, h)
    if not node:
        return node
    _avl_update_h(node)
    bf = _avl_bf(node)
    if bf > 1 and _avl_bf(node.left) >= 0:
        return _avl_rot_right(node, steps, w, h)
    if bf > 1 and _avl_bf(node.left) < 0:
        node.left = _avl_rot_left(node.left, steps, w, h)
        return _avl_rot_right(node, steps, w, h)
    if bf < -1 and _avl_bf(node.right) <= 0:
        return _avl_rot_left(node, steps, w, h)
    if bf < -1 and _avl_bf(node.right) > 0:
        node.right = _avl_rot_right(node.right, steps, w, h)
        return _avl_rot_left(node, steps, w, h)
    return node

def _avl_search(node, val, steps, w, h):
    if not node:
        return False, steps
    steps.append(_avl_snap(node, w, h, hl=[node.id], msg=f"Searching {val}: at {node.val}"))
    if val == node.val:
        return True, steps
    elif val < node.val:
        return _avl_search(node.left, val, steps, w, h)
    else:
        return _avl_search(node.right, val, steps, w, h)

@app.post("/api/avl")
def avl_endpoint(req: TreeRequest):
    _AVLNode._counter = 0
    w, h = req.width, req.height
    steps = []

    # Build initial tree
    root = None
    for v in req.values:
        root = _avl_insert(root, v, [], w, h)  # silent build

    if req.operation == "insert" and req.target is not None:
        val = req.target
        root = _avl_insert(root, val, steps, w, h)
        vm, cm = _avl_collect(root)
        steps.append(_make_step(vm, {}, cm, root.id if root else None, w, h,
                                 msg=f"Inserted {val}. Tree is balanced."))
        return {"found": True, "steps": steps, "nodes": [], "edges": [],
                "message": f"Inserted {val} into AVL Tree."}

    elif req.operation == "delete" and req.target is not None:
        val = req.target
        root = _avl_delete(root, val, steps, w, h)
        vm, cm = _avl_collect(root) if root else ({}, {})
        if root:
            steps.append(_make_step(vm, {}, cm, root.id, w, h, msg=f"Deleted {val}. Tree rebalanced."))
        else:
            steps.append({"nodes": [], "edges": [], "highlights": [], "rotation": None, "message": "Tree is now empty."})
        return {"found": True, "steps": steps, "nodes": [], "edges": [],
                "message": f"Deleted {val} from AVL Tree."}

    elif req.operation == "search" and req.target is not None:
        val = req.target
        found, steps = _avl_search(root, val, steps, w, h)
        return {"found": found, "steps": steps, "nodes": [], "edges": [],
                "message": f"{'Found' if found else 'Not found'}: {val}"}

    # Fallback
    vm, cm = _avl_collect(root) if root else ({}, {})
    snap = _make_step(vm, {}, cm, root.id if root else None, w, h, msg="AVL Tree ready.")
    return {"found": True, "steps": [snap], "nodes": snap["nodes"], "edges": snap["edges"],
            "message": "AVL Tree ready."}


# ---- Min Heap ----
class _HeapEngine:
    def __init__(self, values):
        self.data = list(values)
        # Build heap
        n = len(self.data)
        for i in range(n // 2 - 1, -1, -1):
            self._sift_down(i, n)

    def _sift_down(self, i, n):
        while True:
            smallest = i
            l, r = 2*i+1, 2*i+2
            if l < n and self.data[l] < self.data[smallest]: smallest = l
            if r < n and self.data[r] < self.data[smallest]: smallest = r
            if smallest == i: break
            self.data[i], self.data[smallest] = self.data[smallest], self.data[i]
            i = smallest

    def _sift_up(self, i):
        while i > 0:
            parent = (i - 1) // 2
            if self.data[i] < self.data[parent]:
                self.data[i], self.data[parent] = self.data[parent], self.data[i]
                i = parent
            else:
                break

def _heap_to_tree_nodes(arr, w, h):
    n = len(arr)
    if n == 0:
        return [], []
    # Assign positions: level-order layout
    nodes, edges = [], []
    max_depth = math.floor(math.log2(n)) if n > 0 else 0
    total_levels = max_depth + 1
    level_h = h / (total_levels + 1)
    for i in range(n):
        depth = math.floor(math.log2(i + 1)) if i > 0 else 0
        level_count = 2 ** depth
        level_start = 2 ** depth - 1
        pos_in_level = i - level_start
        col_w = w / (level_count + 1)
        x = (pos_in_level + 1) * col_w
        y = (depth + 1) * level_h
        nodes.append({"id": i, "val": arr[i], "x": round(x, 1), "y": round(y, 1), "color": "rgba(148,163,184,0.5)"})
        parent_i = (i - 1) // 2
        if i > 0:
            edges.append({"from": parent_i, "to": i})
    return nodes, edges

def _heap_step(arr, w, h, highlights=None, rotation=None, message=""):
    nodes, edges = _heap_to_tree_nodes(arr, w, h)
    return {"nodes": nodes, "edges": edges, "highlights": highlights or [],
            "rotation": rotation, "message": message}

@app.post("/api/heap")
def heap_endpoint(req: TreeRequest):
    w, h = req.width, req.height
    steps = []
    engine = _HeapEngine(req.values)

    if req.operation == "insert" and req.target is not None:
        val = req.target
        engine.data.append(val)
        i = len(engine.data) - 1
        steps.append(_heap_step(list(engine.data), w, h, [i], msg=f"Pushed {val} at position {i}"))
        # Heapify up
        while i > 0:
            parent = (i - 1) // 2
            steps.append(_heap_step(list(engine.data), w, h, [i, parent],
                                     msg=f"Heapify-up: compare {engine.data[i]} with parent {engine.data[parent]}"))
            if engine.data[i] < engine.data[parent]:
                engine.data[i], engine.data[parent] = engine.data[parent], engine.data[i]
                steps.append(_heap_step(list(engine.data), w, h, [i, parent],
                                         msg=f"Swapped {engine.data[parent]} and {engine.data[i]}"))
                i = parent
            else:
                break
        steps.append(_heap_step(list(engine.data), w, h, [], msg=f"Push complete. Min={engine.data[0]}"))
        return {"found": True, "steps": steps, "nodes": [], "edges": [],
                "message": f"Pushed {val}. New min = {engine.data[0]}"}

    elif req.operation == "pop":
        if not engine.data:
            return {"found": False, "steps": [], "nodes": [], "edges": [],
                    "message": "Heap is empty."}
        popped = engine.data[0]
        n = len(engine.data)
        steps.append(_heap_step(list(engine.data), w, h, [0], msg=f"Pop min={popped}"))
        engine.data[0] = engine.data[-1]
        engine.data.pop()
        n -= 1
        steps.append(_heap_step(list(engine.data), w, h, [0], msg=f"Moved last element to root"))
        # Heapify down
        i = 0
        while True:
            smallest = i
            l, r = 2*i+1, 2*i+2
            cmp_hl = [i]
            if l < n: cmp_hl.append(l)
            if r < n: cmp_hl.append(r)
            steps.append(_heap_step(list(engine.data), w, h, cmp_hl,
                                     msg=f"Heapify-down at {i} (val={engine.data[i] if i < n else '?'})"))
            if l < n and engine.data[l] < engine.data[smallest]: smallest = l
            if r < n and engine.data[r] < engine.data[smallest]: smallest = r
            if smallest == i: break
            engine.data[i], engine.data[smallest] = engine.data[smallest], engine.data[i]
            steps.append(_heap_step(list(engine.data), w, h, [i, smallest],
                                     msg=f"Swapped {engine.data[i]} and {engine.data[smallest]}"))
            i = smallest
        steps.append(_heap_step(list(engine.data), w, h, [], msg=f"Pop complete. Removed {popped}."))
        new_min = engine.data[0] if engine.data else "—"
        return {"found": True, "steps": steps, "nodes": [], "edges": [],
                "message": f"Popped {popped}. New min = {new_min}"}

    # Fallback
    snap = _heap_step(list(engine.data), w, h, msg="Heap ready.")
    return {"found": True, "steps": [snap], "nodes": snap["nodes"], "edges": snap["edges"],
            "message": "Min Heap ready."}
